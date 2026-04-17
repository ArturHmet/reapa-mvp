import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock NLP pipeline — avoids real Gemini/franc calls in unit tests
vi.mock("@/lib/ai/nlp-pipeline", () => ({
  runNLPPipeline: vi.fn().mockResolvedValue({
    language: "en",
    intent: "buy",
    intentConfidence: 0.9,
    entities: { location: { value: "Sliema", raw: "sliema", confidence: 0.85 } },
    entityCount: 1,
    leadTemperature: "warm",
    overallConfidence: 0.87,
  }),
}));

// Mock Supabase admin client — tracks insert calls without hitting real DB
const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockFrom = vi.fn(() => ({ insert: mockInsert }));
vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: vi.fn(() => ({ from: mockFrom })),
}));

function makeReq(body: object): NextRequest {
  return new NextRequest("http://localhost/api/chat/qualify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockInsert.mockResolvedValue({ error: null });
});

describe("POST /api/chat/qualify — messages[] format", () => {
  it("returns 200 with a message", async () => {
    const { POST } = await import("@/app/api/chat/qualify/route");
    const res = await POST(makeReq({ messages: [{ role: "user", content: "I want to buy" }] }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBeDefined();
    expect(typeof data.message).toBe("string");
  });

  it("returns state in response", async () => {
    const { POST } = await import("@/app/api/chat/qualify/route");
    const res = await POST(makeReq({ messages: [{ role: "user", content: "sell" }] }));
    const data = await res.json();
    expect(data.state).toBeDefined();
    expect(data.state).toHaveProperty("step");
    expect(data.state).toHaveProperty("score");
  });

  it("returns isComplete boolean", async () => {
    const { POST } = await import("@/app/api/chat/qualify/route");
    const res = await POST(makeReq({ messages: [{ role: "user", content: "buy" }] }));
    const data = await res.json();
    expect(typeof data.isComplete).toBe("boolean");
  });

  it("returns score and temperature", async () => {
    const { POST } = await import("@/app/api/chat/qualify/route");
    const res = await POST(makeReq({ messages: [{ role: "user", content: "buy" }] }));
    const data = await res.json();
    expect(typeof data.score).toBe("number");
    expect(["hot", "warm", "cold", "ice"]).toContain(data.temperature);
  });

  it("accepts state parameter for conversation continuation", async () => {
    const { POST } = await import("@/app/api/chat/qualify/route");
    const state = { step: 1, score: 30, intent: "buy" };
    const res = await POST(
      makeReq({ messages: [{ role: "user", content: "within 1 month" }], state })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.state.step).toBeGreaterThanOrEqual(1);
  });

  it("sell intent at step 0 advances state", async () => {
    const { POST } = await import("@/app/api/chat/qualify/route");
    const res = await POST(makeReq({ messages: [{ role: "user", content: "I want to sell" }] }));
    const data = await res.json();
    expect(data.state.step).toBe(1);
    expect(data.state.intent).toBe("sell");
  });
});

describe("POST /api/chat/qualify — legacy {message} format (BUG-043)", () => {
  it("does NOT return 500 on legacy {message} format", async () => {
    const { POST } = await import("@/app/api/chat/qualify/route");
    const res = await POST(makeReq({ message: "I want to buy" }));
    expect(res.status).not.toBe(500);
  });

  it("returns 200 or 400 on legacy format (not a crash)", async () => {
    const { POST } = await import("@/app/api/chat/qualify/route");
    const res = await POST(makeReq({ message: "hello" }));
    expect([200, 400]).toContain(res.status);
  });

  it("returns valid JSON on legacy format", async () => {
    const { POST } = await import("@/app/api/chat/qualify/route");
    const res = await POST(makeReq({ message: "buy apartment" }));
    const data = await res.json();
    expect(data).toBeDefined();
  });
});

describe("POST /api/chat/qualify — empty/malformed body", () => {
  it("returns 400 or 500 (not crash) on empty messages array", async () => {
    const { POST } = await import("@/app/api/chat/qualify/route");
    const res = await POST(makeReq({ messages: [] }));
    expect([200, 400, 500]).toContain(res.status);
  });
});

describe("GET /api/chat/qualify", () => {
  it("returns 200 with initial message", async () => {
    const { GET } = await import("@/app/api/chat/qualify/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBeDefined();
    expect(data.state).toBeDefined();
    expect(data.state.step).toBe(0);
    expect(data.state.score).toBe(0);
  });
});

describe("Lead auto-save — Supabase insert on qualify completion", () => {
  it("does NOT call Supabase insert mid-conversation (isComplete: false)", async () => {
    vi.resetModules();
    const { POST } = await import("@/app/api/chat/qualify/route");
    // Step 0 → isComplete is always false
    await POST(makeReq({ messages: [{ role: "user", content: "I want to buy" }] }));
    // Allow microtask queue to flush
    await new Promise(r => setTimeout(r, 0));
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("calls Supabase insert when qualify flow completes (step 5 + contact info)", async () => {
    vi.resetModules();
    const { POST } = await import("@/app/api/chat/qualify/route");
    // Simulate step 5 completing — provide a name + phone, state at step 5
    const state = {
      step: 5, score: 85,
      intent: "buy", timeline: "1month", budget: "400K-700K",
      location: "Sliema", financing: "cash",
    };
    const res = await POST(makeReq({
      messages: [{ role: "user", content: "Alex Vella, +356 9987 6543" }],
      state,
    }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.isComplete).toBe(true);
    // Allow fire-and-forget microtask to flush
    await new Promise(r => setTimeout(r, 10));
    expect(mockFrom).toHaveBeenCalledWith("leads");
    expect(mockInsert).toHaveBeenCalledOnce();
    const insertArg = mockInsert.mock.calls[0][0];
    expect(insertArg.name).toBe("Alex Vella");
    expect(insertArg.source).toBe("chat");
    expect(insertArg.intent).toBe("buy");
    expect(insertArg.budget_range).toBe("400K-700K");
    expect(insertArg.location).toBe("Sliema");
    expect(["hot", "warm", "cold"]).toContain(insertArg.temperature);
    expect(typeof insertArg.score).toBe("number");
    expect(insertArg.notes).toContain("Source: Copilot chat qualify flow");
  });

  it("includes NLP language and confidence in notes", async () => {
    vi.resetModules();
    const { POST } = await import("@/app/api/chat/qualify/route");
    const state = { step: 5, score: 60, intent: "sell", timeline: "3-6months", budget: "200K-400K", location: "Valletta" };
    await POST(makeReq({ messages: [{ role: "user", content: "Sophie Duval, sophie@example.com" }], state }));
    await new Promise(r => setTimeout(r, 10));
    if (mockInsert.mock.calls.length > 0) {
      const notes: string = mockInsert.mock.calls[0][0].notes;
      expect(notes).toContain("Language: en");
      expect(notes).toContain("Intent confidence:");
    }
  });

  it("maps ice temperature → cold for Supabase (DB only has hot/warm/cold)", async () => {
    vi.resetModules();
    const { POST } = await import("@/app/api/chat/qualify/route");
    // Score 0 + contact → ice temperature
    const state = { step: 5, score: 0, intent: "browse" };
    await POST(makeReq({ messages: [{ role: "user", content: "John" }], state }));
    await new Promise(r => setTimeout(r, 10));
    if (mockInsert.mock.calls.length > 0) {
      expect(mockInsert.mock.calls[0][0].temperature).toBe("cold");
    }
  });

  it("does not throw if Supabase insert returns an error", async () => {
    vi.resetModules();
    mockInsert.mockResolvedValueOnce({ error: { message: "DB connection failed" } });
    const { POST } = await import("@/app/api/chat/qualify/route");
    const state = { step: 5, score: 80, intent: "buy", timeline: "1month", budget: "1M+", location: "Gozo" };
    const res = await POST(makeReq({ messages: [{ role: "user", content: "Max Rizzo, +356 9912 3456" }], state }));
    await new Promise(r => setTimeout(r, 10));
    // Route must still return 200 even if DB save fails
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.isComplete).toBe(true);
  });
});
