"use client";
import { useTranslation } from "react-i18next";
import { getLocaleDir, type LocaleCode } from "@/lib/i18n/config";
import i18n from "@/lib/i18n/config";

export function useLocale() {
  const { i18n: i18nInstance, t } = useTranslation();
  const currentLocale = i18nInstance.language as LocaleCode;
  const dir = getLocaleDir(currentLocale);
  const isRTL = dir === "rtl";

  const changeLocale = (code: LocaleCode) => {
    i18n.changeLanguage(code);
  };

  return { currentLocale, dir, isRTL, changeLocale, t };
}
