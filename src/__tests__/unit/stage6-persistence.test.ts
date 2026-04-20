/**
 * Unit tests for S12-6: LeadProfile persistence via persistLeadProfile()
 * Verifies Supabase upsert is called with the correct shape after 3-message conversation.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Supabase mock ─────────────────────────────────────────────────────────────
const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockFrom = vi.fn(() => ({ upsert: mockUpsert }));

describe("persistLeadProfile — Stage 6 persistence", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createAdminClient: vi.fn(() => ({ from: mockFrom })),
    }));
    vi.doMock("@ai-sdk/google", () => ({
      createGoogleGenerativeAI: vi.fn().mockReturnValue(
        vi.fn().mockReturnValue("gemini-mock-model")
      ),
    }));
    vi.doMock("ai", () => ({
      generateText: vi.fn().mockResolvedValue({
        text: JSON.stringify({
          budgetRange: "400K-700K",
          propertyType: "apartment",
          timelineUrgency: "1-3months",
          locationPreference: "Sliema",
          contactIntent: "researching",
        }),
      }),
    }));
    mockUpsert.mockClear();
    mockFrom.mockClear();
  });

  it("upserts LeadProfile to Supabase after 3-message Malta property conversation", async () => {
    const { extractLeadProfile, persistLeadProfile } = await import("@/lib/nlp/stage6-extractor");

    const messages = [
      { role: "user" as const, content: "Looking for a 2-bed apartment in Sliema" },
      { role: "assistant" as const, content: "Great! What is your budget range?" },
      { role: "user" as const, content: "Around €500K, looking to buy in 3 months" },
    ];

    const profile = await extractLeadProfile(messages, "test-key");
    await persistLeadProfile("conv-test-001", profile);

    // Supabase from("lead_profiles") called
    expect(mockFrom).toHaveBeenCalledWith("lead_profiles");

    // upsert called with correct shape
    expect(mockUpsert).toHaveBeenCalledTimes(1);
    const [upsertArg] = mockUpsert.mock.calls[0];
    expect(upsertArg).toMatchObject({
      conversation_id: "conv-test-001",
      budget_range: "400K-700K",
      property_type: "apartment",
      timeline_urgency: "1-3months",
      location_preference: "Sliema",
      contact_intent: "researching",
    });
    expect(typeof upsertArg.extracted_at).toBe("string");
  });

  it("upserts with correct onConflict option to enable idempotent updates", async () => {
    const { extractLeadProfile, persistLeadProfile } = await import("@/lib/nlp/stage6-extractor");

    const profile = await extractLeadProfile(
      [{ role: "user", content: "Villa in Mellieha, 1M budget" }],
      "test-key"
    );
    await persistLeadProfile("conv-idempotent-002", profile);

    const [, upsertOptions] = mockUpsert.mock.calls[0];
    expect(upsertOptions).toMatchObject({ onConflict: "conversation_id" });
  });

  it("does not call Supabase when conversationId is empty", async () => {
    const { extractLeadProfile, persistLeadProfile } = await import("@/lib/nlp/stage6-extractor");
    const profile = await extractLeadProfile(
      [{ role: "user", content: "test" }], "test-key"
    );
    await persistLeadProfile("", profile);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("does not throw when Supabase returns an error (non-fatal)", async () => {
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createAdminClient: vi.fn(() => ({
        from: vi.fn(() => ({
          upsert: vi.fn().mockResolvedValue({ error: { message: "DB error" } }),
        })),
      })),
    }));
    vi.doMock("@ai-sdk/google", () => ({
      createGoogleGenerativeAI: vi.fn().mockReturnValue(vi.fn().mockReturnValue("model")),
    }));
    vi.doMock("ai", () => ({
      generateText: vi.fn().mockResolvedValue({ text: '{"budgetRange":null,"propertyType":null,"timelineUrgency":"unknown","locationPreference":null,"contactIntent":"unknown"}' }),
    }));

    const { extractLeadProfile, persistLeadProfile } = await import("@/lib/nlp/stage6-extractor");
    const profile = await extractLeadProfile([{ role: "user", content: "test" }], "key");

    // Must not throw despite DB error
    await expect(persistLeadProfile("conv-003", profile)).resolves.toBeUndefined();
  });
});
