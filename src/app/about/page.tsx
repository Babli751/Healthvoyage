import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — HealthVoyage",
  description:
    "HealthVoyage connects international patients with trusted clinics, hospitals and health resorts, coordinating treatment and recovery abroad.",
};

export default function AboutPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <h1>About HealthVoyage</h1>
          <p>
            A medical-tourism platform connecting international patients with
            trusted health resorts, sanatoriums and clinics across the region.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container about-content">
          <h2>What we do</h2>
          <p>
            HealthVoyage helps patients find the right place for treatment and
            recovery abroad — from Naftalan oil therapy and thermal balneology to
            rehabilitation and specialized sanatorium programs. We bring resorts
            from several countries into one catalog so you can compare by
            destination, treatment profile and more.
          </p>

          <h2>How we help</h2>
          <ul className="about-list">
            <li><strong>Curated resorts</strong> — each listing shows a real treatment profile so you can match care to your condition.</li>
            <li><strong>Free coordination</strong> — we handle the back-and-forth with resorts on programs, pricing and availability.</li>
            <li><strong>International support</strong> — English-speaking help with travel, transfers and documents.</li>
            <li><strong>Real partnerships</strong> — we work directly with resorts to confirm what they offer.</li>
          </ul>

          <h2>Our focus</h2>
          <p>
            We specialize in balneological and sanatorium care across Azerbaijan,
            Georgia, Belarus, Lithuania, Hungary, Russia and Serbia — regions with
            a long tradition of mineral-water, mud and climate therapies, alongside
            modern medical and rehabilitation centers.
          </p>

          <div className="cta-box" style={{ marginTop: 32 }}>
            <h3>Ready to start?</h3>
            <p>Tell us your condition and preferred destination — the consultation is free.</p>
            <Link href="/contact" className="btn">Request a consultation</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
