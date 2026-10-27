"use client";

import { useEffect } from "react";

// Global reveal: watches every .reveal element and adds .in when it scrolls
// into view. Respects reduced motion. Also exported as a wrapper component.
export function RevealManager() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    const els = document.querySelectorAll(".reveal:not(.in)");
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

// Wrapper that renders a .reveal element (observed by RevealManager).
export function Reveal({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`reveal ${className}`} style={style}>
      {children}
    </div>
  );
}
