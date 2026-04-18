"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/config";
import { captureEvent } from "@/lib/posthog";

const BULLETS = [
  { emoji: "✅", key: "s1Bullet1" },
  { emoji: "✅", key: "s1Bullet2" },
  { emoji: "✅", key: "s1Bullet3" },
] as const;

export default function OnboardingWelcome() {
  const { t } = useTranslation();
  const router  = useRouter();

  // Sprint 11 — funnel step 1 viewed
  useEffect(() => {
    captureEvent("onboarding_step_viewed", { step: 1 });
  }, []);

  function handleGetStarted() {
    captureEvent("onboarding_screen1_cta");
    // Sprint 11 — funnel step 1 completed
    captureEvent("onboarding_step_completed", { step: 1 });
    router.push("/onboarding/language");
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm flex flex-col gap-6 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-xl">R</span>
          </div>
        </div>

        {/* Progress dots */}
        <ProgressDots current={0} />

        {/* Headline */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{t("onboarding.s1Headline")}</h1>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed">{t("onboarding.s1Subhead")}</p>
        </div>

        <hr className="border-[var(--border)]" />

        {/* Value bullets */}
        <ul className="flex flex-col gap-3 text-left">
          {BULLETS.map(b => (
            <li key={b.key} className="flex items-start gap-3 text-sm">
              <span className="text-base mt-0.5 flex-shrink-0">{b.emoji}</span>
              <span>{t(`onboarding.${b.key}`)}</span>
            </li>
          ))}
        </ul>

        <hr className="border-[var(--border)]" />

        <button
          onClick={handleGetStarted}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 text-sm"
        >
          {t("onboarding.s1Cta")}
        </button>
      </div>
    </div>
  );
}

export function ProgressDots({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {[0, 1, 2].map(i => (
        <div key={i} className={`rounded-full transition-all ${i === current ? "w-6 h-2 bg-indigo-500" : "w-2 h-2 bg-[var(--border)]"}`} />
      ))}
    </div>
  );
}
