import { NextRequest, NextResponse } from "next/server";
import { REAPA_SYSTEM_PROMPT } from "@/prompts";
import { rateLimit, getClientId } from "@/lib/rate-limit";
import { runNLPPipeline } from "@/lib/ai/nlp-pipeline";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

// BUG-039/BUG-037: nodejs runtime — process.env resolved at runtime
export const runtime = "nodejs";

// ── Input validation ──────────────────────────────────────────────────────────
interface ChatMessage { role: "user" | "assistant"; content: string; }

function validateInput(body: unknown): { messages: ChatMessage[] } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (!Array.isArray(b.messages)) return null;
  if (b.messages.length === 0 || b.messages.length > 50) return null;
  for (const msg of b.messages) {
    if (!msg || typeof msg !== "object") return null;
    const m = msg as Record<string, unknown>;
    if (!["user", "assistant"].includes(m.role as string)) return null;
    if (typeof m.content !== "string") return null;
    if ((m.content as string).length > 4000) return null;
  }
  return { messages: b.messages as ChatMessage[] };
}

// ── BUG-015/BUG-042: Auth — enforcement deferred to v1.1 ─────────────────────
function checkAuth(req: NextRequest): boolean {
  if (process.env.REAPA_API_KEY && process.env.NODE_ENV === "production") {
    const provided =
      req.headers.get("x-api-key") ??
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!provided) {
      console.info("[ai/chat] unauthenticated public request — allowed (enforcement deferred to v1.1)");
    }
  }
  return true;
}

// ── Stage 5: NLP context builder ──────────────────────────────────────────────
interface NLPEntity { value: string; }
interface NLPResult {
  language: string; intent: string; intentConfidence: number;
  entities: {
    budget?: NLPEntity; location?: NLPEntity; timeline?: NLPEntity;
    bedrooms?: NLPEntity; propertyType?: NLPEntity;
  };
  leadTemperature: string; overallConfidence: number;
}

function buildNLPContext(nlp: NLPResult): string {
  const ctx: Record<string, string | number> = {
    language: nlp.language, intent: nlp.intent,
    confidence: nlp.intentConfidence, temperature: nlp.leadTemperature,
  };
  if (nlp.entities.budget?.value)       ctx.budget       = nlp.entities.budget.value;
  if (nlp.entities.location?.value)     ctx.location     = nlp.entities.location.value;
  if (nlp.entities.timeline?.value)     ctx.timeline     = nlp.entities.timeline.value;
  if (nlp.entities.bedrooms?.value)     ctx.bedrooms     = nlp.entities.bedrooms.value;
  if (nlp.entities.propertyType?.value) ctx.propertyType = nlp.entities.propertyType.value;
  return `User context: ${JSON.stringify(ctx)}`;
}

export async function POST(req: NextRequest) {
  // ── BUG-016: Distributed rate limiting via Supabase RPC ──────────────────
  const clientId = getClientId(req);
  const rl = await rateLimit(clientId, { maxRequests: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests", retryAfter: Math.ceil(rl.retryAfterMs / 1000) },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // ── BUG-015/BUG-042: Auth (log-only — enforcement in v1.1) ───────────────
  checkAuth(req);

  // ── Input validation ──────────────────────────────────────────────────────
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const validated = validateInput(body);
  if (!validated) {
    return NextResponse.json(
      { error: "Invalid input: messages must be an array of {role, content} (max 50, max 4000 chars each)" },
      { status: 400 }
    );
  }

  const { messages } = validated;
  const lastUserMessage = messages.findLast((m) => m.role === "user")?.content ?? "";

  // ── Stage 5: NLP pipeline → system prompt enrichment ─────────────────────
  let systemPrompt = REAPA_SYSTEM_PROMPT();
  try {
    const nlp = await runNLPPipeline(lastUserMessage);
    systemPrompt = `${systemPrompt}\n\n${buildNLPContext(nlp as NLPResult)}`;
  } catch (e) {
    console.warn("[ai/chat] NLP pipeline failed (non-fatal):", e);
  }

  const rateLimitHeaders = { "X-RateLimit-Remaining": String(rl.remaining) };

  // ── BUG-018/BUG-019: Gemini 2.5 Flash via @ai-sdk/google ─────────────────
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json(
      { error: "No AI provider configured. Set GEMINI_API_KEY." },
      { status: 503 }
    );
  }

  const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey });
  const result = streamText({
    model: googleAI("gemini-2.5-flash"),
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    maxTokens: 4096,
    temperature: 0.7,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.textStream) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
          );
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      ...rateLimitHeaders,
    },
  });
}
