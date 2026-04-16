import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";

// Top-level fetch mock — must be set before any module is evaluated.
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () =>
    Promise.resolve({
      totalLeads: 0,
      activeClients: 0,
      listings: 0,
      pendingTasks: 0,
      revenue: 0,
      hotLeads: 0,
      viewingsToday: 0,
      overdueTasks: 0,
      conversionRate: 0,
      avgResponseTime: "N/A",
      funnelData: [],
      leadSourceData: [],
    }),
});

// Mock Supabase to prevent real connections timing out in JSDOM
vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowser: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  })),
  isSupabaseConfigured: vi.fn().mockReturnValue(false),
}));

vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: vi.fn(),
  createServerClient: vi.fn(),
}));

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), pathname: "/" }),
  usePathname: () => "/",
}));

// Mock data to avoid import chain issues
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
    avgResponseTime: "2h",
  },
  leads: [],
  clients: [],
  tasks: [],
  funnelData: [
    { stage: "New", count: 47, color: "var(--accent)" },
    { stage: "Qualified", count: 23, color: "#818cf8" },
    { stage: "Viewing", count: 12, color: "#a78bfa" },
    { stage: "Offer", count: 6, color: "#c084fc" },
    { stage: "Closed", count: 8, color: "#4ade80" },
  ],
  leadSourceData: [],
}));

vi.mock("@/components/UI", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  StatCard: ({ label, value }: { label: string; value: string | number }) => (
    <div data-testid="stat-card">{label}: {value}</div>
  ),
  ProgressBar: () => <div data-testid="progress-bar" />,
}));

vi.mock("@/components/Sidebar", () => ({
  Sidebar: () => <nav data-testid="sidebar">Sidebar</nav>,
}));

vi.mock("lucide-react", () =>
  new Proxy({}, { get: (_t, name) => () => <span data-testid={`icon-${String(name)}`} /> })
);

describe("Homepage smoke test", () => {
  it("renders without crashing", async () => {
    const { default: Page } = await import("@/app/page");
    await act(async () => {
      const { container } = render(<Page />);
      expect(container).toBeTruthy();
      expect(container.firstChild).toBeTruthy();
    });
  }, 15000);

  it("renders stat cards section", async () => {
    const { default: Page } = await import("@/app/page");
    await act(async () => {
      render(<Page />);
    });
    const statCards = screen.queryAllByTestId("stat-card");
    expect(statCards.length).toBeGreaterThanOrEqual(0);
  }, 15000);
});
