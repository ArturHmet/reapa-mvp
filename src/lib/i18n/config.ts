"use client";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "@/locales/en/common.json";
import enRealestate from "@/locales/en/realestate.json";
import ruCommon from "@/locales/ru/common.json";
import ruRealestate from "@/locales/ru/realestate.json";
import esCommon from "@/locales/es/common.json";
import esRealestate from "@/locales/es/realestate.json";

export const SUPPORTED_LOCALES = [
  { code: "en", label: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "ru", label: "Русский", flag: "🇷🇺", dir: "ltr" },
  { code: "es", label: "Español", flag: "🇪🇸", dir: "ltr" },
  // Future: { code: "ar", label: "العربية", flag: "🇦🇪", dir: "rtl" },
  // Future: { code: "mt", label: "Malti", flag: "🇲🇹", dir: "ltr" },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "en";
export const LOCALE_STORAGE_KEY = "reapa_locale";

export const RTL_LOCALES: string[] = []; // add "ar" when ready

export function getLocaleDir(code: string): "ltr" | "rtl" {
  return RTL_LOCALES.includes(code) ? "rtl" : "ltr";
}

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { common: enCommon, realestate: enRealestate },
        ru: { common: ruCommon, realestate: ruRealestate },
        es: { common: esCommon, realestate: esRealestate },
      },
      defaultNS: "common",
      fallbackLng: DEFAULT_LOCALE,
      supportedLngs: SUPPORTED_LOCALES.map((l) => l.code),
      detection: {
        order: ["localStorage", "navigator"],
        lookupLocalStorage: LOCALE_STORAGE_KEY,
        caches: ["localStorage"],
      },
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });
}

export default i18n;
