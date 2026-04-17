"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";

/**
 * UX-BETA-002: First-login onboarding screen.
 * Shows once after signup — localStorage key "reapa_onboarded" absent = show, "1" = skip.
 * signup/page.tsx clears the key on successful signup.
 */
export function OnboardingWelcome() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("reapa_onboarded")) {
      setVisible(true);
    }
  }, []);

  const handleStart = () => {
    localStorage.setItem("reapa_onboarded", "1");
    setVisible(false);
    router.push("/leads");
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto">
          <Sparkles size={28} className="text-indigo-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Your AI assistant is ready.</h2>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed">Let&apos;s create your first listing.</p>
        </div>
        <button
          onClick={handleStart}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium rounded-xl transition-all text-sm"
        >
          Get started
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
