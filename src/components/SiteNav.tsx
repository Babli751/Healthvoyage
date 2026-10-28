"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconPhone, IconMenu, IconX } from "./Icon";

const links = [
  ["Sanatoriums", "/sanatoriums"],
  ["Destinations", "/destinations"],
  ["Treatments", "/treatments"],
  ["Blog", "/blog"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

// transparent=true overlays a hero (home); it turns solid on scroll.
export function SiteNav({ transparent = false }: { transparent?: boolean }) {
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
          <span className="sitenav-mark grad-primary">
            <img src="/logo-icon.jpg" alt="" width={22} height={21} />
          </span>
          <span className="sitenav-word">Health<span>Voyage</span></span>
        </Link>

        <nav className="sitenav-links">
          {links.map(([label, href]) => (
            <Link key={label} href={href} className="sitenav-link">{label}</Link>
          ))}
        </nav>

        <div className="sitenav-cta">
          <a href="/contact" className="sitenav-phone"><IconPhone width={16} height={16} /> 24/7 support</a>
          <Link href="/contact" className="sitenav-btn grad-primary">Free consultation</Link>
        </div>

        <button className="sitenav-burger" aria-label="Menu" onClick={() => setOpen(!open)}>
          {open ? <IconX /> : <IconMenu />}
        </button>
      </div>

      {open && (
        <div className="sitenav-mobile">
          {links.map(([label, href]) => (
            <Link key={label} href={href} onClick={() => setOpen(false)}>{label}</Link>
          ))}
          <Link href="/contact" onClick={() => setOpen(false)} className="sitenav-btn grad-primary" style={{ marginTop: 8 }}>Free consultation</Link>
        </div>
      )}
    </header>
  );
}
