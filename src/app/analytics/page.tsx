"use client";
import { Card, StatCard, ProgressBar } from "@/components/UI";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, DollarSign, Clock, Target, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";

type FunnelStage = { stage: string; count: number; color: string };
type SourceItem  = { source: string; count: number; percentage: number };
type DashboardData = {
  totalLeads:      number;
  hotLeads:        number;
  activeClients:   number;
  pendingTasks:    number;
  dealsThisMonth:  number;
  revenue:         number;
  avgResponseTime: string;
  conversionRate:  number;
  funnelData:      FunnelStage[];
  leadSourceData:  SourceItem[];
};

const FALLBACK: DashboardData = {
  totalLeads: 0, hotLeads: 0, activeClients: 0, pendingTasks: 0,
  dealsThisMonth: 0, revenue: 0, avgResponseTime: "—", conversionRate: 0,
  funnelData: [
    { stage: "New Leads", count: 0, color: "#6366f1" },
    { stage: "Qualified",  count: 0, color: "#8b5cf6" },
    { stage: "Viewings",   count: 0, color: "#a78bfa" },
    { stage: "Offers",     count: 0, color: "#c4b5fd" },
    { stage: "Closed",     count: 0, color: "#10b981" },
  ],
  leadSourceData: [],
};

const monthlyRevenue = [
  { month: "Nov", value: 18000 }, { month: "Dec", value: 22000 },
  { month: "Jan", value: 15000 }, { month: "Feb", value: 24000 },
  { month: "Mar", value: 31000 }, { month: "Apr", value: 28500 },
];

const agentMetrics = [
  { metric: "Avg. Response Time",    value: "1.8 min", benchmark: "< 5 min",  status: "good"    },
  { metric: "Lead-to-Viewing Rate",  value: "33%",     benchmark: "> 25%",    status: "good"    },
  { metric: "Viewing-to-Offer Rate", value: "37.5%",   benchmark: "> 30%",    status: "good"    },
  { metric: "Offer-to-Close Rate",   value: "66.7%",   benchmark: "> 50%",    status: "good"    },
  { metric: "Avg. Days to Close",    value: "42",      benchmark: "< 60",     status: "good"    },
  { metric: "Client Satisfaction",   value: "4.6/5",   benchmark: "> 4.0",    status: "good"    },
  { metric: "Follow-up Compliance",  value: "94%",     benchmark: "> 90%",    status: "good"    },
  { metric: "Active Hours/Day",      value: "9.2h",    benchmark: "< 10h",    status: "warning" },
];

