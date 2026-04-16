"use client";
import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import "@/lib/i18n/config"; // initialise
import i18n, { SUPPORTED_LANGUAGES } from "@/lib/i18n/config";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Sync html lang + dir attributes when language changes
    const update = (lng: string) => {
      document.documentElement.lang = lng;
      const entry = SUPPORTED_LANGUAGES.find((l) => l.code === lng);
      document.documentElement.dir = entry?.dir ?? "ltr";
    };
    update(i18n.language);
    i18n.on("languageChanged", update);
    return () => { i18n.off("languageChanged", update); };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
