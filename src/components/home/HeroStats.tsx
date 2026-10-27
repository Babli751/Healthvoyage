"use client";

import { CountUp } from "@/components/CountUp";

export function HeroStats({ totalSan, countries, treatments }: { totalSan: number; countries: number; treatments: number }) {
  const items: [number, string, string][] = [
    [totalSan, "Health resorts", ""],
    [countries, "Countries", ""],
    [treatments, "Treatment profiles", ""],
    [98, "Satisfaction", "%"],
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
