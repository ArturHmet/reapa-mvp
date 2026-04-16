"use client";
import { useState } from "react";
import Link from "next/link";
import { Bot, CheckCircle, Zap, Users, TrendingUp, Shield } from "lucide-react";

const features = [
  { icon: Zap, title: "AI Lead Scoring", desc: "Hot/warm/cold from any channel" },
  { icon: Users, title: "Client Manager", desc: "Ghost alerts, sentiment, AML" },
  { icon: TrendingUp, title: "Smart Tasks", desc: "AI follow-ups + viewings" },
  { icon: Shield, title: "Malta-Ready", desc: "FIAU, GDPR, EN/RU/ES" },
];

export default function WaitlistPage() {
  const [form, setForm] = useState({ email: "", name: "", role: "agent" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading"); setError("");
    try {
      const source = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("utm_source") || document.referrer || "direct"
        : "direct";
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source, language: typeof navigator !== "undefined" ? navigator.language?.slice(0, 2) || "en" : "en" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("success");
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).posthog?.capture("waitlist_signup", { email: form.email, role: form.role, source });
      } catch { /* ignore */ }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">You&apos;re on the list!</h2>
          <p className="text-[var(--text-muted)] mb-4">We&apos;ll email <strong>{form.email}</strong> when ready.</p>
          <Link href="/login" className="text-indigo-400 hover:underline text-sm">Already have access? Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center"><Bot size={16} className="text-white" /></div>
            <span className="font-bold text-sm bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">REAPA</span>
          </div>
          <Link href="/login" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Already have access? Sign in &#8594;</Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6">
              <Zap size={12} /> Early Access &#8212; Malta Real Estate
            </div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">Your AI personal assistant for real estate</h1>
            <p className="text-[var(--text-muted)] text-lg mb-6">REAPA manages leads, clients, tasks, and compliance so you close more deals.</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-3">
                  <Icon size={16} className="text-indigo-400 mb-1.5" />
                  <div className="text-xs font-semibold mb-0.5">{title}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{desc}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)]">&#10003; Free during beta &bull; &#127474;&#127481; Built in Malta &bull; &#128274; GDPR-safe</p>
          </div>
          <div>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl">
              <h2 className="text-xl font-semibold mb-1">Get early access</h2>
              <p className="text-sm text-[var(--text-muted)] mb-6">Join agents already on the waitlist</p>
              {status === "error" && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Full name</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" className="w-full px-4 py-2.5 bg-[var(--bg-base)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Work email <span className="text-red-400">*</span></label>
                  <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" className="w-full px-4 py-2.5 bg-[var(--bg-base)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1.5">I am a&#8230;</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full px-4 py-2.5 bg-[var(--bg-base)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors">
                    <option value="agent">Real Estate Agent</option>
                    <option value="buyer">Property Buyer</option>
                    <option value="seller">Property Seller</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <button type="submit" disabled={status === "loading"} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all text-sm">
                  {status === "loading" ? "Joining&#8230;" : "Join the waitlist &#8594;"}
                </button>
              </form>
              <p className="text-center text-[10px] text-[var(--text-muted)] mt-4">No spam. &#127474;&#127481;</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
