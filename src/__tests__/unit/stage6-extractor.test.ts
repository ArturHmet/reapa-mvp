/**
 * Unit tests for NLP Stage 6 — extractLeadProfile
 * Mocks @ai-sdk/google + ai to avoid real Gemini calls.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const MOCK_LEAD_PROFILE = {
  budgetRange: "400K-700K",
  propertyType: "apartment",
  timelineUrgency: "1-3months",
  locationPreference: "Sliema",
  contactIntent: "researching",
};

describe("extractLeadProfile — Stage 6", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("@ai-sdk/google", () => ({
      createGoogleGenerativeAI: vi.fn().mockReturnValue(
        vi.fn().mockReturnValue("gemini-mock-model")
      ),
    }));
    vi.doMock("ai", () => ({
      generateText: vi.fn().mockResolvedValue({
        text: JSON.stringify(MOCK_LEAD_PROFILE),
      }),
    }));
  });

  it("extracts a LeadProfile from a 3-message Malta real estate conversation", async () => {
    const { extractLeadProfile } = await import("@/lib/nlp/stage6-extractor");

    const messages = [
      { role: "user" as const, content: "I'm looking to buy a 2-bed apartment in Sliema" },
      { role: "assistant" as const, content: "Great choice! Sliema is very popular. What's your budget range?" },
      { role: "user" as const, content: "Around 500K, and I'd like to move in within 3 months" },
    ];

    const profile = await extractLeadProfile(messages, "test-gemini-key");

    expect(profile.budgetRange).toBe("400K-700K");
    expect(profile.propertyType).toBe("apartment");
    expect(profile.timelineUrgency).toBe("1-3months");
    expect(profile.locationPreference).toBe("Sliema");
    expect(profile.contactIntent).toBe("researching");
  });

  it("returns null profile on empty messages without calling Gemini", async () => {
    const { extractLeadProfile } = await import("@/lib/nlp/stage6-extractor");
    const profile = await extractLeadProfile([], "test-key");
    expect(profile.budgetRange).toBeNull();
    expect(profile.propertyType).toBeNull();
    expect(profile.timelineUrgency).toBe("unknown");
    expect(profile.contactIntent).toBe("unknown");
  });

  it("returns null profile when apiKey is missing", async () => {
    const { extractLeadProfile } = await import("@/lib/nlp/stage6-extractor");
    const profile = await extractLeadProfile(
      [{ role: "user", content: "I want a villa" }],
      ""
    );
    expect(profile.budgetRange).toBeNull();
    expect(profile.timelineUrgency).toBe("unknown");
  });

  it("returns null profile gracefully when Gemini returns malformed JSON", async () => {
    vi.resetModules();
    vi.doMock("@ai-sdk/google", () => ({
      createGoogleGenerativeAI: vi.fn().mockReturnValue(vi.fn().mockReturnValue("model")),
    }));
    vi.doMock("ai", () => ({
      generateText: vi.fn().mockResolvedValue({ text: "not-json{{" }),
    }));
    const { extractLeadProfile } = await import("@/lib/nlp/stage6-extractor");
    const profile = await extractLeadProfile(
      [{ role: "user", content: "Hello" }], "key"
    );
    expect(profile.timelineUrgency).toBe("unknown");
    expect(profile.budgetRange).toBeNull();
  });

  it("returns null profile gracefully when Gemini throws", async () => {
    vi.resetModules();
    vi.doMock("@ai-sdk/google", () => ({
      createGoogleGenerativeAI: vi.fn().mockReturnValue(vi.fn().mockReturnValue("model")),
    }));
    vi.doMock("ai", () => ({
      generateText: vi.fn().mockRejectedValue(new Error("network error")),
    }));
    const { extractLeadProfile } = await import("@/lib/nlp/stage6-extractor");
    const profile = await extractLeadProfile(
      [{ role: "user", content: "Hello" }], "key"
    );
    expect(profile.timelineUrgency).toBe("unknown");
  });
});
