import { describe, it, expect } from "vitest";

describe("GET /api/warmup", () => {
  it("returns 200 with ok:true", async () => {
    const { GET } = await import("@/app/api/warmup/route");
    const res = await GET(new Request("http://localhost/api/warmup"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("returns ts as a number (epoch ms)", async () => {
    const before = Date.now();
    const { GET } = await import("@/app/api/warmup/route");
    const res = await GET(new Request("http://localhost/api/warmup"));
    const data = await res.json();
    const after = Date.now();
    expect(typeof data.ts).toBe("number");
    expect(data.ts).toBeGreaterThanOrEqual(before);
    expect(data.ts).toBeLessThanOrEqual(after);
  });

  it("returns service: 'reapa-warmup'", async () => {
    const { GET } = await import("@/app/api/warmup/route");
    const res = await GET(new Request("http://localhost/api/warmup"));
    const data = await res.json();
    expect(data.service).toBe("reapa-warmup");
  });

  it("response is application/json", async () => {
    const { GET } = await import("@/app/api/warmup/route");
    const res = await GET(new Request("http://localhost/api/warmup"));
    expect(res.headers.get("content-type")).toContain("application/json");
  });
});
