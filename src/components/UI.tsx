import { ReactNode } from "react";

export function Card({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = "default" }: { children: ReactNode; variant?: "hot" | "warm" | "cold" | "green" | "red" | "orange" | "blue" | "default" | "muted" }) {
  const colors: Record<string, string> = {
    hot: "bg-red-500/15 text-red-400 border-red-500/20",
    warm: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    cold: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    red: "bg-red-500/15 text-red-400 border-red-500/20",
    orange: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    blue: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    default: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
    muted: "bg-[var(--bg-card-hover)] text-[var(--text-muted)] border-[var(--border)]",
  };
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md border ${colors[variant]}`}>
      {children}
    </span>
  );
}

export function StatCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon?: ReactNode }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-1">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
          {sub && <div className="text-xs text-[var(--text-muted)] mt-1">{sub}</div>}
        </div>
        {icon && <div className="text-[var(--text-muted)]">{icon}</div>}
      </div>
    </Card>
  );
}

export function ProgressBar({ value, max, color = "var(--accent)" }: { value: number; max: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full h-2 bg-[var(--bg)] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
