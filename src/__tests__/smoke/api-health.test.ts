/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";

// Mock Supabase to prevent real DB connections in test environment
vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowser: vi.fn(),
  isSupabaseConfigured: vi.fn().mockReturnValue(false),
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: vi.fn(),
  createServerClient: vi.fn(),
}));

describe("API route health — /api/chat/qualify", () => {
  it("GET returns initial chat message", async () => {
    const { GET } = await import("@/app/api/chat/qualify/route");
    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("message");
    expect(data).toHaveProperty("state");
    expect(data.state).toMatchObject({ step: 0, score: 0 });
    expect(data.message).toContain("REAPA");
  });

  it("POST returns correct response for buy intent", async () => {
    const { POST } = await import("@/app/api/chat/qualify/route");
    const req = new Request("http://localhost/api/chat/qualify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "I want to buy a property" }],
        state: { step: 0, score: 0 },
      }),
    });
    const response = await POST(req as any);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("message");
    expect(data).toHaveProperty("state");
    expect(data.state.step).toBe(1);
    expect(data.state.intent).toBe("buy");
    expect(data.state.score).toBeGreaterThan(0);
  });

  it("POST returns isComplete=true at end of flow", async () => {
    const { POST } = await import("@/app/api/chat/qualify/route");
    const req = new Request("http://localhost/api/chat/qualify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "John Smith, +356 79123456" }],
        state: { step: 5, score: 85, intent: "buy", timeline: "1month", budget: "400K-700K", location: "Sliema", financing: "pre-approved" },
      }),
    });
    const response = await POST(req as any);
    const data = await response.json();
    expect(data.isComplete).toBe(true);
    expect(data.lead).toBeDefined();
    expect(["hot", "warm", "cold", "ice"]).toContain(data.temperature);
  });
});
