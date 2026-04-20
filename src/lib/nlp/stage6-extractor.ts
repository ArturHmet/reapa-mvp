/**
 * NLP Stage 6 — Gemini 2.5 Flash structured JSON extraction
 * Extracts a LeadProfile from a conversation array, non-blocking.
 * Uses response_mime_type: application/json (Google JSON mode).
 */
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

export interface LeadProfile {
  /** Budget range e.g. "400K-700K", "1M+", "under-200K", or null */
  budgetRange: string | null;
  /** Property type: "apartment" | "villa" | "townhouse" | "penthouse" | "land" | "commercial" | null */
  propertyType: string | null;
  /** How urgently they want to transact */
  timelineUrgency: "immediate" | "1-3months" | "3-6months" | "6plus" | "unknown";
  /** Specific location preference, e.g. "Sliema", "Valletta", or null */
  locationPreference: string | null;
  /** Readiness to be contacted by an agent */
  contactIntent: "ready_to_contact" | "researching" | "just_browsing" | "unknown";
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are a real estate lead analysis engine for REAPA, a Malta property AI platform.
Analyse the conversation and return ONLY a valid JSON object — no markdown, no explanation.

Required fields:
- budgetRange: string | null  (e.g. "under-200K", "200K-400K", "400K-700K", "700K-1M", "1M+")
- propertyType: string | null (e.g. "apartment", "villa", "townhouse", "penthouse", "land", "commercial")
- timelineUrgency: "immediate" | "1-3months" | "3-6months" | "6plus" | "unknown"
- locationPreference: string | null (specific Malta location mentioned, e.g. "Sliema", "Valletta", "St. Julian's")
- contactIntent: "ready_to_contact" | "researching" | "just_browsing" | "unknown"

Return exactly this JSON shape with no extra fields.`;

/**
 * Extract a LeadProfile from a conversation. Never throws — returns nulled profile on failure.
 */
export async function extractLeadProfile(
  messages: ChatMessage[],
  apiKey: string
): Promise<LeadProfile> {
  const nullProfile: LeadProfile = {
    budgetRange: null,
    propertyType: null,
    timelineUrgency: "unknown",
    locationPreference: null,
    contactIntent: "unknown",
  };

  if (!messages.length || !apiKey) return nullProfile;

  const conversationText = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  try {
    const googleAI = createGoogleGenerativeAI({ apiKey });

    const { text } = await generateText({
      model: googleAI("gemini-2.5-flash"),
      system: SYSTEM_PROMPT,
      prompt: `CONVERSATION:\n${conversationText}\n\nExtract the LeadProfile JSON:`,
      temperature: 0.1,
      maxTokens: 256,
      // Google JSON mode — response_mime_type: application/json
      providerOptions: {
        google: { responseMimeType: "application/json" },
      },
    });

    const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(cleaned) as LeadProfile;

    // Validate required keys exist
    if (typeof parsed.timelineUrgency !== "string") return nullProfile;
    if (typeof parsed.contactIntent !== "string") return nullProfile;

    return {
      budgetRange: parsed.budgetRange ?? null,
      propertyType: parsed.propertyType ?? null,
      timelineUrgency: parsed.timelineUrgency ?? "unknown",
      locationPreference: parsed.locationPreference ?? null,
      contactIntent: parsed.contactIntent ?? "unknown",
    };
  } catch {
    return nullProfile;
  }
}
