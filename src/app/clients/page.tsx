"use client";
import { Card, Badge, ProgressBar } from "@/components/UI";
import { clients, type Client, funnelData } from "@/lib/data";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { Search, AlertTriangle, TrendingUp, Ghost, MessageSquare, Phone, Eye } from "lucide-react";
import { useState } from "react";

const stageColors: Record<string, string> = {
  new: "bg-blue-500", qualified: "bg-purple-500", viewing: "bg-orange-500", offer: "bg-yellow-500", closed: "bg-emerald-500"
};
const stageLabels: Record<string, string> = {
  new: "New", qualified: "Qualified", viewing: "Viewing", offer: "Offer", closed: "Closed"
};
const sentimentEmojis: Record<string, string> = {
  positive: "😊", neutral: "😐", hesitant: "😟", negative: "😠"
};
const sentimentVariants: Record<string, "green" | "muted" | "orange" | "red"> = {
  positive: "green", neutral: "muted", hesitant: "orange", negative: "red"
};

export default function ClientsPage() {
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = clients
    .filter(c => stageFilter === "all" || c.stage === stageFilter)
    .filter(c => search === "" || c.name.toLowerCase().includes(search.toLowerCase()));

  const ghostClients = clients.filter(c => c.daysInactive >= 5);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Client Manager</h1>
          <p className="text-sm text-[var(--text-muted)]">AI-powered CRM with sentiment tracking</p>
        </div>
      </div>

      {/* Funnel Overview */}
      <div className="grid grid-cols-5 gap-3">
        {(["new", "qualified", "viewing", "offer", "closed"] as const).map(stage => {
          const count = clients.filter(c => c.stage === stage).length;
          return (
            <button
              key={stage}
              onClick={() => setStageFilter(stageFilter === stage ? "all" : stage)}
              className={`p-3 rounded-xl border text-center transition-all ${
                stageFilter === stage
                  ? "border-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/30"
              }`}
            >
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${stageColors[stage]}`} />
              <div className="text-lg font-bold">{count}</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{stageLabels[stage]}</div>
            </button>
          );
        })}
      </div>

      {/* Ghost Alert */}
      {ghostClients.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-start gap-3">
          <Ghost size={20} className="text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-orange-400">Ghost Client Alert</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              {ghostClients.map(c => c.name).join(', ')} — inactive for {ghostClients[0].daysInactive}+ days.
              AI suggests re-engagement via market update or buy-vs-rent analysis.
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      {/* Client Cards */}
      <div className="space-y-3">
        {filtered.map(client => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>
    </div>
  );
}

function ClientCard({ client }: { client: Client }) {
  const [expanded, setExpanded] = useState(false);
  const isGhost = client.daysInactive >= 5;

  return (
    <Card className={`transition-colors cursor-pointer ${isGhost ? 'border-orange-500/30' : 'hover:border-[var(--accent)]/30'}`} onClick={() => setExpanded(!expanded)}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${stageColors[client.stage]}`}>
          {client.name.split(' ').map(n => n[0]).join('')}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{client.name}</span>
            <Badge variant={sentimentVariants[client.sentiment]}>
              {sentimentEmojis[client.sentiment]} {client.sentiment}
            </Badge>
            {isGhost && <Badge variant="orange">👻 {client.daysInactive}d inactive</Badge>}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-2 mb-1">
            <span>{client.nationality}</span>
            <span>•</span>
            <span>{formatCurrency(client.budget)}</span>
            <span>•</span>
            <span>{client.bedrooms}BR {client.propertyType}</span>
            <span>•</span>
            <span>{client.preferredArea}</span>
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {client.viewingsCount} viewings • Last contact: {timeAgo(client.lastContact)}
          </div>

          {expanded && (
            <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-3">
              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-3">
                <div className="text-[10px] text-indigo-400 font-medium mb-1">🤖 AI Notes</div>
                <div className="text-xs">{client.notes}</div>
              </div>
              {/* Stage Progress */}
              <div>
                <div className="text-[10px] text-[var(--text-muted)] mb-2">Client Journey</div>
                <div className="flex items-center gap-1">
                  {(["new", "qualified", "viewing", "offer", "closed"] as const).map((s, i) => {
                    const stages = ["new", "qualified", "viewing", "offer", "closed"];
                    const current = stages.indexOf(client.stage);
                    const active = i <= current;
                    return (
                      <div key={s} className="flex items-center gap-1 flex-1">
                        <div className={`h-1.5 flex-1 rounded-full ${active ? stageColors[s] : 'bg-[var(--bg)]'}`} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[9px] text-[var(--text-muted)] mt-1">
                  <span>New</span><span>Qualified</span><span>Viewing</span><span>Offer</span><span>Closed</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-[var(--accent)] text-white text-xs rounded-lg hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-1">
                  <Phone size={12} /> Call
                </button>
                <button className="px-3 py-1.5 bg-[var(--bg)] text-[var(--text)] text-xs rounded-lg border border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors flex items-center gap-1">
                  <MessageSquare size={12} /> WhatsApp
                </button>
                <button className="px-3 py-1.5 bg-[var(--bg)] text-[var(--text)] text-xs rounded-lg border border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors flex items-center gap-1">
                  <Eye size={12} /> Schedule Viewing
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stage badge */}
        <div className="text-right flex-shrink-0">
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${stageColors[client.stage]}/15`}>
            <div className={`w-2 h-2 rounded-full ${stageColors[client.stage]}`} />
            {stageLabels[client.stage]}
          </div>
        </div>
      </div>
    </Card>
  );
}
