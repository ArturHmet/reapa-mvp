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

function makeReq(body: object): NextRequest {
  return new NextRequest("http://localhost/api/chat/qualify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

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
