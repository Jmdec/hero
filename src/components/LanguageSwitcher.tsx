"use client";

import { useEffect, useRef, useState } from "react";

const LOCALE_COOKIE_KEY = "hero_lang";

const LANGUAGES = [
  { code: "en", label: "EN", name: "English" },
  { code: "ja", label: "JA", name: "日本語" },
] as const;

function getStoredLocale(): (typeof LANGUAGES)[number]["code"] {
  if (typeof document === "undefined") return "en";

  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE_KEY}=([^;]+)`),
  );

  return match?.[1] === "ja" ? "ja" : "en";
}

function setStoredLocale(locale: (typeof LANGUAGES)[number]["code"]) {
  const maxAge = 60 * 60 * 24 * 365;
  const cookieOptions = `path=/; max-age=${maxAge}; SameSite=Lax`;

  document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; ${cookieOptions}`;

  if (window.location.hostname) {
    document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; domain=${window.location.hostname}; ${cookieOptions}`;
  }
}

export default function LanguageSwitcher() {
  const [current, setCurrent] = useState<(typeof LANGUAGES)[number]>(
    LANGUAGES[0],
  );
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const found = LANGUAGES.find((lang) => lang.code === getStoredLocale());
    if (found) {
      setCurrent(found);
      return;
    }

    setCurrent(LANGUAGES[0]);
  }, []);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const switchLanguage = (lang: (typeof LANGUAGES)[number]) => {
    setCurrent(lang);
    setOpen(false);
    setStoredLocale(lang.code);
    window.dispatchEvent(new CustomEvent("localeChanged", { detail: lang.code }));
  };

  return (
    <div className="relative notranslate" ref={dropdownRef}>
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-[#1B3A8C] hover:bg-[#C5D2EC]/30 rounded-lg transition-colors select-none"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="uppercase tracking-wide">{current.label}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                current.code === lang.code
                  ? "text-[#1B3A8C] bg-[#C5D2EC]/30 font-medium"
                  : "text-gray-700 hover:bg-gray-50 hover:text-[#1B3A8C]"
              }`}
            >
              <span className="w-7 text-xs font-mono text-gray-400 uppercase">
                {lang.label}
              </span>
              <span>{lang.name}</span>
              {current.code === lang.code && (
                <svg
                  className="ml-auto w-3.5 h-3.5 text-[#1B3A8C]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
