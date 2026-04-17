"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import "@/lib/i18n/config";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { captureEvent } from "@/lib/posthog";
import { Check } from "lucide-react";

const LANGS = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "ru", flag: "🇷🇺", label: "Русский" },
  { code: "es", flag: "🇪🇸", label: "Español" },
] as const;

type LangCode = "en" | "ru" | "es";

function detectLocale(): LangCode {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("ru")) return "ru";
  if (lang.startsWith("es")) return "es";
  return "en";
}

export default function OnboardingLanguage() {
  const { t, i18n } = useTranslation();
  const router       = useRouter();
  const [selected, setSelected] = useState<LangCode>("en");
  const [saving,   setSaving]   = useState(false);

  useEffect(() => { setSelected(detectLocale()); }, []);

  async function handleContinue() {
    setSaving(true);
    const supabase = getSupabaseBrowser();
    // Save locale to user metadata
    await supabase.auth.updateUser({ data: { locale: selected } }).catch(() => {});
    // Switch i18n locale immediately (no reload)
    await i18n.changeLanguage(selected);
    captureEvent("onboarding_language_selected", { language: selected });
    router.push("/onboarding/try-copilot");
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Back + progress */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/onboarding/welcome")}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            {t("onboarding.backBtn")}
          </button>
          <div className="flex-1 flex justify-center">
            <ProgressDots current={1} />
          </div>
          <div className="w-10" />
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{t("onboarding.s2Headline")}</h1>
          <p className="text-[var(--text-muted)] text-sm">{t("onboarding.s2Subhead")}</p>
        </div>

        {/* Language cards */}
        <div className="grid grid-cols-3 gap-3">
          {LANGS.map(lang => (
            <button
              key={lang.code}
              onClick={() => setSelected(lang.code)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                selected === lang.code
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/50"
              }`}
            >
              {selected === lang.code && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </div>
              )}
              <span className="text-2xl">{lang.flag}</span>
              <span className="text-xs font-medium">{lang.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={saving}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all text-sm"
        >
          {saving ? "…" : t("onboarding.s2Continue")}
        </button>
      </div>
    </div>
  );
}

function ProgressDots({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {[0, 1, 2].map(i => (
        <div key={i} className={`rounded-full transition-all ${i === current ? "w-6 h-2 bg-indigo-500" : "w-2 h-2 bg-[var(--border)]"}`} />
      ))}
    </div>
  );
}
