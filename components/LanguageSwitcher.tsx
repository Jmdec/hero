'use client';

import { useLanguage } from './LanguageProvider';
import { locales, type Locale } from '../i18n.config';
import { Globe } from 'lucide-react';

const languageNames: Record<Locale, string> = {
  en: 'English',
  ja: '日本語',
};

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#1B3A8C] rounded-lg hover:bg-[#C5D2EC]/30 transition-all duration-200"
        aria-label="Switch language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{languageNames[locale]}</span>
        <span className="sm:hidden uppercase">{locale}</span>
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          {locales.map((lang) => (
            <button
              key={lang}
              onClick={() => setLocale(lang)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-[#C5D2EC]/30 transition-colors ${
                locale === lang
                  ? 'text-[#1B3A8C] font-medium bg-[#C5D2EC]/30'
                  : 'text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="uppercase font-medium w-6">{lang}</span>
                <span>{languageNames[lang]}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
