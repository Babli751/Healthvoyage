"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { IconPhone, IconMenu, IconX } from "./Icon";
import { LanguageSwitcher } from "./LanguageSwitcher";

const links: [string, string][] = [
  ["nav.sanatoriums", "/sanatoriums"],
  ["nav.destinations", "/destinations"],
  ["nav.treatments", "/treatments"],
  ["nav.blog", "/blog"],
  ["nav.about", "/about"],
  ["nav.contact", "/contact"],
];

// transparent=true overlays a hero (home); it turns solid on scroll.
export function SiteNav({ transparent = false }: { transparent?: boolean }) {
  const t = useTranslations();
  const [scrolled, setScrolled] = useState(!transparent);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!transparent) return;
    const f = () => setScrolled(window.scrollY > 40);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, [transparent]);

  return (
    <header className={`sitenav ${scrolled ? "sitenav-solid" : "sitenav-clear"}`}>
      <div className="sitenav-inner">
        <Link href="/" className="sitenav-logo" aria-label="HealthVoyage home">
          <img src="/logo.png" alt="HealthVoyage" className="sitenav-logo-img" />
        </Link>

        <nav className="sitenav-links">
          {links.map(([key, href]) => (
            <Link key={key} href={href} className="sitenav-link">{t(key)}</Link>
          ))}
        </nav>

        <div className="sitenav-cta">
          <LanguageSwitcher />
          <Link href="/contact" className="sitenav-phone"><IconPhone width={16} height={16} /> {t("nav.support")}</Link>
          <Link href="/contact" className="sitenav-btn grad-primary">{t("nav.freeConsultation")}</Link>
        </div>

        <button className="sitenav-burger" aria-label="Menu" onClick={() => setOpen(!open)}>
          {open ? <IconX /> : <IconMenu />}
        </button>
      </div>

      {open && (
        <div className="sitenav-mobile">
          {links.map(([key, href]) => (
            <Link key={key} href={href} onClick={() => setOpen(false)}>{t(key)}</Link>
          ))}
          <div style={{ margin: "8px 0" }}><LanguageSwitcher /></div>
          <Link href="/contact" onClick={() => setOpen(false)} className="sitenav-btn grad-primary" style={{ marginTop: 8 }}>{t("nav.freeConsultation")}</Link>
        </div>
      )}
    </header>
  );
}