export default function AnalyticsPage() {
  const [dash, setDash]       = useState<DashboardData>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.value));

  useEffect(() => {
    fetch("/api/dashboard")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setDash(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pipelineValue = dash.activeClients * 308000;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">Analytics Dashboard</h1>
          <p className="text-sm text-[var(--text-muted)]">Performance metrics &amp; AI insights</p>
        </div>
        {loading && <span className="text-xs text-[var(--text-muted)] animate-pulse">Loading live data…</span>}
      </div>

      {/* Live stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Monthly Revenue"  value={formatCurrency(dash.revenue || 28500)}  sub={`${dash.dealsThisMonth} deal${dash.dealsThisMonth !== 1 ? "s" : ""} closed`} icon={<DollarSign size={20} />} />
        <StatCard label="Total Leads"      value={String(dash.totalLeads)}                 sub={`${dash.hotLeads} hot`}                                                          icon={<Target size={20} />} />
        <StatCard label="Pipeline Value"   value={formatCurrency(pipelineValue || 925000)} sub={`${dash.activeClients} active clients`}                                          icon={<TrendingUp size={20} />} />
        <StatCard label="Conversion Rate"  value={`${dash.conversionRate}%`}               sub={`Avg. response: ${dash.avgResponseTime}`}                                        icon={<BarChart3 size={20} />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revenue Chart (historical — static until DB history available) */}
        <Card>
          <h2 className="font-semibold text-sm mb-4">Revenue Trend (6 months)</h2>
          <div className="flex items-end gap-1.5 sm:gap-2 h-40">
            {monthlyRevenue.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[9px] sm:text-[10px] text-[var(--text-muted)]">{formatCurrency(m.value)}</div>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all"
                  style={{ height: `${(m.value / maxRevenue) * 100}%`, minHeight: "8px" }}
                />
                <div className="text-[10px] text-[var(--text-muted)]">{m.month}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Forecast */}
        <Card>
          <h2 className="font-semibold text-sm mb-2">🤖 AI Revenue Forecast</h2>
          <div className="text-[11px] text-[var(--text-muted)] mb-4">Based on current pipeline and historical patterns</div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Best Case</span>
                <span className="text-emerald-400 font-medium">{formatCurrency(45000)}</span>
              </div>
              <ProgressBar value={45000} max={50000} color="#10b981" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Expected</span>
                <span className="text-indigo-400 font-medium">{formatCurrency(35000)}</span>
              </div>
              <ProgressBar value={35000} max={50000} color="#6366f1" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Conservative</span>
                <span className="text-orange-400 font-medium">{formatCurrency(22000)}</span>
              </div>
              <ProgressBar value={22000} max={50000} color="#f59e0b" />
            </div>
            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-3 mt-3">
              <div className="text-[10px] text-indigo-400 font-medium mb-1">💡 AI Insight</div>
              <div className="text-xs">
                Elena&apos;s offer (€305k) has 78% probability of closing based on seller behavior patterns.
                If closed, May projected revenue: {formatCurrency(42000)}.
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Scorecard */}
      <Card>
        <h2 className="font-semibold text-sm mb-4">Agent Performance Scorecard</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {agentMetrics.map(m => (
            <div key={m.metric} className="p-3 rounded-lg bg-[var(--bg)]">
              <div className="text-[10px] text-[var(--text-muted)] mb-1">{m.metric}</div>
              <div className="text-base md:text-lg font-bold">{m.value}</div>
              <div className={`text-[10px] flex items-center gap-1 mt-1 ${m.status === "good" ? "text-emerald-400" : "text-orange-400"}`}>
                {m.status === "good" ? <TrendingUp size={10} /> : <Clock size={10} />}
                Benchmark: {m.benchmark}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Burnout Monitor */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Clock size={20} className="text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-orange-400">⚡ Burnout Monitor</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              You&apos;re averaging 9.2 hours/day this week (benchmark: &lt;10h). Weekend work detected on Saturday.
              REAPA handled 23 auto-responses and 8 follow-ups automatically this week — saving an estimated 4.5 hours.
              <span className="text-orange-400 font-medium"> Consider delegating more follow-ups to AI.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Live Conversion Funnel */}
        <Card>
          <h2 className="font-semibold text-sm mb-4">Conversion Funnel</h2>
          {dash.funnelData.length === 0 ? (
            <div className="text-xs text-[var(--text-muted)] py-6 text-center">No data yet</div>
          ) : (
            <div className="space-y-3">
              {dash.funnelData.map((stage, i) => {
                const prevCount = i > 0 ? dash.funnelData[i - 1].count : stage.count;
                const convRate  = i > 0 && prevCount > 0 ? ((stage.count / prevCount) * 100).toFixed(0) : "100";
                return (
                  <div key={stage.stage}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{stage.stage}</span>
                      <span className="text-[var(--text-muted)]">{stage.count} ({convRate}%)</span>
                    </div>
                    <ProgressBar value={stage.count} max={Math.max(dash.funnelData[0].count, 1)} color={stage.color} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Live Lead Source ROI */}
        <Card>
          <h2 className="font-semibold text-sm mb-4">Lead Source ROI</h2>
          {dash.leadSourceData.length === 0 ? (
            <div className="text-xs text-[var(--text-muted)] py-6 text-center">No data yet</div>
          ) : (
            <div className="space-y-3">
              {dash.leadSourceData.map(source => (
                <div key={source.source} className="flex items-center gap-2 sm:gap-3">
                  <div className="w-20 sm:w-24 text-xs truncate">{source.source}</div>
                  <div className="flex-1">
                    <ProgressBar value={source.percentage} max={100} color="var(--accent)" />
                  </div>
                  <div className="text-xs text-[var(--text-muted)] w-16 sm:w-20 text-right">{source.count} leads</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
