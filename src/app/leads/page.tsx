"use client";
import { Card, Badge } from "@/components/UI";
import { leads as mockLeads, type Lead } from "@/lib/data";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { Search, MessageSquare, Mail, Globe, Star, Heart, Users, Zap, Phone, UserCheck, UserPlus } from "lucide-react";
import { useState, useEffect, MouseEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/config";
import { useToast } from "@/components/Toast";

const sourceIcons: Record<string, ReactNode> = {
  whatsapp:  <MessageSquare size={14} className="text-green-400" />,
  email:     <Mail          size={14} className="text-blue-400" />,
  portal:    <Globe         size={14} className="text-purple-400" />,
  instagram: <Star          size={14} className="text-pink-400" />,
  facebook:  <Heart         size={14} className="text-blue-500" />,
  referral:  <Users         size={14} className="text-orange-400" />,
};

const scoreVariants: Record<string, "hot" | "warm" | "cold"> = { hot: "hot", warm: "warm", cold: "cold" };

export default function LeadsPage() {
  const { t }                         = useTranslation();
  const { addToast }                  = useToast();
  const [leadsData, setLeadsData]     = useState<Lead[]>(mockLeads);
  const [filter, setFilter]           = useState<"all" | "hot" | "warm" | "cold">("all");
  const [search, setSearch]           = useState("");

  useEffect(() => {
    fetch("/api/leads").then(r => r.json()).then(setLeadsData).catch(() => {});
  }, []);

  function handleConverted(id: string) {
    setLeadsData(prev => prev.filter(l => l.id !== id));
    addToast(t("leads.converted"), "success");
  }

  function handleConvertError() {
    addToast(t("leads.convertError"), "error");
  }

  const filterLabels: Record<string, string> = {
    all:  t("leads.filterAll"),
    hot:  t("leads.filterHot"),
    warm: t("leads.filterWarm"),
    cold: t("leads.filterCold"),
  };

  const filtered = leadsData
    .filter(lead => filter === "all" || lead.score === filter)
    .filter(lead =>
      search === "" ||
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.location.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{t("leads.title")}</h1>
          <p className="text-sm text-[var(--text-muted)]">{t("leads.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="hot">{leadsData.filter(l => l.score === "hot").length}  {t("leads.filterHot")}</Badge>
          <Badge variant="warm">{leadsData.filter(l => l.score === "warm").length} {t("leads.filterWarm")}</Badge>
          <Badge variant="cold">{leadsData.filter(l => l.score === "cold").length} {t("leads.filterCold")}</Badge>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 sm:max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder={t("leads.searchPlaceholder")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div className="flex bg-[var(--bg-card)] border border-[var(--border)] rounded-lg overflow-hidden self-start">
          {(["all", "hot", "warm", "cold"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${filter === f ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(lead => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onConverted={handleConverted}
            onConvertError={handleConvertError}
          />
        ))}
        {filtered.length === 0 && leadsData.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
              <UserPlus size={22} className="text-indigo-400" />
            </div>
            <p className="font-semibold text-sm mb-1">{t("leads.emptyTitle")}</p>
            <p className="text-xs text-[var(--text-muted)] mb-4">{t("leads.emptyDesc")}</p>
            <a href="#add" className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] text-white text-xs rounded-lg hover:bg-[var(--accent-hover)] transition-colors">
              <UserPlus size={13} /> {t("leads.addFirst")}
            </a>
          </div>
        )}
        {filtered.length === 0 && leadsData.length > 0 && (
          <div className="text-center text-sm text-[var(--text-muted)] py-12">{t("leads.noResults")}</div>
        )}
      </div>
    </div>
  );
}

// ── LeadCard ──────────────────────────────────────────────────────────────────
function LeadCard({
  lead,
  onConverted,
  onConvertError,
}: {
  lead: Lead;
  onConverted:   (id: string) => void;
  onConvertError: () => void;
}) {
  const { t }                         = useTranslation();
  const [expanded, setExpanded]       = useState(false);
  const [converting, setConverting]   = useState(false);

  const aiScore = lead.score === "hot" ? 95 : lead.score === "warm" ? 65 : 30;
  const whatsappHref = `https://wa.me/${lead.phone.replace(/\D/g, "")}`;

  async function handleConvert(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setConverting(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/convert`, { method: "POST" });
      if (res.ok) {
        onConverted(lead.id);
      } else {
        onConvertError();
      }
    } catch {
      onConvertError();
    } finally {
      setConverting(false);
    }
  }

  return (
    <Card
      className="hover:border-[var(--accent)]/30 transition-colors cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3 md:gap-4">
        <div className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
          lead.score === "hot"  ? "bg-gradient-to-br from-red-500 to-orange-500" :
          lead.score === "warm" ? "bg-gradient-to-br from-orange-500 to-yellow-500" :
                                  "bg-gradient-to-br from-blue-500 to-cyan-500"
        }`}>
          {lead.name.split(" ").map(n => n[0]).join("")}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium text-sm">{lead.name}</span>
            <Badge variant={scoreVariants[lead.score]}>{lead.score.toUpperCase()}</Badge>
            <span className="hidden sm:flex items-center gap-1">
              {sourceIcons[lead.source]}
              <span className="text-[10px] text-[var(--text-muted)]">{lead.source}</span>
            </span>
            {lead.autoReplied && (
              <span className="hidden sm:flex items-center gap-1 text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                <Zap size={10} /> {t("leads.autoReplied")}
              </span>
            )}
          </div>

          <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 sm:gap-2 mb-2 flex-wrap">
            <span>{lead.nationality}</span><span>&bull;</span>
            <span>{formatCurrency(lead.budget)}</span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="hidden sm:inline">{lead.bedrooms}BR {lead.propertyType}</span>
            <span className="hidden md:inline">&bull;</span>
            <span className="hidden md:inline">{lead.location}</span>
            <span className="hidden md:inline">&bull;</span>
            <span className="hidden md:inline">{timeAgo(lead.createdAt)}</span>
          </div>

          <p className="text-xs text-[var(--text-muted)] truncate sm:whitespace-normal">
            &quot;{lead.message}&quot;
          </p>

          {expanded && (
            <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs">
                {lead.phone && <span className="text-[var(--text-muted)]">📱 {lead.phone}</span>}
                {lead.email && <span className="text-[var(--text-muted)]">📧 {lead.email}</span>}
              </div>

              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-3">
                <div className="text-[10px] text-indigo-400 font-medium mb-1">{t("leads.aiNotes")}</div>
                <div className="text-xs">{lead.notes}</div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                {/* Call */}
                <a
                  href={`tel:${lead.phone}`}
                  onClick={e => e.stopPropagation()}
                  className="px-3 py-1.5 bg-[var(--accent)] text-white text-xs rounded-lg hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-1"
                >
                  <Phone size={12} /> {t("leads.callNow")}
                </a>

                {/* WhatsApp */}
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="px-3 py-1.5 bg-[var(--bg)] text-[var(--text)] text-xs rounded-lg border border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors flex items-center gap-1"
                >
                  <MessageSquare size={12} /> {t("leads.whatsapp")}
                </a>

                {/* Email */}
                {lead.email && (
                  <a
                    href={`mailto:${lead.email}`}
                    onClick={e => e.stopPropagation()}
                    className="px-3 py-1.5 bg-[var(--bg)] text-[var(--text)] text-xs rounded-lg border border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors flex items-center gap-1"
                  >
                    <Mail size={12} /> {t("leads.email")}
                  </a>
                )}

                {/* Convert to Client */}
                <button
                  onClick={handleConvert}
                  disabled={converting}
                  className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs rounded-lg hover:bg-emerald-500/25 disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  <UserCheck size={12} />
                  {converting ? "…" : t("leads.convertToClient")}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-right flex-shrink-0">
          <div className={`text-lg font-bold ${
            lead.score === "hot"  ? "text-red-400"    :
            lead.score === "warm" ? "text-orange-400" :
                                    "text-blue-400"
          }`}>
            {aiScore}
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">{t("leads.aiScore")}</div>
        </div>
      </div>
    </Card>
  );
}
