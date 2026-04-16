
"use client";

import { useState } from "react";

const features = [
  {
    icon: "📱",
    title: "Client Communication",
    desc: "REAPA answers client questions instantly — day or night. Personalized, on-brand, in their language.",
  },
  {
    icon: "📝",
    title: "Listing Writer",
    desc: "Generate compelling property descriptions in seconds. 10 languages. Your tone. Publish-ready.",
  },
  {
    icon: "🎯",
    title: "Lead Follow-Up",
    desc: "Automatic follow-up sequences for every lead. No more cold contacts going cold.",
  },
  {
    icon: "🗣️",
    title: "Multilingual Support",
    desc: "Arabic buyers. Russian investors. Spanish-speaking families. REAPA speaks 10 languages fluently.",
  },
  {
    icon: "📅",
    title: "Viewing Coordination",
    desc: "Schedule, confirm, and follow up on viewings without lifting a finger.",
  },
  {
    icon: "📊",
    title: "Lead Qualification",
    desc: "Know which leads are serious before you pick up the phone.",
  },
];

const testimonials = [
  {
    quote: "I spend 3 hours a day on WhatsApp. If this takes even half of that off my plate, I'm in.",
    author: "Real estate agent, Dubai",
  },
  {
    quote: "My clients speak Russian, Arabic, and English. REAPA handling all three would be a game changer.",
    author: "Real estate agent, Malta",
  },
  {
    quote: "When can I use it? Seriously, when?",
    author: "Real estate agent, Spain",
  },
];

const steps = [
  { n: "1", title: "Connect REAPA", desc: "to your WhatsApp, email, or CRM" },
  { n: "2", title: "Train it on your listings", desc: "and communication style" },
  { n: "3", title: "Watch it work", desc: "while you focus on what matters" },
];

const languages = ["English", "Russian", "Spanish", "Arabic", "French", "German", "Portuguese", "Chinese", "Turkish", "Hindi"];

function WaitlistForm({ variant = "hero" }: { variant?: "hero" | "footer" }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role: "Real estate agent" }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Something went wrong. Try again.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-6 px-8 rounded-2xl" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)" }}>
        <div className="text-3xl mb-2">🎉</div>
        <p className="text-white font-semibold text-lg">You&apos;re on the list!</p>
        <p style={{ color: "var(--text-muted)" }} className="text-sm mt-1">We&apos;ll be in touch with founding member pricing.</p>
      </div>
    );
  }

  const isHero = variant === "hero";

  return (
    <form onSubmit={handleSubmit} className={isHero ? "flex flex-col gap-3 w-full max-w-md" : "flex flex-col gap-3 w-full max-w-lg mx-auto"}>
      {isHero && (
        <input
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={e => setName(e.target.value)}
          className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--text)" }}
        />
      )}
      <div className="flex gap-2">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--text)" }}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 rounded-xl font-semibold text-sm text-white whitespace-nowrap cursor-pointer disabled:opacity-60 transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        >
          {loading ? "..." : "Join Free →"}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs text-center">{error}</p>}
      <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
        No credit card required. Cancel anytime.
      </p>
    </form>
  );
}

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)" }}>
        <span className="font-bold text-lg tracking-tight gradient-text">REAPA</span>
        <a href="#waitlist"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          Join Waitlist
        </a>
      </nav>

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center min-h-screen pt-20 pb-20 px-6 text-center overflow-hidden">
        {/* Glow BG */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}>
            🚀 47+ real estate agents on the waitlist
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6" style={{ color: "var(--text)" }}>
            Your{" "}
            <span className="gradient-text">AI-Powered</span>
            <br />
            Personal Assistant
            <br />
            for Real Estate.
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
            Stop spending your day on admin. REAPA handles client messages, listing descriptions,
            lead follow-ups, and more — in 10 languages, 24/7.
          </p>

          <div className="flex flex-col items-center gap-4">
            <WaitlistForm variant="hero" />
          </div>

          {/* Social proof bar */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
            <span>🌍 Used by agents in</span>
            {["Malta", "Dubai", "Madrid", "Moscow", "Berlin"].map(c => (
              <span key={c} className="px-2 py-0.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)" }}>{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: "var(--text)" }}>
            Real estate agents are drowning in admin work.
          </h2>
          <div className="space-y-4 text-left max-w-xl mx-auto">
            {[
              "3 hours a day answering the same WhatsApp messages",
              "Rewriting the same listing descriptions over and over",
              "Chasing leads who never reply",
            ].map(item => (
              <div key={item} className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <span className="text-red-400 mt-0.5">✗</span>
                <p style={{ color: "var(--text-muted)" }}>{item}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-lg font-medium" style={{ color: "var(--text)" }}>
            The best agents aren&apos;t the busiest ones.
            <br />
            <span className="gradient-text">They&apos;re the ones who spend their time where it matters.</span>
          </p>
        </div>
      </section>

      {/* SOLUTION + FEATURES */}
      <section className="py-24 px-6" style={{ background: "var(--bg-card)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--text)" }}>
              Meet REAPA — Your AI Personal Assistant.
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-muted)" }}>
              Built for one purpose: give real estate agents their time back. Works for you 24/7.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(f => (
              <div key={f.title} className="p-6 rounded-2xl transition-all hover:scale-[1.02]"
                style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-base mb-2" style={{ color: "var(--text)" }}>{f.title}</h3>
                <p className="text-sm" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--text)" }}>
            Up and running in 5 minutes.
          </h2>
          <p className="mb-16" style={{ color: "var(--text-muted)" }}>No technical setup. No learning curve. Just results.</p>
          <div className="flex flex-col md:flex-row gap-6 items-start justify-center">
            {steps.map((s, i) => (
              <div key={s.n} className="flex-1 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>{s.n}</div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute" style={{ /* connector arrow handled by flex gap */ }} />
                )}
                <h3 className="font-semibold mb-1" style={{ color: "var(--text)" }}>{s.title}</h3>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6" style={{ background: "var(--bg-card)" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16" style={{ color: "var(--text)" }}>
            What agents are saying
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.author} className="p-6 rounded-2xl"
                style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                <p className="text-sm italic mb-4" style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="text-xs font-medium" style={{ color: "#a5b4fc" }}>— {t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MULTILINGUAL */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--text)" }}>
            Built for global real estate markets.
          </h2>
          <p className="mb-10 max-w-xl mx-auto" style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
            Real estate is one of the most multilingual industries in the world.
            REAPA communicates with your clients in their native language — automatically.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {languages.map(lang => (
              <span key={lang} className="px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#c4b5fd" }}>
                {lang}
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm" style={{ color: "var(--text-muted)" }}>
            No extra setup. No translation fees. Just seamless communication.
          </p>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="py-16 px-6" style={{ background: "var(--bg-card)" }}>
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: "var(--text)" }}>
            Simple, fair pricing. Starting free.
          </h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
            A free tier for solo agents and affordable plans for teams.
            We believe great tools shouldn&apos;t be exclusive to large agencies.
          </p>
          <p className="mt-4 font-medium" style={{ color: "#a5b4fc" }}>
            ✨ Founding member pricing available for waitlist members.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="waitlist" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)" }} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: "var(--text)" }}>
            Stop losing deals to slow responses.
          </h2>
          <p className="text-lg mb-10" style={{ color: "var(--text-muted)" }}>
            Join 100+ real estate agents getting early access to REAPA.
          </p>
          <WaitlistForm variant="footer" />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="font-semibold mb-1 gradient-text">REAPA</p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Your AI real estate assistant, always on.</p>
      </footer>

    </div>
  );
}
