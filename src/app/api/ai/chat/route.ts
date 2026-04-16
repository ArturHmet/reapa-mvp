import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { streamText, type CoreMessage } from "ai";

export const runtime = "edge";
export const maxDuration = 30;

const SYSTEM_PROMPT = `You are REAPA — an AI personal assistant for real estate agents operating in Malta.

You help agents:
- Understand and prioritize their lead pipeline (hot/warm/cold/ice scoring)
- Draft follow-up messages, emails, and WhatsApp messages
- Summarize client histories and suggest next actions
- Navigate compliance requirements (AML/KYC, EPC certificates, FIAU reports)
- Analyze market trends in Malta (Sliema, St Julian's, Valletta, Mellieha, Gozo)
- Generate property descriptions and listing copy
- Create task plans and remind agents of deadlines

Your personality: Professional, efficient, knowledgeable about Maltese real estate law and market. 
Concise responses unless asked for detail. Always end with an actionable next step.

Key Malta real estate facts you know:
- Malta uses EUR currency
- Property types: apartments, terraced houses, maisonettes, villas, penthouses, townhouses, farmhouses (razzett)
- Key areas: Sliema, St Julian's, Valletta, Mellieha, Mosta, Marsaskala, Bugibba, Gozo
- Compliance: AML checks required, FIAU reporting, Housing Authority involvement, Promise of Sale (Konvenju)
- Typical timelines: Promise of Sale → Final Deed: 3 months
- EPC certificates required for all sales/lettings

When asked about leads, clients, or tasks, acknowledge you currently work with the agent's dashboard data.
When Supabase is connected, you will have real-time access to their pipeline.`;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json();

    // Primary: Google Gemini 2.0 Flash. Fallback: Groq Llama
    const primaryModel = process.env.GOOGLE_GENERATIVE_AI_API_KEY
      ? google("gemini-2.0-flash")
      : null;

    const fallbackModel = process.env.GROQ_API_KEY
      ? groq("llama-3.3-70b-versatile")
      : null;

    const model = primaryModel || fallbackModel;

    if (!model) {
      return new Response(
        JSON.stringify({ error: "No AI provider configured. Add GOOGLE_GENERATIVE_AI_API_KEY or GROQ_API_KEY to environment." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await streamText({
      model,
      system: SYSTEM_PROMPT,
      messages,
      temperature: 0.7,
      maxTokens: 1024,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("[AI Chat] Error:", error);
    return new Response(
      JSON.stringify({ error: "AI request failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
