import { NextRequest, NextResponse } from "next/server";
import { REAPA_SYSTEM_PROMPT } from "@/prompts";
import { rateLimit, getClientId } from "@/lib/rate-limit";
import { runNLPPipeline } from "@/lib/ai/nlp-pipeline";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

// BUG-039/BUG-037: nodejs runtime — process.env resolved at runtime
export const runtime = "nodejs";

// ── Input validation ────────────────────────────────────────────────────────
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

// ── BUG-015: Auth check (REAPA_API_KEY env var must be set in prod) ─────────
function checkAuth(req: NextRequest): boolean {
  const apiKey = process.env.REAPA_API_KEY;
  if (!apiKey) {
    // Key not configured — open (rate limiting is primary defence in this state)
    if (process.env.NODE_ENV === "production") {
      console.warn("[ai/chat] REAPA_API_KEY not set in production — endpoint is open");
    }
    return true;
  }
  const provided =
    req.headers.get("x-api-key") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  // TODO: Replace with Supabase JWT session check once auth is live (v1.1)
  return provided === apiKey;
}

// ── Stage 5: NLP context builder ────────────────────────────────────────────
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
  // ── BUG-016: Distributed rate limiting via Supabase RPC ─────────────────
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

  // ── BUG-015: Auth ────────────────────────────────────────────────────────
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Input validation ─────────────────────────────────────────────────────
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

  // ── Stage 5: NLP pipeline → system prompt enrichment ────────────────────
  let systemPrompt = REAPA_SYSTEM_PROMPT();
  try {
    const nlp = await runNLPPipeline(lastUserMessage);
    systemPrompt = `${systemPrompt}\n\n${buildNLPContext(nlp as NLPResult)}`;
  } catch (e) {
    console.warn("[ai/chat] NLP pipeline failed (non-fatal):", e);
  }

  const rateLimitHeaders = { "X-RateLimit-Remaining": String(rl.remaining) };

  // ── BUG-018: Gemini via @ai-sdk/google (replaces brittle SSE parser) ─────
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey });
      // BUG-019: maxTokens raised 1024 → 4096 (supports listing copy, compliance docs)
      const result = streamText({
        model: googleAI("gemini-2.5-flash"),
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        maxTokens: 4096,
        temperature: 0.7,
      });

      // Transform SDK textStream → existing data: {"text":"..."} SSE format
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
    } catch (e) {
      console.warn("[ai/chat] Gemini failed, trying Groq:", e);
    }
  }

  // ── Groq Llama fallback ──────────────────────────────────────────────────
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          max_tokens: 4096, // BUG-019
          temperature: 0.7,
          stream: true,
        }),
      });
      if (!groqRes.ok || !groqRes.body) throw new Error(`Groq ${groqRes.status}`);
      return new Response(groqRes.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          ...rateLimitHeaders,
        },
      });
    } catch (e) {
      console.warn("[ai/chat] Groq failed:", e);
    }
  }

  return NextResponse.json(
    { error: "No AI provider configured. Set GEMINI_API_KEY or GROQ_API_KEY." },
    { status: 503 }
  );
}
