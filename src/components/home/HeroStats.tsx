"use client";

import { useTranslations } from "next-intl";
import { CountUp } from "@/components/CountUp";

export function HeroStats({ totalSan, countries, treatments }: { totalSan: number; countries: number; treatments: number }) {
  const t = useTranslations();
  const items: [number, string, string][] = [
    [totalSan, t("home.statResorts"), ""],
    [countries, t("home.statCountries"), ""],
    [treatments, t("home.statTreatments"), ""],
    [98, t("home.statSatisfaction"), "%"],
  ];
  return (
    <div className="hero2-stats">
      {items.map(([n, l, s], i) => (
        <div key={l} className="glass hero2-stat anim-float" style={{ animationDelay: `${i * 0.6}s` }}>
          <div className="hero2-stat-n"><CountUp end={n} suffix={s} /></div>
          <div className="hero2-stat-l">{l}</div>
        </div>
      ))}
    </div>
  );
}
