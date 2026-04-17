/**
 * Coverage tests for all CRUD API routes:
 *   /api/health   /api/tasks   /api/leads   /api/clients
 *   /api/dashboard   /api/waitlist
 *
 * Mock strategy:
 *   vi.mock() is hoisted by Vitest's Babel transform — calling it inside
 *   beforeEach() or it() bodies does NOT create per-test factories.
 *   Use vi.doMock() (not hoisted, runs inline) + vi.resetModules() so each
 *   test's dynamic import() picks up its own fresh factory.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Supabase chain mock factory ──────────────────────────────────────────────
function chain(result: unknown) {
  const c: Record<string, unknown> = {};
  const p = Promise.resolve(result);
  c.then    = p.then.bind(p);
  c.catch   = p.catch.bind(p);
  c.finally = (p as Promise<unknown>).finally.bind(p);
  for (const m of ["select","order","eq","lt","in","insert","upsert","limit","head","gte","lte"]) {
    c[m] = vi.fn().mockReturnValue(c);
  }
  return c;
}

function adminMock(cfg: {
  leadsData?: unknown[];
  clientsData?: unknown[];
  tasksData?: unknown[];
  error?: unknown;
} = {}) {
  return {
    from: vi.fn((table: string) => {
      if (cfg.error) return chain({ data: null, error: cfg.error, count: 0 });
      switch (table) {
        case "leads":   return chain({ data: cfg.leadsData   ?? [], error: null, count: cfg.leadsData?.length   ?? 0 });
        case "clients": return chain({ data: cfg.clientsData ?? [], error: null, count: cfg.clientsData?.length ?? 0 });
        case "tasks":   return chain({ data: cfg.tasksData   ?? [], error: null, count: cfg.tasksData?.length   ?? 0 });
        default:        return chain({ data: [], error: null, count: 0 });
      }
    }),
  };
}

// ── /api/health ──────────────────────────────────────────────────────────────
describe("GET /api/health", () => {
  beforeEach(() => {
    vi.resetModules();
    // vi.doMock() — not hoisted, runs here, respected by the dynamic import() below
    vi.doMock("@supabase/supabase-js", () => ({
      createClient: () => ({
        from: () => chain({ data: [{ id: "1" }], error: null }),
      }),
    }));
    process.env.NEXT_PUBLIC_SUPABASE_URL    = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY   = "test-key";
    process.env.GEMINI_API_KEY              = "test-gemini";
    process.env.NEXT_PUBLIC_APP_VERSION     = "test-1.0";
  });

  it("returns 200 with ok status when DB is healthy", async () => {
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("uptime_ms");
    expect(body.checks.database.status).toBe("ok");
    expect(body.checks.ai.gemini_key_set).toBe(true);
    expect(body.version).toBe("test-1.0");
  });

  it("returns 503 when DB throws", async () => {
    vi.resetModules();
    vi.doMock("@supabase/supabase-js", () => ({
      createClient: () => ({
        from: () => { throw new Error("connection refused"); },
      }),
    }));
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(503);
    expect(body.status).toBe("degraded");
    expect(body.checks.database.status).toBe("error");
  });

  it("returns 503 when DB returns error object", async () => {
    vi.resetModules();
    vi.doMock("@supabase/supabase-js", () => ({
      createClient: () => ({
        from: () => chain({ data: null, error: new Error("DB error") }),
      }),
    }));
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    const body = await res.json();
    expect(body.checks.database.status).toBe("error");
  });
});

// ── /api/tasks ───────────────────────────────────────────────────────────────
describe("GET /api/tasks", () => {
  const sampleTasks = [
    { id: "t1", title: "Follow up",  description: "Call client", type: "follow_up",  priority: "high",     status: "pending",     due_at: "2026-04-20T10:00:00Z", ai_generated: true,  leads: { name: "James" }, clients: null },
    { id: "t2", title: "Viewing",    description: null,          type: "viewing",     priority: "critical", status: "completed",   due_at: "2026-03-01T09:00:00Z", ai_generated: false, leads: null,              clients: { name: "Elena" } },
    { id: "t3", title: "Document",   description: null,          type: "document",    priority: "low",      status: "in_progress", due_at: null,                   ai_generated: false, leads: null,              clients: null },
    { id: "t4", title: "Compliance", description: null,          type: "compliance",  priority: "high",     status: "cancelled",   due_at: null,                   ai_generated: true,  leads: null,              clients: null },
    { id: "t5", title: "Offer call", description: null,          type: "offer",       priority: "medium",   status: "pending",     due_at: null,                   ai_generated: false, leads: null,              clients: null },
    { id: "t6", title: "Other",      description: null,          type: "other",       priority: null,       status: null,          due_at: null,                   ai_generated: null,  leads: null,              clients: null },
  ];

  beforeEach(() => {
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createAdminClient: () => adminMock({ tasksData: sampleTasks }),
    }));
  });

  it("returns mapped tasks array", async () => {
    const { GET } = await import("@/app/api/tasks/route");
    const body = await (await GET()).json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(sampleTasks.length);
  });

  it("maps priority critical → urgent", async () => {
    const { GET } = await import("@/app/api/tasks/route");
    const body = await (await GET()).json();
    expect(body.find((t: { id: string }) => t.id === "t2").priority).toBe("urgent");
  });

  it("maps priority null → medium", async () => {
    const { GET } = await import("@/app/api/tasks/route");
    const body = await (await GET()).json();
    expect(body.find((t: { id: string }) => t.id === "t6").priority).toBe("medium");
  });

  it("maps status completed → done", async () => {
    const { GET } = await import("@/app/api/tasks/route");
    const body = await (await GET()).json();
    expect(body.find((t: { id: string }) => t.id === "t2").status).toBe("done");
  });

  it("marks future pending task as pending (not overdue)", async () => {
    const { GET } = await import("@/app/api/tasks/route");
    const body = await (await GET()).json();
    expect(body.find((t: { id: string }) => t.id === "t1").status).toBe("pending");
  });

  it("maps clientName from leads relation", async () => {
    const { GET } = await import("@/app/api/tasks/route");
    const body = await (await GET()).json();
    expect(body.find((t: { id: string }) => t.id === "t1").clientName).toBe("James");
  });

  it("maps category offer → call", async () => {
    const { GET } = await import("@/app/api/tasks/route");
    const body = await (await GET()).json();
    expect(body.find((t: { id: string }) => t.id === "t5").category).toBe("call");
  });

  it("returns 500 on DB error", async () => {
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createAdminClient: () => adminMock({ error: new Error("DB fail") }),
    }));
    const { GET } = await import("@/app/api/tasks/route");
    const res = await GET();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual([]);
  });
});

// ── /api/leads ───────────────────────────────────────────────────────────────
describe("GET /api/leads", () => {
  const sampleLeads = [
    { id: "l1", name: "James", email: "j@test.com", phone: "+44 123",  source: "chat",      score: 85,   temperature: "hot",  intent: "buy",  budget_range: "300k-400k", location: "Sliema", notes: "high intent", last_contact_at: "2026-04-14T09:00:00Z", created_at: "2026-04-14T09:00:00Z" },
    { id: "l2", name: "Maria", email: null,          phone: null,       source: "manual",    score: 60,   temperature: "warm", intent: "sell", budget_range: null,        location: null,     notes: null,          last_contact_at: null,                   created_at: "2026-04-13T10:00:00Z" },
    { id: "l3", name: "Lars",  email: null,          phone: null,       source: null,        score: null, temperature: null,   intent: null,  budget_range: null,        location: null,     notes: null,          last_contact_at: null,                   created_at: "2026-04-12T12:00:00Z" },
    { id: "l4", name: "Ahmed", email: null,          phone: null,       source: "instagram", score: 40,   temperature: "cold", intent: null,  budget_range: "750k",      location: "Tigne",  notes: null,          last_contact_at: null,                   created_at: "2026-04-11T10:00:00Z" },
  ];

  beforeEach(() => {
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createAdminClient: () => adminMock({ leadsData: sampleLeads }),
    }));
  });

  it("returns mapped leads array", async () => {
    const { GET } = await import("@/app/api/leads/route");
    const body = await (await GET()).json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(sampleLeads.length);
  });

  it("maps source chat → whatsapp", async () => {
    const { GET } = await import("@/app/api/leads/route");
    const body = await (await GET()).json();
    expect(body.find((l: { id: string }) => l.id === "l1").source).toBe("whatsapp");
  });

  it("maps source manual → referral", async () => {
    const { GET } = await import("@/app/api/leads/route");
    const body = await (await GET()).json();
    expect(body.find((l: { id: string }) => l.id === "l2").source).toBe("referral");
  });

  it("maps unknown source → portal", async () => {
    const { GET } = await import("@/app/api/leads/route");
    const body = await (await GET()).json();
    expect(body.find((l: { id: string }) => l.id === "l3").source).toBe("portal");
  });

  it("maps temperature null → cold", async () => {
    const { GET } = await import("@/app/api/leads/route");
    const body = await (await GET()).json();
    expect(body.find((l: { id: string }) => l.id === "l3").score).toBe("cold");
  });

  it("handles null email/phone with empty string", async () => {
    const { GET } = await import("@/app/api/leads/route");
    const body = await (await GET()).json();
    const lead = body.find((l: { id: string }) => l.id === "l2");
    expect(lead.email).toBe("");
    expect(lead.phone).toBe("");
  });

  it("parseBudget extracts first number from range string", async () => {
    const { GET } = await import("@/app/api/leads/route");
    const body = await (await GET()).json();
    const lead = body.find((l: { id: string }) => l.id === "l1");
    expect(typeof lead.budget).toBe("number");
    expect(lead.budget).toBeGreaterThan(0);
  });

  it("returns 500 on DB error", async () => {
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createAdminClient: () => adminMock({ error: new Error("err") }),
    }));
    const { GET } = await import("@/app/api/leads/route");
    expect((await GET()).status).toBe(500);
  });
});

// ── /api/clients ─────────────────────────────────────────────────────────────
describe("GET /api/clients", () => {
  const sampleClients = [
    { id: "c1", name: "David", email: "d@t.com", phone: "+852 1", nationality: "Hong Kong", budget_min: 400000, budget_max: 600000, preferred_areas: ["Sliema"], property_type: ["Apartment"], status: "active", notes: "interested", aml_verified: true,  created_at: "2026-03-15T10:00:00Z", updated_at: "2026-04-12T10:00:00Z" },
    { id: "c2", name: "Elena", email: null,       phone: null,     nationality: null,         budget_min: null,   budget_max: null,   preferred_areas: null,       property_type: null,          status: "closed", notes: null,        aml_verified: false, created_at: "2026-02-20T09:00:00Z", updated_at: "2026-04-13T09:00:00Z" },
    { id: "c3", name: "Tom",   email: null,       phone: null,     nationality: null,         budget_min: null,   budget_max: null,   preferred_areas: [],         property_type: [],            status: "paused", notes: null,        aml_verified: null,  created_at: "2026-01-10T09:00:00Z", updated_at: "2026-04-10T09:00:00Z" },
  ];

  beforeEach(() => {
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createAdminClient: () => adminMock({ clientsData: sampleClients }),
    }));
  });

  it("returns mapped clients array", async () => {
    const { GET } = await import("@/app/api/clients/route");
    const body = await (await GET()).json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(sampleClients.length);
  });

  it("uses budget_max when available", async () => {
    const { GET } = await import("@/app/api/clients/route");
    const body = await (await GET()).json();
    expect(body.find((c: { id: string }) => c.id === "c1").budget).toBe(600000);
  });

  it("defaults budget to 0 when both null", async () => {
    const { GET } = await import("@/app/api/clients/route");
    const body = await (await GET()).json();
    expect(body.find((c: { id: string }) => c.id === "c2").budget).toBe(0);
  });

  it("maps status closed → closed", async () => {
    const { GET } = await import("@/app/api/clients/route");
    const body = await (await GET()).json();
    expect(body.find((c: { id: string }) => c.id === "c2").stage).toBe("closed");
  });

  it("maps status paused → qualified", async () => {
    const { GET } = await import("@/app/api/clients/route");
    const body = await (await GET()).json();
    expect(body.find((c: { id: string }) => c.id === "c3").stage).toBe("qualified");
  });

  it("defaults nationality to International when null", async () => {
    const { GET } = await import("@/app/api/clients/route");
    const body = await (await GET()).json();
    expect(body.find((c: { id: string }) => c.id === "c2").nationality).toBe("International");
  });

  it("defaults preferredArea to Malta when empty array", async () => {
    const { GET } = await import("@/app/api/clients/route");
    const body = await (await GET()).json();
    expect(body.find((c: { id: string }) => c.id === "c3").preferredArea).toBe("Malta");
  });

  it("returns 500 on DB error", async () => {
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createAdminClient: () => adminMock({ error: new Error("err") }),
    }));
    const { GET } = await import("@/app/api/clients/route");
    expect((await GET()).status).toBe(500);
  });
});

// ── /api/dashboard ────────────────────────────────────────────────────────────
describe("GET /api/dashboard", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createAdminClient: () => ({
        from: vi.fn(() =>
          chain({ data: [{ source: "chat" }, { source: "portal" }], error: null, count: 5 })
        ),
      }),
    }));
  });

  it("returns a dashboard stats object", async () => {
    const { GET } = await import("@/app/api/dashboard/route");
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(typeof body.totalLeads).toBe("number");
    expect(typeof body.hotLeads).toBe("number");
    expect(typeof body.pendingTasks).toBe("number");
    expect(Array.isArray(body.leadSourceData)).toBe(true);
  });

  it("returns 500 on DB error", async () => {
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createAdminClient: () => adminMock({ error: new Error("err") }),
    }));
    const { GET } = await import("@/app/api/dashboard/route");
    expect((await GET()).status).toBe(500);
  });
});

// ── /api/waitlist ─────────────────────────────────────────────────────────────
// ROOT CAUSE B fix: mock @/lib/rate-limit in every waitlist test.
// Without this, tests share the real in-memory limiter — sequential POSTs
// exhaust it and later tests get 429 instead of 400/201.
describe("POST /api/waitlist", () => {
  const makeReq = (body: unknown, ip = "1.2.3.4") =>
    new Request("http://localhost/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify(body),
    });

  beforeEach(() => {
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createAdminClient: () => ({
        from: vi.fn(() => chain({ data: null, error: null })),
      }),
    }));
    // Default: rate limiter allows all requests
    vi.doMock("@/lib/rate-limit", () => ({
      rateLimit:    vi.fn().mockResolvedValue({ allowed: true, remaining: 99, resetAt: Date.now() + 60000, retryAfterMs: 0 }),
      getClientId:  vi.fn().mockReturnValue("ip:1.2.3.4"),
    }));
  });

  it("returns 200 on valid email", async () => {
    const { POST } = await import("@/app/api/waitlist/route");
    const res = await POST(makeReq({ email: "test@example.com", name: "Test User" }));
    expect([200, 201]).toContain(res.status);
  });

  it("returns 400 on missing email", async () => {
    const { POST } = await import("@/app/api/waitlist/route");
    const res = await POST(makeReq({ name: "No Email" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/email/i);
  });

  it("returns 400 on invalid email format", async () => {
    const { POST } = await import("@/app/api/waitlist/route");
    expect((await POST(makeReq({ email: "not-an-email" }))).status).toBe(400);
  });

  it("returns 429 when rate limited", async () => {
    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createAdminClient: () => ({ from: vi.fn(() => chain({ data: null, error: null })) }),
    }));
    vi.doMock("@/lib/rate-limit", () => ({
      rateLimit:   vi.fn().mockResolvedValue({ allowed: false, remaining: 0, resetAt: Date.now() + 3600000, retryAfterMs: 3600000 }),
      getClientId: vi.fn().mockReturnValue("ip:1.2.3.4"),
    }));
    const { POST } = await import("@/app/api/waitlist/route");
    expect((await POST(makeReq({ email: "test@example.com" }))).status).toBe(429);
  });

  it("returns 400 on invalid JSON body", async () => {
    const { POST } = await import("@/app/api/waitlist/route");
    const req = new Request("http://localhost/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "1.2.3.4" },
      body: "not-json{{{",
    });
    expect((await POST(req)).status).toBe(400);
  });

  it("accepts optional name, role, language, source fields", async () => {
    const { POST } = await import("@/app/api/waitlist/route");
    const res = await POST(makeReq({
      email:    "agent@example.com",
      name:     "Real Estate Agent",
      role:     "agent",
      language: "ru",
      source:   "linkedin",
    }));
    expect([200, 201]).toContain(res.status);
  });
});
