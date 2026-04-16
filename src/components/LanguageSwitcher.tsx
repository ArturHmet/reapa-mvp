"use client";
import { useState } from "react";
import { Globe } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";
import type { SupportedLang } from "@/lib/i18n/config";

export function LanguageSwitcher() {
  const { lang, languages, setLanguage } = useLocale();
  const [open, setOpen] = useState(false);
  const current = languages.find((l) => l.code === lang) ?? languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card-hover)] transition-colors"
        aria-label="Change language"
      >
        <Globe size={14} />
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.code.toUpperCase()}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-1 right-0 z-50 min-w-[140px] bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLanguage(l.code as SupportedLang); setOpen(false); }}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-sm transition-colors text-left ${
                  l.code === lang
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
