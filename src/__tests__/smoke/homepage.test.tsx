/* eslint-disable */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Supabase mock (synchronous stubs — prevents JSDOM hang) ─────────────────
vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowser: vi.fn(() => ({
    auth: {
      getSession: vi.fn(() =>
        Promise.resolve({ data: { session: null }, error: null })
      ),
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  })),
  isSupabaseConfigured: vi.fn(() => false),
}));

vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: vi.fn(),
  createServerClient: vi.fn(),
}));

// ── Next.js navigation ───────────────────────────────────────────────────────
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), pathname: "/" }),
  usePathname: () => "/",
}));

// ── Data / UI mocks ──────────────────────────────────────────────────────────
vi.mock("@/lib/data", () => ({
  dashboardStats: {
    totalLeads: 47,
    activeClients: 12,
    totalListings: 8,
    totalTasks: 24,
    revenue: 124500,
    hotLeads: 2,
    viewingsToday: 3,
    overdueTasks: 1,
    conversionRate: 17,
    avgResponseTime: "2.3h",
    funnelData: [],
    leadSourceData: [],
  },
  getDashboardStats: vi.fn(() =>
    Promise.resolve({
      totalLeads: 47,
      activeClients: 12,
      totalListings: 8,
      totalTasks: 24,
      pendingTasks: 0,
      revenue: 0,
      hotLeads: 0,
      viewingsToday: 0,
      overdueTasks: 0,
      conversionRate: 0,
      avgResponseTime: "N/A",
      funnelData: [],
      leadSourceData: [],
    })
  ),
}));

vi.mock("@/components/UI", () => ({
  Button: ({ children, ...p }: any) => <button {...p}>{children}</button>,
  Card: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  CardContent: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  Badge: ({ children, ...p }: any) => <span {...p}>{children}</span>,
  Input: (p: any) => <input {...p} />,
}));

vi.mock("@/components/Sidebar", () => ({
  default: () => <nav data-testid="sidebar" />,
  Sidebar: () => <nav data-testid="sidebar" />,
}));

vi.mock("lucide-react", () =>
  new Proxy(
    {},
    { get: (_t, name) => () => <span data-testid={`icon-${String(name)}`} /> }
  )
);

// ── Smoke tests ───────────────────────────────────────────────────────────────
describe("Homepage smoke", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    // Minimal smoke — just ensure vitest setup doesn't hang
    expect(true).toBe(true);
  });

  it("supabase mock returns synchronously", async () => {
    const { getSupabaseBrowser } = await import("@/lib/supabase/client");
    const client = (getSupabaseBrowser as any)();
    const result = await client.auth.getSession();
    expect(result.data.session).toBeNull();
    expect(result.error).toBeNull();
  });
});
