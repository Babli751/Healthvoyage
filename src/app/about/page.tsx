import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteNav } from "@/components/SiteNav";
import { countSanatoriums, getCountriesWithCounts, getTreatmentsWithCounts } from "@/lib/queries";
import { IconShield, IconHeadphones, IconBadge, IconPlane, IconArrowRight } from "@/components/Icon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About — HealthVoyage",
  description:
    "HealthVoyage connects international patients with trusted health resorts and sanatoriums, coordinating treatment and recovery abroad.",
};

const VALUES = [
  { Icon: IconShield, t: "Curated resorts", d: "Each listing shows a real treatment profile so you can match care to your condition." },
  { Icon: IconHeadphones, t: "Free coordination", d: "We handle the back-and-forth with resorts on programs, pricing and availability." },
  { Icon: IconPlane, t: "International support", d: "English-speaking help with travel, transfers and documents." },
  { Icon: IconBadge, t: "Real partnerships", d: "We work directly with resorts to confirm what they offer." },
];

export default async function AboutPage() {
  const [totalSan, countries, treatments] = await Promise.all([
    countSanatoriums(),
    getCountriesWithCounts(),
    getTreatmentsWithCounts(),
  ]);

  return (
    <main>
      <SiteNav />
      <section className="page-hero page-hero-nav">
        <div className="container">
          <span className="eyebrow eyebrow-light">About us</span>
          <h1>Your health journey, in safe hands</h1>
          <p>
            A platform connecting international patients with trusted health resorts
            and sanatoriums across the region.
          </p>
        </div>
      </section>

      {/* stat strip */}
      <section className="about-stats">
        <div className="container about-stats-inner">
          {[[totalSan, "Health resorts"], [countries.length, "Countries"], [treatments.length, "Treatment profiles"], ["Free", "Consultation"]].map(([n, l]) => (
            <div key={l as string} className="about-stat">
              <div className="about-stat-n">{n}</div>
              <div className="about-stat-l">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* intro split */}
      <section className="section">
        <div className="container about-split">
          <Image src="/hero/hero.jpg" alt="Thermal resort" width={560} height={460} className="about-img reveal" style={{ objectFit: "cover" }} />
          <div className="reveal">
            <h2>What we do</h2>
            <p>
              HealthVoyage helps patients find the right place for treatment and
              recovery abroad — from Naftalan oil therapy and thermal balneology to
              rehabilitation and specialised sanatorium programs. We bring resorts from
              several countries into one catalog so you can compare by destination,
              treatment profile and more.
            </p>
            <p style={{ marginTop: 14 }}>
              We specialise in balneological and sanatorium care across Azerbaijan,
              Georgia, Belarus, Lithuania, Hungary, Russia and Serbia — regions with a
              long tradition of mineral-water, mud and climate therapies, alongside
              modern medical and rehabilitation centers.
            </p>
          </div>
        </div>
      </section>

      {/* values */}
      <section className="sec-soft">
        <div className="container">
          <div className="sechead sechead-center">
            <span className="eyebrow">How we help</span>
            <h2 className="sectitle">One point of contact, start to finish</h2>
          </div>
          <div className="about-values">
            {VALUES.map((v) => (
              <div key={v.t} className="reveal about-value">
                <span className="about-value-ic"><v.Icon width={24} height={24} /></span>
                <h3>{v.t}</h3>
                <p>{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container sec">
        <div className="reveal about-cta grad-primary">
          <div className="about-cta-orb" aria-hidden="true" />
          <div className="about-cta-text">
            <h2 className="sectitle" style={{ color: "#fff" }}>Ready to start?</h2>
            <p>Tell us your condition and preferred destination — the consultation is free.</p>
          </div>
          <Link href="/contact" className="about-cta-btn">Request a consultation <IconArrowRight width={16} height={16} /></Link>
        </div>
      </section>
    </main>
  );
}
