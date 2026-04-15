"use client";
import { useEffect, ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { getLocaleDir } from "./config";

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  // Sync html[lang] and html[dir] on locale changes
  useEffect(() => {
    const syncHtml = (lng: string) => {
      document.documentElement.lang = lng;
      document.documentElement.dir = getLocaleDir(lng);
    };
    syncHtml(i18n.language || "en");
    i18n.on("languageChanged", syncHtml);
    return () => i18n.off("languageChanged", syncHtml);
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
