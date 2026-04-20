/**
 * NLP Stage 6 — Gemini 2.5 Flash structured JSON extraction + Supabase persistence
 * Extracts a LeadProfile from a conversation array, non-blocking.
 * Uses response_mime_type: application/json (Google JSON mode).
 */
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createAdminClient } from "@/lib/supabase/server";

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

const NULL_PROFILE: LeadProfile = {
  budgetRange: null,
  propertyType: null,
  timelineUrgency: "unknown",
  locationPreference: null,
  contactIntent: "unknown",
};

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
  if (!messages.length || !apiKey) return NULL_PROFILE;

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

    if (typeof parsed.timelineUrgency !== "string") return NULL_PROFILE;
    if (typeof parsed.contactIntent !== "string") return NULL_PROFILE;

    return {
      budgetRange: parsed.budgetRange ?? null,
      propertyType: parsed.propertyType ?? null,
      timelineUrgency: parsed.timelineUrgency ?? "unknown",
      locationPreference: parsed.locationPreference ?? null,
      contactIntent: parsed.contactIntent ?? "unknown",
    };
  } catch {
    return NULL_PROFILE;
  }
}

/**
 * Persist a LeadProfile to Supabase lead_profiles table.
 * Upserts by conversation_id — safe to call multiple times for the same session.
 * Never throws — logs errors but does not surface them to the caller.
 */
export async function persistLeadProfile(
  conversationId: string,
  profile: LeadProfile
): Promise<void> {
  if (!conversationId) return;
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("lead_profiles").upsert(
      {
        conversation_id: conversationId,
        budget_range: profile.budgetRange,
        property_type: profile.propertyType,
        timeline_urgency: profile.timelineUrgency,
        location_preference: profile.locationPreference,
        contact_intent: profile.contactIntent,
        extracted_at: new Date().toISOString(),
      },
      { onConflict: "conversation_id" }
    );
    if (error) {
      console.warn("[stage6] Supabase upsert error (non-fatal):", error.message);
    }
  } catch (err) {
    console.warn("[stage6] persistLeadProfile failed (non-fatal):", err);
  }
}
