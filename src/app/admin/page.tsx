"use client";
import { useState, useEffect, useCallback } from "react";
import { leads as mockLeads, clients as mockClients, tasks as mockTasks, type Lead, type Client, type Task } from "@/lib/data";
import { formatCurrency, timeAgo } from "@/lib/utils";
import {
  Search, Download, ChevronUp, ChevronDown,
  Shield, UserPlus, Users, CheckSquare,
  MessageSquare, Mail, Globe, Star, Heart, Zap, Phone, Eye, Clock, FileText,
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────
type SortDir = "asc" | "desc";

function useSortState<T extends object>(initial: keyof T) {
  const [col, setCol] = useState<keyof T>(initial);
  const [dir, setDir] = useState<SortDir>("asc");
  const toggle = useCallback((c: keyof T) => {
    setCol(prev => {
      if (prev === c) { setDir(d => d === "asc" ? "desc" : "asc"); return prev; }
      setDir("asc"); return c;
    });
  }, []);
  return { col, dir, toggle };
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronUp size={12} className="opacity-20" />;
  return dir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
}

function sortArr<T extends object>(arr: T[], col: keyof T, dir: SortDir): T[] {
  return [...arr].sort((a, b) => {
    const av = a[col], bv = b[col];
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
    return dir === "asc" ? cmp : -cmp;
  });
}

function exportCSV(data: object[], name: string) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const rows = [keys.join(","), ...data.map(r =>
    keys.map(k => {
      const v = String((r as Record<string, unknown>)[k] ?? "").replace(/"/g, '""');
      return v.includes(",") ? `"${v}"` : v;
    }).join(",")
  )];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

const sourceIcons: Record<string, React.ReactNode> = {
  whatsapp:  <MessageSquare size={13} className="text-green-400" />,
  email:     <Mail size={13} className="text-blue-400" />,
  portal:    <Globe size={13} className="text-purple-400" />,
  instagram: <Star size={13} className="text-pink-400" />,
  facebook:  <Heart size={13} className="text-blue-500" />,
  referral:  <Zap size={13} className="text-orange-400" />,
};

const tempCls: Record<string, string> = {
  hot:  "bg-red-500/15 text-red-400 border-red-500/25",
  warm: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  cold: "bg-blue-500/15 text-blue-400 border-blue-500/25",
};

const stageCls: Record<string, string> = {
  new:       "bg-blue-500/15 text-blue-400",
  qualified: "bg-purple-500/15 text-purple-400",
  viewing:   "bg-orange-500/15 text-orange-400",
  offer:     "bg-yellow-500/15 text-yellow-400",
  closed:    "bg-emerald-500/15 text-emerald-400",
};

const priorCls: Record<string, string> = {
  urgent: "bg-red-500/15 text-red-400",
  high:   "bg-orange-500/15 text-orange-400",
  medium: "bg-blue-500/15 text-blue-400",
  low:    "bg-[var(--bg-base)] text-[var(--text-muted)]",
};

const catIcons: Record<string, React.ReactNode> = {
  call:       <Phone size={13} className="text-blue-400" />,
  viewing:    <Eye size={13} className="text-purple-400" />,
  follow_up:  <Clock size={13} className="text-orange-400" />,
  document:   <FileText size={13} className="text-green-400" />,
  compliance: <Shield size={13} className="text-red-400" />,
  other:      <CheckSquare size={13} className="text-gray-400" />,
};

// ── Sortable TH ───────────────────────────────────────────────────────────────
function Th<T extends object>({ label, colKey, sort }: {
  label: string; colKey: keyof T; sort: ReturnType<typeof useSortState<T>>;
}) {
  return (
    <th onClick={() => sort.toggle(colKey)}
      className="px-3 py-2.5 text-left text-xs font-medium text-[var(--text-muted)] whitespace-nowrap cursor-pointer hover:text-[var(--text-primary)] select-none">
      <span className="flex items-center gap-1">
        {label}<SortIcon active={sort.col === colKey} dir={sort.dir} />
      </span>
    </th>
  );
}

// ── Leads tab ─────────────────────────────────────────────────────────────────
function LeadsTab() {
  const [data, setData] = useState<Lead[]>(mockLeads);
  const [search, setSearch] = useState("");
  const [temp, setTemp] = useState<"all" | "hot" | "warm" | "cold">("all");
  const sort = useSortState<Lead>("createdAt");

  useEffect(() => {
    fetch("/api/leads").then(r => r.json()).then(setData).catch(() => {});
  }, []);

  const filtered = sortArr(
    data
      .filter(l => temp === "all" || l.score === temp)
      .filter(l => !search || [l.name, l.phone, l.email, l.location].some(v =>
        v?.toLowerCase().includes(search.toLowerCase())
      )),
    sort.col, sort.dir
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--bg-base)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-1 self-start">
          {(["all","hot","warm","cold"] as const).map(f => (
            <button key={f} onClick={() => setTemp(f)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${temp === f ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => exportCSV(filtered.map(l => ({ name: l.name, phone: l.phone, email: l.email, source: l.source, temperature: l.score, budget: l.budget, location: l.location, created: l.createdAt, notes: l.notes })), "reapa-leads")}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[var(--bg-card)] border border-[var(--border)] rounded-lg hover:border-indigo-500 hover:text-indigo-400 transition-colors ml-auto">
          <Download size={13} /> Export CSV
        </button>
      </div>
      <p className="text-xs text-[var(--text-muted)]">{filtered.length} lead{filtered.length !== 1 ? "s" : ""}</p>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-base)] border-b border-[var(--border)]">
            <tr>
              <Th label="Name"        colKey="name"        sort={sort} />
              <Th label="Contact"     colKey="phone"       sort={sort} />
              <Th label="Source"      colKey="source"      sort={sort} />
              <Th label="Temp"        colKey="score"       sort={sort} />
              <Th label="Budget"      colKey="budget"      sort={sort} />
              <Th label="Location"    colKey="location"    sort={sort} />
              <Th label="Added"       colKey="createdAt"   sort={sort} />
              <Th label="Auto-reply"  colKey="autoReplied" sort={sort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filtered.map(l => (
              <tr key={l.id} className="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-colors">
                <td className="px-3 py-2.5">
                  <div className="font-medium text-[var(--text-primary)] whitespace-nowrap">{l.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">{l.nationality}</div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="text-xs whitespace-nowrap">{l.phone}</div>
                  <div className="text-xs text-[var(--text-muted)] truncate max-w-[150px]">{l.email}</div>
                </td>
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-1.5 text-xs capitalize">
                    {sourceIcons[l.source] ?? null}{l.source}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${tempCls[l.score] ?? ""}`}>
                    {l.score}
                  </span>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-xs">{formatCurrency(l.budget)}</td>
                <td className="px-3 py-2.5 text-xs whitespace-nowrap">{l.location}</td>
                <td className="px-3 py-2.5 text-xs text-[var(--text-muted)] whitespace-nowrap">{timeAgo(l.createdAt)}</td>
                <td className="px-3 py-2.5 text-center text-xs">
                  {l.autoReplied
                    ? <span className="text-indigo-400">🤖 Yes</span>
                    : <span className="text-[var(--text-muted)]">—</span>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-sm text-[var(--text-muted)]">No leads match your filters</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Clients tab ───────────────────────────────────────────────────────────────
const sentimentEmoji: Record<string, string> = { positive: "😊", neutral: "😐", hesitant: "😟", negative: "😠" };

function ClientsTab() {
  const [data, setData] = useState<Client[]>(mockClients);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("all");
  const sort = useSortState<Client>("lastContact");

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setData).catch(() => {});
  }, []);

  const stages = ["new","qualified","viewing","offer","closed"] as const;

  const filtered = sortArr(
    data
      .filter(c => stage === "all" || c.stage === stage)
      .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())),
    sort.col, sort.dir
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--bg-base)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-1 flex-wrap self-start">
          <button onClick={() => setStage("all")} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${stage === "all" ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>All</button>
          {stages.map(s => (
            <button key={s} onClick={() => setStage(s)}
              className={`px-3 py-1 rounded text-xs font-medium capitalize transition-colors ${stage === s ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>{s}</button>
          ))}
        </div>
      </div>
      <p className="text-xs text-[var(--text-muted)]">{filtered.length} client{filtered.length !== 1 ? "s" : ""}</p>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-base)] border-b border-[var(--border)]">
            <tr>
              <Th label="Name"         colKey="name"        sort={sort} />
              <Th label="Stage"        colKey="stage"       sort={sort} />
              <Th label="Budget"       colKey="budget"      sort={sort} />
              <Th label="Agent"        colKey="agent"       sort={sort} />
              <Th label="Last Contact" colKey="lastContact" sort={sort} />
              <Th label="Inactive"     colKey="daysInactive" sort={sort} />
              <Th label="Sentiment"    colKey="sentiment"   sort={sort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filtered.map(c => (
              <tr key={c.id} className={`bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-colors ${c.daysInactive >= 5 ? "border-l-2 border-orange-500" : ""}`}>
                <td className="px-3 py-2.5">
                  <div className="font-medium whitespace-nowrap">{c.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">{c.email}</div>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${stageCls[c.stage] ?? ""}`}>{c.stage}</span>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-xs">{formatCurrency(c.budget)}</td>
                <td className="px-3 py-2.5 text-xs whitespace-nowrap">{c.agent}</td>
                <td className="px-3 py-2.5 text-xs text-[var(--text-muted)] whitespace-nowrap">{timeAgo(c.lastContact)}</td>
                <td className="px-3 py-2.5">
                  <span className={`text-xs font-medium ${c.daysInactive >= 5 ? "text-orange-400" : "text-[var(--text-muted)]"}`}>{c.daysInactive}d</span>
                </td>
                <td className="px-3 py-2.5 text-xs capitalize">
                  {sentimentEmoji[c.sentiment] ?? ""} {c.sentiment}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-sm text-[var(--text-muted)]">No clients match your filters</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tasks tab ─────────────────────────────────────────────────────────────────
function TasksTab() {
  const [data, setData] = useState<Task[]>(mockTasks);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("all");
  const sort = useSortState<Task>("dueDate");

  useEffect(() => {
    fetch("/api/tasks").then(r => r.json()).then(setData).catch(() => {});
  }, []);

  const filtered = sortArr(
    data
      .filter(t => priority === "all" || t.priority === priority)
      .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()) || (t.clientName ?? "").toLowerCase().includes(search.toLowerCase())),
    sort.col, sort.dir
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--bg-base)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-1 self-start">
          {["all","urgent","high","medium","low"].map(p => (
            <button key={p} onClick={() => setPriority(p)}
              className={`px-3 py-1 rounded text-xs font-medium capitalize transition-colors ${priority === p ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>{p}</button>
          ))}
        </div>
      </div>
      <p className="text-xs text-[var(--text-muted)]">{filtered.length} task{filtered.length !== 1 ? "s" : ""}</p>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-base)] border-b border-[var(--border)]">
            <tr>
              <Th label="Title"    colKey="title"         sort={sort} />
              <Th label="Priority" colKey="priority"      sort={sort} />
              <Th label="Status"   colKey="status"        sort={sort} />
              <Th label="Category" colKey="category"      sort={sort} />
              <Th label="Due"      colKey="dueDate"       sort={sort} />
              <Th label="Client"   colKey="clientName"    sort={sort} />
              <Th label="Source"   colKey="autoGenerated" sort={sort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filtered.map(t => (
              <tr key={t.id} className="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-colors">
                <td className="px-3 py-2.5 max-w-[220px]">
                  <div className="font-medium text-[var(--text-primary)] line-clamp-2">{t.title}</div>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${priorCls[t.priority] ?? ""}`}>{t.priority}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`text-xs capitalize ${t.status === "overdue" ? "text-red-400" : t.status === "done" ? "text-emerald-400" : "text-[var(--text-muted)]"}`}>
                    {t.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-1.5 text-xs capitalize">
                    {catIcons[t.category] ?? null}{t.category.replace("_", " ")}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-xs text-[var(--text-muted)] whitespace-nowrap">
                  {t.dueDate}{t.dueTime ? ` ${t.dueTime}` : ""}
                </td>
                <td className="px-3 py-2.5 text-xs text-[var(--text-muted)]">{t.clientName ?? "—"}</td>
                <td className="px-3 py-2.5 text-center text-xs">
                  {t.autoGenerated ? <span className="text-indigo-400">🤖 AI</span> : <span className="text-[var(--text-muted)]">Manual</span>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-sm text-[var(--text-muted)]">No tasks match your filters</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
type Tab = "leads" | "clients" | "tasks";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "leads",   label: "Leads",   icon: UserPlus    },
  { id: "clients", label: "Clients", icon: Users       },
  { id: "tasks",   label: "Tasks",   icon: CheckSquare },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("leads");
  const [leadsCount, setLeadsCount]     = useState(mockLeads.length);
  const [clientsCount, setClientsCount] = useState(mockClients.length);
  const [tasksCount, setTasksCount]     = useState(mockTasks.filter(t => t.status !== "done").length);

  useEffect(() => {
    fetch("/api/leads").then(r => r.json()).then((d: Lead[]) => Array.isArray(d) && setLeadsCount(d.length)).catch(() => {});
    fetch("/api/clients").then(r => r.json()).then((d: Client[]) => Array.isArray(d) && setClientsCount(d.length)).catch(() => {});
    fetch("/api/tasks").then(r => r.json()).then((d: Task[]) => Array.isArray(d) && setTasksCount(d.filter(t => t.status !== "done").length)).catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Shield size={18} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-sm text-[var(--text-muted)]">Manage leads, clients &amp; tasks</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live data
        </div>
      </div>

      {/* stat strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Leads",    value: leadsCount,   icon: UserPlus,    color: "text-indigo-400" },
          { label: "Active Clients", value: clientsCount, icon: Users,       color: "text-purple-400" },
          { label: "Pending Tasks",  value: tasksCount,   icon: CheckSquare, color: "text-orange-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={15} className={color} />
              <span className="text-xs text-[var(--text-muted)]">{label}</span>
            </div>
            <div className="text-2xl font-bold">{value}</div>
          </div>
        ))}
      </div>

      {/* tab bar */}
      <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-1 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === id ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"}`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {/* tab content */}
      <div className="min-h-[400px]">
        {tab === "leads"   && <LeadsTab />}
        {tab === "clients" && <ClientsTab />}
        {tab === "tasks"   && <TasksTab />}
      </div>
    </div>
  );
}
