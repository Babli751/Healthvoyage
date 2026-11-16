"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

const LABELS: Record<string, { short: string; name: string; flag: string }> = {
  en: { short: "EN", name: "English", flag: "🇬🇧" },
  ru: { short: "RU", name: "Русский", flag: "🇷🇺" },
  az: { short: "AZ", name: "Azərbaycan", flag: "🇦🇿" },
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function pick(loc: string) {
    setOpen(false);
    if (loc === locale) return;
    // Replace current path, keeping the same page, under the new locale.
    router.replace(pathname, { locale: loc });
  }

  const current = LABELS[locale] ?? LABELS.en;

  return (
    <div className="langsw" ref={ref}>
      <button className="langsw-btn" onClick={() => setOpen((o) => !o)} aria-label="Change language">
        <span>{current.flag}</span>
        <span>{current.short}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="langsw-menu">
          {routing.locales.map((loc) => {
            const l = LABELS[loc];
            return (
              <button
                key={loc}
                className={`langsw-item ${loc === locale ? "active" : ""}`}
                onClick={() => pick(loc)}
              >
                <span>{l.flag}</span>
                <span>{l.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
