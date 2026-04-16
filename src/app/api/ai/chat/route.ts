import { NextRequest, NextResponse } from "next/server";
import { REAPA_SYSTEM_PROMPT } from "@/prompts";
import { rateLimit, getClientId } from "@/lib/rate-limit";
import { runNLPPipeline } from "@/lib/ai/nlp-pipeline";

// Fix 1: nodejs runtime — process.env resolved at runtime, not build time
export const runtime = "nodejs";

// ── Input validation ────────────────────────────────────────────────────────────────────────────
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

// ── Auth check ──────────────────────────────────────────────────────────────────────────────────
function checkAuth(req: NextRequest): boolean {
  const apiKey = process.env.REAPA_API_KEY;
  if (!apiKey) return true; // No key configured – open in dev (rate limiting still applies)
  const provided = req.headers.get("x-api-key") ?? req.headers.get("authorization")?.replace("Bearer ", "");
  // TODO: Replace with Supabase session check once auth is live
  return provided === apiKey;
}

// ── Stage 5: build NLP context string for system prompt injection ───────────────────────────────
interface NLPEntity { value: string; }
interface NLPResult {
  language: string;
  intent: string;
  intentConfidence: number;
  entities: {
    budget?: NLPEntity;
    location?: NLPEntity;
    timeline?: NLPEntity;
    bedrooms?: NLPEntity;
    propertyType?: NLPEntity;
  };
  leadTemperature: string;
  overallConfidence: number;
}

function buildNLPContext(nlp: NLPResult): string {
  const ctx: Record<string, string | number> = {
    language: nlp.language,
    intent: nlp.intent,
    confidence: nlp.intentConfidence,
    temperature: nlp.leadTemperature,
  };
  if (nlp.entities.budget?.value)       ctx.budget       = nlp.entities.budget.value;
  if (nlp.entities.location?.value)     ctx.location     = nlp.entities.location.value;
  if (nlp.entities.timeline?.value)     ctx.timeline     = nlp.entities.timeline.value;
  if (nlp.entities.bedrooms?.value)     ctx.bedrooms     = nlp.entities.bedrooms.value;
  if (nlp.entities.propertyType?.value) ctx.propertyType = nlp.entities.propertyType.value;
  return `User context: ${JSON.stringify(ctx)}`;
}

export async function POST(req: NextRequest) {
  // ── Rate limiting: 20 req/min per IP ────────────────────────────────────────────────────────
  const clientId = getClientId(req);
  const rl = rateLimit(clientId, { maxRequests: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests", retryAfter: Math.ceil(rl.retryAfterMs / 1000) },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)),
          "X-RateLimit-Remaining": String(rl.remaining),
        },
      }
    );
  }

  // ── Auth ─────────────────────────────────────────────────────────────────────────────────────
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Input validation ─────────────────────────────────────────────────────────────────────────
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const validated = validateInput(body);
  if (!validated) {
    return NextResponse.json(
      { error: "Invalid input: messages must be an array of {role, content} objects (max 50, max 4000 chars each)" },
      { status: 400 }
    );
  }

  const { messages } = validated;
  const lastUserMessage = messages.findLast((m) => m.role === "user")?.content ?? "";

  // ── Stage 5: NLP pipeline → inject enriched context into system prompt ───────────────────────
  let systemPrompt = REAPA_SYSTEM_PROMPT();
  try {
    const nlp = await runNLPPipeline(lastUserMessage);
    const nlpContext = buildNLPContext(nlp as NLPResult);
    systemPrompt = `${systemPrompt}\n\n${nlpContext}`;
  } catch (e) {
    console.warn("[ai/chat] NLP pipeline failed (non-fatal, continuing without context):", e);
  }

  // ── Gemini 2.5 Flash (primary) -- BUG-039: 2.0 deprecated for new API keys ────────────────────────────────────────
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const contents = [
        { role: "user" as const, parts: [{ text: systemPrompt }] },
        { role: "model" as const, parts: [{ text: "Understood. I am REAPA, ready to assist." }] },
        ...messages.map((m) => ({
          role: m.role === "user" ? ("user" as const) : ("model" as const),
          parts: [{ text: m.content }],
        })),
      ];

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${geminiKey}&alt=sse`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
        }
      );

      if (!geminiRes.ok || !geminiRes.body) throw new Error(`Gemini ${geminiRes.status}`);

      // Stream SSE → transform to plain text stream
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const reader = geminiRes.body!.getReader();
          const decoder = new TextDecoder();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) { controller.close(); break; }
              const chunk = decoder.decode(value);
              for (const line of chunk.split("\n")) {
                if (line.startsWith("data: ")) {
                  try {
                    const json = JSON.parse(line.slice(6));
                    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                  } catch { /* skip malformed SSE */ }
                }
              }
            }
          } catch (e) { controller.error(e); }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-RateLimit-Remaining": String(rl.remaining),
        },
      });
    } catch (e) {
      console.warn("[ai/chat] Gemini failed, trying Groq:", e);
    }
  }

  // ── Groq Llama fallback ──────────────────────────────────────────────────────────────────────
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          max_tokens: 1024,
          temperature: 0.7,
          stream: true,
        }),
      });
      if (!groqRes.ok || !groqRes.body) throw new Error(`Groq ${groqRes.status}`);
      return new Response(groqRes.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "X-RateLimit-Remaining": String(rl.remaining),
        },
      });
    } catch (e) {
      console.warn("[ai/chat] Groq failed:", e);
    }
  }

  return NextResponse.json({ error: "No AI provider configured. Set GEMINI_API_KEY or GROQ_API_KEY." }, { status: 503 });
}
