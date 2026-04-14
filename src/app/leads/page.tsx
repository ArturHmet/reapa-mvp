"use client";
import { Card, Badge } from "@/components/UI";
import { leads, type Lead } from "@/lib/data";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { Search, Filter, ArrowUpDown, MessageSquare, Mail, Globe, Star, Heart, Users, Zap, Phone } from "lucide-react";
import { useState } from "react";

const sourceIcons: Record<string, React.ReactNode> = {
  whatsapp: <MessageSquare size={14} className="text-green-400" />,
  email: <Mail size={14} className="text-blue-400" />,
  portal: <Globe size={14} className="text-purple-400" />,
  instagram: <Star size={14} className="text-pink-400" />,
  facebook: <Heart size={14} className="text-blue-500" />,
  referral: <Users size={14} className="text-orange-400" />,
};

const scoreVariants: Record<string, "hot" | "warm" | "cold"> = { hot: "hot", warm: "warm", cold: "cold" };

export default function LeadsPage() {
  const [filter, setFilter] = useState<"all" | "hot" | "warm" | "cold">("all");
  const [search, setSearch] = useState("");

  const filtered = leads
    .filter(l => filter === "all" || l.score === filter)
    .filter(l => search === "" || l.name.toLowerCase().includes(search.toLowerCase()) || l.location.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Lead Engine</h1>
          <p className="text-sm text-[var(--text-muted)]">AI-scored leads from all channels</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="hot">{leads.filter(l => l.score === 'hot').length} Hot</Badge>
          <Badge variant="warm">{leads.filter(l => l.score === 'warm').length} Warm</Badge>
          <Badge variant="cold">{leads.filter(l => l.score === 'cold').length} Cold</Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div className="flex bg-[var(--bg-card)] border border-[var(--border)] rounded-lg overflow-hidden">
          {(["all", "hot", "warm", "cold"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                filter === f ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Lead Cards */}
      <div className="space-y-3">
        {filtered.map(lead => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="hover:border-[var(--accent)]/30 transition-colors cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
          lead.score === 'hot' ? 'bg-gradient-to-br from-red-500 to-orange-500' :
          lead.score === 'warm' ? 'bg-gradient-to-br from-orange-500 to-yellow-500' :
          'bg-gradient-to-br from-blue-500 to-cyan-500'
        }`}>
          {lead.name.split(' ').map(n => n[0]).join('')}
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{lead.name}</span>
            <Badge variant={scoreVariants[lead.score]}>{lead.score.toUpperCase()}</Badge>
            <span className="flex items-center gap-1">{sourceIcons[lead.source]}<span className="text-[10px] text-[var(--text-muted)]">{lead.source}</span></span>
            {lead.autoReplied && (
              <span className="flex items-center gap-1 text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                <Zap size={10} /> Auto-replied
              </span>
            )}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-2 mb-2">
            <span>🇬🇧 {lead.nationality}</span>
            <span>•</span>
            <span>{formatCurrency(lead.budget)}</span>
            <span>•</span>
            <span>{lead.bedrooms}BR {lead.propertyType}</span>
            <span>•</span>
            <span>{lead.location}</span>
            <span>•</span>
            <span>{timeAgo(lead.createdAt)}</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">&quot;{lead.message}&quot;</p>

          {expanded && (
            <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-2">
              <div className="flex items-center gap-4 text-xs">
                <span className="text-[var(--text-muted)]">📱 {lead.phone}</span>
                <span className="text-[var(--text-muted)]">📧 {lead.email}</span>
              </div>
              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-3">
                <div className="text-[10px] text-indigo-400 font-medium mb-1">🤖 AI Notes</div>
                <div className="text-xs">{lead.notes}</div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-[var(--accent)] text-white text-xs rounded-lg hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-1">
                  <Phone size={12} /> Call Now
                </button>
                <button className="px-3 py-1.5 bg-[var(--bg)] text-[var(--text)] text-xs rounded-lg border border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors flex items-center gap-1">
                  <MessageSquare size={12} /> WhatsApp
                </button>
                <button className="px-3 py-1.5 bg-[var(--bg)] text-[var(--text)] text-xs rounded-lg border border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors flex items-center gap-1">
                  <Mail size={12} /> Email
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Score Ring */}
        <div className="text-right flex-shrink-0">
          <div className={`text-lg font-bold ${
            lead.score === 'hot' ? 'text-red-400' : lead.score === 'warm' ? 'text-orange-400' : 'text-blue-400'
          }`}>
            {lead.score === 'hot' ? '95' : lead.score === 'warm' ? '65' : '30'}
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">AI Score</div>
        </div>
      </div>
    </Card>
  );
}
