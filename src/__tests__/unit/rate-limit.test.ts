import { describe, it, expect, beforeEach } from "vitest";
// BUG-T005: static import for getClientId — dynamic require() doesn't resolve @ alias in Vitest
import { getClientId } from "@/lib/rate-limit";

// No SUPABASE env vars set in test environment → forces in-memory fallback path

describe("rateLimit (in-memory fallback)", () => {
  beforeEach(() => {
    // Ensure no Supabase env vars bleed in from CI
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("allows first request", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    const id = `test-allow-${Date.now()}-${Math.random()}`;
    const result = await rateLimit(id, { maxRequests: 10, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
    expect(result.retryAfterMs).toBe(0);
  });

  it("remaining decrements with each request", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    const id = `test-decrement-${Date.now()}-${Math.random()}`;
    const first = await rateLimit(id, { maxRequests: 5, windowMs: 60_000 });
    const second = await rateLimit(id, { maxRequests: 5, windowMs: 60_000 });
    expect(second.remaining).toBeLessThan(first.remaining);
  });

  it("blocks after exceeding maxRequests", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    const id = `test-block-${Date.now()}-${Math.random()}`;
    const max = 3;
    for (let i = 0; i < max; i++) {
      await rateLimit(id, { maxRequests: max, windowMs: 60_000 });
    }
    const result = await rateLimit(id, { maxRequests: max, windowMs: 60_000 });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("returns correct shape", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    const id = `test-shape-${Date.now()}-${Math.random()}`;
    const result = await rateLimit(id);
    expect(result).toHaveProperty("allowed");
    expect(result).toHaveProperty("remaining");
    expect(result).toHaveProperty("resetAt");
    expect(result).toHaveProperty("retryAfterMs");
    expect(typeof result.allowed).toBe("boolean");
    expect(typeof result.remaining).toBe("number");
    expect(typeof result.resetAt).toBe("number");
    expect(typeof result.retryAfterMs).toBe("number");
  });

  it("uses defaults (windowMs=60000, maxRequests=20)", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    const id = `test-defaults-${Date.now()}-${Math.random()}`;
    const result = await rateLimit(id);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(19); // 20 - 1
  });

  it("resetAt is in the future", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    const id = `test-reset-${Date.now()}-${Math.random()}`;
    const result = await rateLimit(id);
    expect(result.resetAt).toBeGreaterThan(Date.now() - 1000);
  });

  it("retryAfterMs is 0 when allowed", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    const id = `test-retry-0-${Date.now()}-${Math.random()}`;
    const result = await rateLimit(id, { maxRequests: 10 });
    expect(result.retryAfterMs).toBe(0);
  });

  it("different identifiers are independent", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    const idA = `test-indep-a-${Date.now()}`;
    const idB = `test-indep-b-${Date.now()}`;
    // Exhaust idA
    for (let i = 0; i < 2; i++) await rateLimit(idA, { maxRequests: 2 });
    const blockedA = await rateLimit(idA, { maxRequests: 2 });
    const allowedB = await rateLimit(idB, { maxRequests: 2 });
    expect(blockedA.allowed).toBe(false);
    expect(allowedB.allowed).toBe(true);
  });
});

describe("getClientId", () => {
  it("extracts first IP from x-forwarded-for", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientId(req)).toBe("ip:1.2.3.4");
  });

  it("returns ip:anon when no forwarded header", () => {
    const req = new Request("http://localhost");
    expect(getClientId(req)).toBe("ip:anon");
  });

  it("returns prefixed ip string", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "10.0.0.1" },
    });
    expect(getClientId(req)).toMatch(/^ip:/);
  });
});
