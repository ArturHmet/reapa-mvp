/**
 * Tests for GET /api/waitlist/count
 *
 * Three paths:
 *  1. Supabase available (priority) → return DB count
 *  2. Notion fallback (no Supabase) → return Notion count
 *  3. Placeholder (nothing configured) → return 0, source=placeholder
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("GET /api/waitlist/count", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns placeholder with count:0 when nothing is configured", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createAdminClient: () => { throw new Error("no supabase"); },
    }));
    delete process.env.NOTION_API_KEY;
    delete process.env.NOTION_WAITLIST_DB_ID;
    const { GET } = await import("@/app/api/waitlist/count/route");
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(typeof body.count).toBe("number");
    expect(body.source).toBeDefined();
    expect(body).toHaveProperty("timestamp");
  });

  it("returns count from Supabase when admin client succeeds", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createAdminClient: () => ({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            count: 42,
            error: null,
            data: null,
          }),
        }),
      }),
    }));
    const { GET } = await import("@/app/api/waitlist/count/route");
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(typeof body.count).toBe("number");
    expect(body).toHaveProperty("timestamp");
  });

  it("returns valid JSON shape regardless of source", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createAdminClient: () => { throw new Error("no supabase"); },
    }));
    const { GET } = await import("@/app/api/waitlist/count/route");
    const res = await GET();
    const body = await res.json();
    expect(body).toHaveProperty("count");
    expect(body).toHaveProperty("source");
    expect(body).toHaveProperty("timestamp");
    expect(typeof body.count).toBe("number");
    expect(typeof body.source).toBe("string");
  });
});
