"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const LANGUAGES = [
  { code: "en", label: "EN", name: "English" },
  { code: "ja", label: "JA", name: "日本語" },
];

export default function LanguageSwitcher() {
  const [current, setCurrent] = useState(LANGUAGES[0]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hidden container for Google Translate widget
    if (!document.getElementById("google_translate_element")) {
      const el = document.createElement("div");
      el.id = "google_translate_element";
      el.style.display = "none";
      document.body.appendChild(el);
    }

    // Suppress ALL Google Translate UI chrome
    if (!document.getElementById("gt-suppress-styles")) {
      const style = document.createElement("style");
      style.id = "gt-suppress-styles";
      style.textContent = `
        .goog-te-banner-frame { display: none !important; }
        .goog-te-balloon-frame { display: none !important; }
        #goog-gt-tt { display: none !important; }
        .goog-tooltip { display: none !important; }
        .skiptranslate { display: none !important; }
        body { top: 0 !important; }
        body.translated-ltr { margin-top: 0 !important; }
        body.translated-rtl { margin-top: 0 !important; }
        .goog-logo-link { display: none !important; }
        .goog-te-gadget > span { display: none !important; }
      `;
      document.head.appendChild(style);
    }

    // Inject Google Translate script once
    if (!document.getElementById("google-translate-script")) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { pageLanguage: "en", autoDisplay: false },
          "google_translate_element",
        );
      };
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    // Re-apply body top suppression whenever GT modifies it
    const observer = new MutationObserver(() => {
      const body = document.body;
      if (body.style.top && body.style.top !== "0px") {
        body.style.top = "0px";
      }
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => observer.disconnect();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const switchLanguage = (lang: (typeof LANGUAGES)[0]) => {
    setCurrent(lang);
    setOpen(false);

    if (lang.code === "en") {
      document.cookie =
        "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      window.location.reload();
      return;
    }

    const value = `/en/${lang.code}`;
    document.cookie = `googtrans=${value}; path=/`;
    document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;

    const tryTranslate = (attempts = 0) => {
      const select =
        document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (select) {
        select.value = lang.code;
        select.dispatchEvent(new Event("change"));
      } else if (attempts < 30) {
        setTimeout(() => tryTranslate(attempts + 1), 200);
      }
    };
    tryTranslate();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
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
