'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { defaultLocale, locales, type Locale } from '../i18n.config';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string | Record<string, string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Import translations
import enMessages from '../messages/en.json';
import jaMessages from '../messages/ja.json';

const messages: Record<Locale, typeof enMessages> = {
  en: enMessages,
  ja: jaMessages,
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    if (locales.includes(newLocale)) {
      setLocaleState(newLocale);
      // Store preference in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferred-locale', newLocale);
      }
    }
  }, []);

  // Translation function
  const t = useCallback(
    (key: string): string | Record<string, string> => {
      const keys = key.split('.');
      let value: unknown = messages[locale];

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          // Fallback to English if key not found
          let fallback: unknown = messages.en;
          for (const fk of keys) {
            if (fallback && typeof fallback === 'object' && fk in fallback) {
              fallback = (fallback as Record<string, unknown>)[fk];
            } else {
              return key; // Return key as last resort
            }
          }
          return fallback as string;
        }
      }

      if (typeof value === 'string') {
        // Replace {year} and other placeholders
        return value.replace(/\{year\}/g, new Date().getFullYear().toString());
      }

      return value as Record<string, string>;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
