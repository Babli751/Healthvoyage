"use client";

import { useEffect } from "react";

// Global reveal: watches every .reveal element and adds .in when it scrolls
// into view. Respects reduced motion. Also exported as a wrapper component.
export function RevealManager() {
  useEffect(() => {
    const showAll = () =>
      document.querySelectorAll(".reveal:not(.in)").forEach((el) => el.classList.add("in"));

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      showAll();
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
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );

    const observe = () => {
      document.querySelectorAll(".reveal:not(.in)").forEach((el) => {
        // Anything already within/above the viewport reveals immediately.
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.95) el.classList.add("in");
        else io.observe(el);
      });
    };
    observe();

    // Fallback: never leave content hidden if something goes wrong.
    const failSafe = window.setTimeout(showAll, 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(failSafe);
    };
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
