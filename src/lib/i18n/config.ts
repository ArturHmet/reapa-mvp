import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "@/locales/en/common.json";
import enRealEstate from "@/locales/en/realestate.json";
import ruCommon from "@/locales/ru/common.json";
import ruRealEstate from "@/locales/ru/realestate.json";
import esCommon from "@/locales/es/common.json";
import esRealEstate from "@/locales/es/realestate.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "ru", name: "Русский", flag: "🇷🇺", dir: "ltr" },
  { code: "es", name: "Español", flag: "🇪🇸", dir: "ltr" },
  // Future: { code: "ar", name: "العربية", flag: "🇦🇪", dir: "rtl" },
] as const;

export type SupportedLang = (typeof SUPPORTED_LANGUAGES)[number]["code"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, realestate: enRealEstate },
      ru: { common: ruCommon, realestate: ruRealEstate },
      es: { common: esCommon, realestate: esRealEstate },
    },
    fallbackLng: "en",
    defaultNS: "common",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "reapa_lang",
    },
  });

export default i18n;
