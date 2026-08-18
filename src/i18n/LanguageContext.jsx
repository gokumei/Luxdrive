import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "@/i18n/translations";

const STORAGE_KEY = "luxdrive.language";
const DEFAULT_LANGUAGE = "de";
const ALLOWED_LANGUAGES = new Set(["de", "en"]);
const LanguageContext = createContext(null);

function readSavedLanguage() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return ALLOWED_LANGUAGES.has(saved) ? saved : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

function getValue(source, path) {
  return path.split(".").reduce((value, part) => value?.[part], source);
}

function interpolate(value, variables) {
  if (typeof value !== "string") return value;
  return value.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(variables, name) ? String(variables[name]) : match
  );
}

function updateMeta(selector, content) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute("content", content);
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readSavedLanguage);

  const setLanguage = useCallback((nextLanguage) => {
    const normalized = ALLOWED_LANGUAGES.has(nextLanguage) ? nextLanguage : DEFAULT_LANGUAGE;
    setLanguageState(normalized);
    try { window.localStorage.setItem(STORAGE_KEY, normalized); } catch { /* German remains the safe runtime fallback. */ }
  }, []);

  const t = useCallback((key, variables = {}) => {
    const localized = getValue(translations[language], key);
    const german = getValue(translations.de, key);
    return interpolate(localized ?? german ?? key, variables);
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t("seo.title");
    updateMeta('meta[name="description"]', t("seo.description"));
    updateMeta('meta[property="og:title"]', t("seo.title"));
    updateMeta('meta[property="og:description"]', t("seo.ogDescription"));
  }, [language, t]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
