/* eslint-disable no-unused-vars */
"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { translations, Language } from "@/data/translations";

/** LocalStorage key for persisting language preference */
const LANGUAGE_STORAGE_KEY = "language";

/** Shape of the language context value */
type LanguageContextType = {
  /** Current active language ('en' or 'hi') */
  language: Language;
  /** Updates the active language and persists it */
  setLanguage: (lang: Language) => void;
  /** Translation lookup function using dot-notation paths */
  t: (path: string) => any;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

/**
 * Language provider component for bilingual (English/Hindi) support.
 * Manages the active language state, persists preference to localStorage,
 * and provides a translation lookup function with English fallback.
 *
 * @param {{ children: React.ReactNode }} props - Child components.
 * @returns {React.ReactElement} The provider wrapping children.
 *
 * @example
 * ```tsx
 * <LanguageProvider>
 *   <App />
 * </LanguageProvider>
 * ```
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (savedLang === "en" || savedLang === "hi") {
        setLanguageState(savedLang);
      }
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  /**
   * Sets the active language, persists to localStorage, and updates
   * the HTML lang attribute for screen readers and SEO.
   *
   * @param {Language} lang - The language code ('en' or 'hi').
   */
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // localStorage may be unavailable
    }
    document.documentElement.lang = lang;
  }, []);

  /**
   * Looks up a translation string using a dot-notation path.
   * Falls back to English if the key is missing in the current language.
   * Returns the path string itself if not found in any language.
   *
   * @param {string} path - Dot-notation key (e.g., 'nav.home', 'common.explore').
   * @returns {any} The translated string or the path if not found.
   *
   * @example
   * ```ts
   * t('nav.home');       // "Home" (en) or "मुख्य पृष्ठ" (hi)
   * t('missing.key');    // "missing.key" (fallback)
   * ```
   */
  const t = useCallback(
    (path: string) => {
      const keys = path.split(".");
      let result: any = translations[language];

      for (const key of keys) {
        if (result && result[key]) {
          result = result[key];
        } else {
          // Fallback to English if key missing in current language
          let fallback: any = translations["en"];
          for (const fKey of keys) {
            if (fallback && fallback[fKey]) {
              fallback = fallback[fKey];
            } else {
              return path; // Return path if not found anywhere
            }
          }
          return fallback;
        }
      }
      return result;
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access the language context.
 * Must be used within a LanguageProvider.
 *
 * @throws {Error} If used outside of LanguageProvider.
 * @returns {LanguageContextType} The language context value.
 *
 * @example
 * ```tsx
 * const { language, setLanguage, t } = useLanguage();
 * ```
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
