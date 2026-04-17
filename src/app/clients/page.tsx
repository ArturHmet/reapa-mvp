"use client";
import { Card, Badge } from "@/components/UI";
import { clients as mockClients, type Client } from "@/lib/data";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { Search, AlertTriangle, Ghost, MessageSquare, Phone, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/config";

const stageColors: Record<string, string> = {
  new: "bg-blue-500", qualified: "bg-purple-500", viewing: "bg-orange-500",
  offer: "bg-yellow-500", closed: "bg-emerald-500",
};
const sentimentEmojis: Record<string, string> = {
  positive: "😊", neutral: "😐", hesitant: "😟", negative: "😠",
};
const sentimentVariants: Record<string, "green" | "muted" | "orange" | "red"> = {
  positive: "green", neutral: "muted", hesitant: "orange", negative: "red",
};

export default function ClientsPage() {
  const { t } = useTranslation();
  const [clientsData, setClientsData] = useState<Client[]>(mockClients);
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClientsData).catch(() => {});
  }, []);

  const stageLabels: Record<string, string> = {
    new:       t("clients.stageNew"),
    qualified: t("clients.stageQualified"),
    viewing:   t("clients.stageViewing"),
    offer:     t("clients.stageOffer"),
    closed:    t("clients.stageClosed"),
  };

  const filtered = clientsData
    .filter(c => stageFilter === "all" || c.stage === stageFilter)
    .filter(c => search === "" || c.name.toLowerCase().includes(search.toLowerCase()));

  const ghostClients = clientsData.filter(c => c.daysInactive >= 5);

  const isEmptyTable = clientsData.length === 0;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{t("clients.title")}</h1>
          <p className="text-sm text-[var(--text-muted)]">{t("clients.subtitle")}</p>
        </div>
        {ghostClients.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 text-xs">
            <AlertTriangle size={14} />
            {ghostClients.length} {t("clients.ghostAlert", { count: ghostClients.length })}
          </div>
        )}
      </div>

      {/* Funnel Overview */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
        {(["new", "qualified", "viewing", "offer", "closed"] as const).map(stage => {
          const count = clientsData.filter(c => c.stage === stage).length;
          return (
            <button key={stage} onClick={() => setStageFilter(stageFilter === stage ? "all" : stage)}
              className={`p-2 sm:p-3 rounded-xl border transition-all text-center ${stageFilter === stage ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/50"}`}>
              <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${stageColors[stage]}`} />
              <div className="text-lg font-bold">{count}</div>
              <div className="text-[10px] text-[var(--text-muted)]">{stageLabels[stage]}</div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input type="text" placeholder={t("clients.searchPlaceholder")} value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]" />
      </div>

      {/* Client Cards */}
      <div className="space-y-3">
        {filtered.map(client => (
          <Card key={client.id} className={`hover:border-[var(--accent)]/30 transition-colors ${client.daysInactive >= 5 ? "border-orange-500/30" : ""}`}>
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {client.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-sm">{client.name}</span>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${stageColors[client.stage] || "bg-gray-500"}`} />
                  <span className="text-[10px] text-[var(--text-muted)]">{stageLabels[client.stage] || client.stage}</span>
                  {client.daysInactive >= 5 && (
                    <span className="text-[10px] text-orange-400 flex items-center gap-1">
                      <Ghost size={10} /> {t("clients.ghost")}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 sm:gap-2 mb-2 flex-wrap">
                  <span>{client.nationality}</span><span>•</span><span>{formatCurrency(client.budget)}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">{client.bedrooms}BR {client.propertyType}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">{client.preferredArea}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[var(--text-muted)]">{t("clients.lastContact")}: {timeAgo(client.lastContact)}</span>
                  <Badge variant={sentimentVariants[client.sentiment]}>
                    {sentimentEmojis[client.sentiment]} {client.sentiment}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                {client.phone ? (
                  <a href={`tel:${client.phone}`} title={t("clients.call")}
                    className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--bg-card-hover)] hover:border-indigo-500/50 transition-colors">
                    <Phone size={13} className="text-[var(--text-muted)]" />
                  </a>
                ) : (
                  <button disabled className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] opacity-30 cursor-not-allowed">
                    <Phone size={13} className="text-[var(--text-muted)]" />
                  </button>
                )}
                {client.phone ? (
                  <a href={`https://wa.me/${client.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                    title="WhatsApp"
                    className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--bg-card-hover)] hover:border-green-500/50 transition-colors">
                    <MessageSquare size={13} className="text-[var(--text-muted)]" />
                  </a>
                ) : (
                  <button disabled className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] opacity-30 cursor-not-allowed">
                    <MessageSquare size={13} className="text-[var(--text-muted)]" />
                  </button>
                )}
                <button title={t("clients.viewProfile")}
                  className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--bg-card-hover)] hover:border-purple-500/50 transition-colors">
                  <Eye size={13} className="text-[var(--text-muted)]" />
                </button>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && !isEmptyTable && (
          <div className="text-center text-sm text-[var(--text-muted)] py-12">{t("clients.noResults")}</div>
        )}
      </div>
    </div>
  );
}
