import Link from "next/link";
import { SanatoriumCard } from "@/components/SanatoriumCard";
import { DestinationCard } from "@/components/DestinationCard";
import { TREATMENT_ICON } from "@/lib/treatmentInfo";
import {
  getCountriesWithCounts,
  getTreatmentsWithCounts,
  countSanatoriums,
  countTreatments,
  getFeaturedSanatoriums,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [countries, treatments, totalSan, totalTreat, featured] = await Promise.all([
    getCountriesWithCounts(),
    getTreatmentsWithCounts(),
    countSanatoriums(),
    countTreatments(),
    getFeaturedSanatoriums(6),
  ]);

  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>World-class treatment and recovery, close to home.</h1>
          <p>
            HealthVoyage connects international patients with trusted clinics,
            hospitals and health resorts — from Naftalan oil therapy to thermal
            balneology and rehabilitation.
          </p>
          <form className="searchbar" action="/sanatoriums">
            <input
              type="text"
              name="q"
              placeholder="Search by name, city, or treatment…"
              aria-label="Search sanatoriums"
            />
          </form>
          <div className="stats">
            <div className="stat">
              <div className="n">{totalSan}</div>
              <div className="l">Health resorts</div>
            </div>
            <div className="stat">
              <div className="n">{countries.length}</div>
              <div className="l">Countries</div>
            </div>
            <div className="stat">
              <div className="n">{totalTreat}</div>
              <div className="l">Treatment profiles</div>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-bar">
        <div className="container trust-bar-inner">
          <div className="trust-item"><strong>7</strong> partner destinations</div>
          <div className="trust-item"><strong>{totalSan}</strong> vetted health resorts</div>
          <div className="trust-item"><strong>{totalTreat}</strong> treatment profiles</div>
          <div className="trust-item"><strong>Free</strong> consultation &amp; coordination</div>
        </div>
      </section>

      <section className="section" id="how">
        <div className="container">
          <h2>How it works</h2>
          <p className="sub">From first question to recovery — we handle the journey.</p>
          <div className="steps">
            {[
              { n: 1, t: "Explore", d: "Browse resorts by destination or treatment profile and shortlist what fits your condition." },
              { n: 2, t: "Consult", d: "Send an inquiry. Our coordinators confirm suitability, programs and pricing with the resort." },
              { n: 3, t: "Plan", d: "We arrange your treatment program, dates, transfers and any documents you need." },
              { n: 4, t: "Heal", d: "Travel and receive care, with support throughout your stay and after you return home." },
            ].map((s) => (
              <div className="step" key={s.n}>
                <div className="step-n">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="countries">
        <div className="container">
          <h2>Browse by destination</h2>
          <p className="sub">Choose a country to explore its sanatoriums and resorts.</p>
          <div className="dest-grid">
            {countries.map((c) => (
              <DestinationCard key={c.id} slug={c.slug} name={c.name} flag={c.flag} cover={c.cover} count={c.count} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="treatments" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2>Treatment profiles</h2>
          <p className="sub">Find resorts specializing in your condition.</p>
          <div className="treat-grid">
            {treatments.map((t) => (
              <Link href={`/treatments/${t.slug}`} className="treat-tile" key={t.id}>
                <span className="treat-icon">{TREATMENT_ICON[t.slug] ?? "🩺"}</span>
                <span className="treat-name">{t.name}</span>
                <span className="treat-count">{t.count} resorts</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2>Featured resorts</h2>
          <p className="sub">A selection from across our destinations.</p>
          <div className="san-grid">
            {featured.map((s) => (
              <SanatoriumCard
                key={s.id}
                slug={s.slug}
                name={s.name}
                city={s.city}
                country={s.country_name}
                flag={s.country_flag}
                stars={s.stars}
                summary={s.summary}
                image={s.image}
                treatments={s.treatments}
              />
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <Link href="/sanatoriums" className="btn">View all resorts</Link>
          </div>
        </div>
      </section>

      <section className="section why" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2>Why patients choose HealthVoyage</h2>
          <p className="sub">A single point of contact for treatment and recovery abroad.</p>
          <div className="why-grid">
            {[
              { icon: "🩺", t: "Curated resorts", d: "Each sanatorium is listed with its real treatment profile — balneology, Naftalan, rehabilitation and more — so you match care to your condition." },
              { icon: "🌍", t: "International support", d: "English-speaking coordination, help with travel and transfers, and guidance before, during and after your stay." },
              { icon: "💬", t: "Free consultation", d: "Tell us your needs and we handle the back-and-forth with resorts. No fee to use the service." },
              { icon: "🤝", t: "Real partnerships", d: "We work directly with resorts and sanatoriums to confirm availability, programs and transparent pricing." },
            ].map((w) => (
              <div className="why-card" key={w.t}>
                <div className="why-icon">{w.icon}</div>
                <h3>{w.t}</h3>
                <p>{w.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="contact" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-box">
            <h3>Planning treatment abroad?</h3>
            <p>
              Tell us your condition and preferred destination. Our team arranges
              consultations, programs and transfers for international patients.
            </p>
            <Link href="/contact" className="btn">Request a consultation</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
