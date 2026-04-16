import { useTranslation } from "react-i18next";
import i18n, { SUPPORTED_LANGUAGES, type SupportedLang } from "@/lib/i18n/config";

export function useLocale() {
  const { t } = useTranslation();
  const lang = i18n.language as SupportedLang;
  const entry = SUPPORTED_LANGUAGES.find((l) => l.code === lang);

  const setLanguage = (code: SupportedLang) => {
    i18n.changeLanguage(code);
  };

  return {
    t,
    lang,
    dir: entry?.dir ?? "ltr",
    languages: SUPPORTED_LANGUAGES,
    setLanguage,
  };
}
