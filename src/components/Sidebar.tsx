"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, UserPlus, CheckSquare, BarChart3, Bot, Menu, X, LogOut, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocale } from "@/hooks/useLocale";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[17px] text-center leading-snug tabular-nums">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen]             = useState(false);
  const { t }                       = useLocale();
  const [user, setUser]             = useState<User | null>(null);
  const [hotLeads, setHotLeads]     = useState(0);
  const [pendingTasks, setPending]  = useState(0);

  // ── live badge counts ──────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/dashboard")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        setHotLeads(d.hotLeads || 0);
        setPending((d.pendingTasks || 0) + (d.overdueTasks || 0));
      })
      .catch(() => {});
  }, [pathname]); // refetch when route changes to keep counts fresh

  const nav = [
    { href: "/",          label: t("nav.dashboard"), icon: LayoutDashboard, badge: 0          },
    { href: "/leads",     label: t("nav.leads"),     icon: UserPlus,        badge: hotLeads   },
    { href: "/clients",   label: t("nav.clients"),   icon: Users,           badge: 0          },
    { href: "/tasks",     label: t("nav.tasks"),     icon: CheckSquare,     badge: pendingTasks },
    { href: "/analytics", label: t("nav.analytics"), icon: BarChart3,       badge: 0          },
  ];

  useEffect(() => {
    const id = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(id);
  }, [pathname]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    try { await getSupabaseBrowser().auth.signOut(); } catch { /* ignore */ }
    router.push("/login");
    router.refresh();
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Agent Demo";
  const initials    = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[var(--bg-card)] border-b border-[var(--border)]">
        <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors" aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center"><Bot size={14} className="text-white" /></div>
          <span className="font-bold text-sm tracking-tight">{t("app.name")}</span>
        </div>
      </div>

      {open && <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      <aside className={`fixed md:static z-50 h-screen flex flex-col border-r border-[var(--border)] bg-[var(--bg-card)] w-[260px] md:w-[220px] transition-transform duration-200 ease-out ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 top-0 left-0`}>
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--border)]">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center"><Bot size={18} className="text-white" /></div>
          <div>
            <div className="font-bold text-sm tracking-tight">{t("app.name")}</div>
            <div className="text-[10px] text-[var(--text-muted)]">{t("app.tagline")}</div>
          </div>
          <button onClick={() => setOpen(false)} className="md:hidden ml-auto p-1 rounded-lg hover:bg-[var(--bg-card-hover)]"><X size={18} /></button>
        </div>

        <nav className="flex-1 py-3 px-3 space-y-0.5 sidebar-nav overflow-y-auto">
          {nav.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card-hover)]"}`}>
                <Icon size={18} />
                {label}
                <Badge count={badge} />
              </Link>
            );
          })}

          {/* Admin — separated with divider */}
          <div className="pt-2 mt-2 border-t border-[var(--border)]">
            <Link href="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${pathname === "/admin" || pathname.startsWith("/admin/") ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card-hover)]"}`}>
              <Shield size={18} />{t("nav.admin")}
            </Link>
          </div>
        </nav>

        <div className="px-4 py-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{initials}</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{displayName}</div>
              <div className="text-[10px] text-[var(--text-muted)] truncate">{user?.email || t("app.office")}</div>
            </div>
            {isSupabaseConfigured() && (
              <button onClick={handleSignOut} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0" title="Sign out" aria-label="Sign out">
                <LogOut size={15} />
              </button>
            )}
          </div>
          <LanguageSwitcher />
        </div>
      </aside>
    </>
  );
}
