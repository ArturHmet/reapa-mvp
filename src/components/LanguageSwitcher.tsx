"use client";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import { SUPPORTED_LOCALES, type LocaleCode } from "@/lib/i18n/config";
import i18n from "@/lib/i18n/config";

export function LanguageSwitcher() {
  const { i18n: i18nInstance } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = SUPPORTED_LOCALES.find(
    (l) => l.code === i18nInstance.language
  ) ?? SUPPORTED_LOCALES[0];

  const handleSelect = (code: LocaleCode) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text)]"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe size={15} />
        <span className="hidden sm:inline">{current.flag} {current.code.toUpperCase()}</span>
        <span className="sm:hidden">{current.flag}</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Language selector"
          className="absolute bottom-full mb-2 right-0 w-44 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xl py-1 z-50"
        >
          {SUPPORTED_LOCALES.map((locale) => (
            <button
              key={locale.code}
              role="option"
              aria-selected={locale.code === current.code}
              onClick={() => handleSelect(locale.code)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-[var(--bg)] transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>{locale.flag}</span>
                <span className={locale.code === current.code ? "text-[var(--text)]" : "text-[var(--text-muted)]"}>
                  {locale.label}
                </span>
              </span>
              {locale.code === current.code && (
                <Check size={13} className="text-blue-400" />
              )}
            </button>
          ))}
          {/* Placeholder for future RTL languages */}
          <div className="mx-3 mt-1 pt-1 border-t border-[var(--border)]">
            <span className="text-xs text-[var(--text-muted)]">More languages coming soon</span>
          </div>
        </div>
      )}
    </div>
  );
}
