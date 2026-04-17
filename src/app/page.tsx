"use client";
import {useState, useEffect} from "react";
import {Card, Badge, StatCard, ProgressBar} from "@/components/UI";
import {dashboardStats as mockStats, tasks as mockTasks, leads as mockLeads, funnelData as mockFunnel, leadSourceData as mockSourceData} from "@/lib/data";
import {formatCurrency} from "@/lib/utils";
import {Users, UserPlus, Eye, CheckSquare, Clock, Target, Phone, FileText, Shield, Sparkles} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState(mockStats);
  const [funnelData, setFunnelData] = useState(mockFunnel);
  const [leadSourceData, setLeadSourceData] = useState(mockSourceData);
  const [leads, setLeads] = useState(mockLeads);
  const [tasks, setTasks] = useState(mockTasks);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => {
      if (!d) return;
      setStats(d);
      if (d.funnelData) setFunnelData(d.funnelData);
      if (d.leadSourceData) setLeadSourceData(d.leadSourceData);
    }).catch(() => {});
    fetch("/api/leads").then(r => r.json()).then(setLeads).catch(() => {});
    fetch("/api/tasks").then(r => r.json()).then(setTasks).catch(() => {});
  }, []);

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' || t.status === 'overdue');
  const hotLeads = leads.filter(l => l.score === 'hot');

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
      <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-xl p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-indigo-400" />
              <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">AI Daily Briefing</span>
            </div>
            <h1 className="text-lg md:text-xl font-bold mb-1">Good morning! Here&apos;s your day.</h1>
            <p className="text-sm text-[var(--text-muted)]">{today}</p>
          </div>
          <div className="sm:text-right">
            <div className="text-xl md:text-2xl font-bold text-indigo-400">{stats.avgResponseTime}</div>
            <div className="text-[10px] text-[var(--text-muted)]">Avg. response time</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="text-xs text-red-400 font-medium">🔴 Urgent</div>
            <div className="text-sm mt-1">{urgentTasks.length} tasks need attention now</div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
            <div className="text-xs text-orange-400 font-medium">🟡 Hot Leads</div>
            <div className="text-sm mt-1">{hotLeads.length} hot leads — call before 10am</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
            <div className="text-xs text-emerald-400 font-medium">✅ Pipeline</div>
            <div className="text-sm mt-1">{formatCurrency(stats.revenue)} revenue this month</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Total Leads" value={stats.totalLeads} sub={`${stats.hotLeads} hot`} icon={<UserPlus size={20} />} />
        <StatCard label="Active Clients" value={stats.activeClients} sub={`${stats.viewingsToday} viewings today`} icon={<Users size={20} />} />
        <StatCard label="Pending Tasks" value={stats.pendingTasks} sub={`${stats.overdueTasks} overdue`} icon={<CheckSquare size={20} />} />
        <StatCard label="Conversion Rate" value={`${stats.conversionRate}%`} sub="Leads → Deals" icon={<Target size={20} />} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Today&apos;s Priority Tasks</h2>
            <Badge variant="red">{urgentTasks.length} urgent</Badge>
          </div>
          <div className="space-y-2">
            {tasks.filter(t => t.status !== 'done').slice(0, 7).map(task => (
              <div key={task.id} className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg bg-[var(--bg)] hover:bg-[var(--bg-card-hover)] transition-colors group">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'urgent' ? 'bg-red-500' : task.priority === 'high' ? 'bg-orange-500' : task.priority === 'medium' ? 'bg-blue-500' : 'bg-gray-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{task.title}</div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate hidden sm:block">{task.description}</div>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                  {task.autoGenerated && <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded hidden sm:inline">AI</span>}
                  <CategoryIcon category={task.category} />
                  <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">{task.dueTime}</span>
                  {task.status === 'overdue' && <Badge variant="red">Overdue</Badge>}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold text-sm mb-4">Sales Funnel</h2>
          <div className="space-y-3">
            {funnelData.map((stage) => (
              <div key={stage.stage}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-muted)]">{stage.stage}</span>
                  <span className="font-medium">{stage.count}</span>
                </div>
                <ProgressBar value={stage.count} max={funnelData[0].count} color={stage.color} />
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="text-xs text-[var(--text-muted)]">Conversion Rate</div>
            <div className="text-lg font-bold text-emerald-400">
              {funnelData[0].count > 0 ? ((funnelData[4].count / funnelData[0].count) * 100).toFixed(1) : '0.0'}%
            </div>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h2 className="font-semibold text-sm mb-4">🔥 Hot Leads — Call Now</h2>
          <div className="space-y-3">
            {hotLeads.map(lead => (
              <div key={lead.id} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg)]">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {lead.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{lead.name}</div>
                  <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 flex-wrap">
                    <span>{lead.nationality}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{formatCurrency(lead.budget)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{lead.location}</span>
                  </div>
                </div>
                <Badge variant="hot">HOT</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold text-sm mb-4">Lead Sources</h2>
          <div className="space-y-3">
            {leadSourceData.map(source => (
              <div key={source.source}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{source.source}</span>
                  <span className="text-[var(--text-muted)]">{source.count} leads ({source.percentage}%)</span>
                </div>
                <ProgressBar value={source.percentage} max={100} color="var(--accent)" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function CategoryIcon({ category }: { category: string }) {
  const icons: Record<string, React.ReactNode> = {
    call: <Phone size={14} className="text-blue-400" />,
    viewing: <Eye size={14} className="text-purple-400" />,
    follow_up: <Clock size={14} className="text-orange-400" />,
    document: <FileText size={14} className="text-green-400" />,
    compliance: <Shield size={14} className="text-red-400" />,
    other: <CheckSquare size={14} className="text-gray-400" />,
  };
  return <>{icons[category] || icons.other}</>;
}
