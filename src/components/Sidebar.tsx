"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserPlus, CheckSquare, BarChart3, Bot, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: UserPlus },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
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
          <span className="font-bold text-sm tracking-tight">REAPA</span>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static z-50 h-screen flex flex-col border-r border-[var(--border)] bg-[var(--bg-card)]
        w-[260px] md:w-[220px]
        transition-transform duration-200 ease-out
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        top-0 left-0
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--border)]">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight">REAPA</div>
            <div className="text-[10px] text-[var(--text-muted)]">AI Real Estate Assistant</div>
          </div>
          <button onClick={() => setOpen(false)} className="md:hidden ml-auto p-1 rounded-lg hover:bg-[var(--bg-card-hover)]">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-3 space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card-hover)]"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Agent Info */}
        <div className="px-4 py-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
              A
            </div>
            <div>
              <div className="text-xs font-medium">Agent Demo</div>
              <div className="text-[10px] text-[var(--text-muted)]">Malta Office</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
