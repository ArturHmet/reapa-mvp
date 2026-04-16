"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserPlus, CheckSquare, BarChart3, Bot, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocale } from "@/hooks/useLocale";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t } = useLocale();

  const nav = [
    { href: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/leads", label: t("nav.leads"), icon: UserPlus },
    { href: "/clients", label: t("nav.clients"), icon: Users },
    { href: "/tasks", label: t("nav.tasks"), icon: CheckSquare },
    { href: "/analytics", label: t("nav.analytics"), icon: BarChart3 },
  ];

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[var(--bg-card)] border-b border-[var(--border)]">
        <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors" aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <Bot size={14} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">{t("app.name")}</span>
        </div>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      <aside className={`
        fixed md:static z-50 h-screen flex flex-col border-r border-[var(--border)] bg-[var(--bg-card)]
        w-[260px] md:w-[220px] transition-transform duration-200 ease-out
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 top-0 left-0
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--border)]">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight">{t("app.name")}</div>
            <div className="text-[10px] text-[var(--text-muted)]">{t("app.tagline")}</div>
          </div>
          <button onClick={() => setOpen(false)} className="md:hidden ml-auto p-1 rounded-lg hover:bg-[var(--bg-card-hover)]">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-3 space-y-0.5 sidebar-nav">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card-hover)]"
              }`}>
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Agent Info + Language Switcher */}
        <div className="px-4 py-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
              A
            </div>
            <div>
              <div className="text-xs font-medium">Agent Demo</div>
              <div className="text-[10px] text-[var(--text-muted)]">{t("app.office")}</div>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </aside>
    </>
  );
}
