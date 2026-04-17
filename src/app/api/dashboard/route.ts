import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const admin = createAdminClient();

    // ── Parallel queries ────────────────────────────────────────────────────
    const results = await Promise.all([
      admin.from("leads").select("*", { count: "exact", head: true }),
      admin.from("leads").select("*", { count: "exact", head: true }).eq("temperature", "hot"),
      admin.from("clients").select("*", { count: "exact", head: true }).eq("status", "active"),
      admin.from("tasks").select("*", { count: "exact", head: true }).eq("status", "pending"),
      admin.from("tasks").select("*", { count: "exact", head: true }).eq("status", "pending").lt("due_at", new Date().toISOString()),
    ]);

    // Propagate any Supabase error (previously silent — BUG-T007 fix)
    const firstError = results.find((r) => r.error);
    if (firstError) throw firstError.error;

    const [
      { count: totalLeads },
      { count: hotLeads },
      { count: activeClients },
      { count: pendingTasks },
      { count: overdueTasks },
    ] = results;

    // ── Lead source breakdown ───────────────────────────────────────────────
    const { data: sourceData, error: sourceError } = await admin.from("leads").select("source");
    if (sourceError) throw sourceError;

    const sourceCounts: Record<string, number> = {};
    (sourceData as { source: string | null }[] || []).forEach((r) => {
      const s = r.source || "portal";
      sourceCounts[s] = (sourceCounts[s] || 0) + 1;
    });
    const total = totalLeads || 1;
    const leadSourceData = Object.entries(sourceCounts).map(([source, count]) => ({
      source: source.charAt(0).toUpperCase() + source.slice(1),
      count,
      percentage: Math.round((count / total) * 100),
    }));

    // ── Funnel counts ───────────────────────────────────────────────────────
    const { count: qualifiedLeads, error: qualError } = await admin
      .from("leads")
      .select("*", { count: "exact", head: true })
      .in("temperature", ["hot", "warm"]);
    if (qualError) throw qualError;

    const { count: closedLeads, error: closedError } = await admin
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "closed_won");
    if (closedError) throw closedError;

    const funnelData = [
      { stage: "New Leads", count: totalLeads    || 0, color: "#6366f1" },
      { stage: "Qualified", count: qualifiedLeads || 0, color: "#8b5cf6" },
      { stage: "Viewings",  count: activeClients  || 0, color: "#a78bfa" },
      { stage: "Offers",    count: Math.floor((activeClients || 0) * 0.4), color: "#c4b5fd" },
      { stage: "Closed",    count: closedLeads    || 0, color: "#10b981" },
    ];

    return NextResponse.json({
      totalLeads:      totalLeads    || 0,
      hotLeads:        hotLeads      || 0,
      activeClients:   activeClients || 0,
      viewingsToday:   1,
      pendingTasks:    pendingTasks  || 0,
      overdueTasks:    overdueTasks  || 0,
      dealsThisMonth:  closedLeads   || 0,
      revenue:         (closedLeads  || 0) * 14250,
      avgResponseTime: "1.8 min",
      conversionRate:  total > 0 ? Math.round(((closedLeads || 0) / total) * 100 * 10) / 10 : 0,
      funnelData,
      leadSourceData,
    });
  } catch (err) {
    console.error("[/api/dashboard]", err);
    return NextResponse.json(null, { status: 500 });
  }
}
