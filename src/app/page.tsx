import Link from "next/link";
import { SanatoriumCard } from "@/components/SanatoriumCard";
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

      <section className="section" id="countries">
        <div className="container">
          <h2>Browse by destination</h2>
          <p className="sub">Choose a country to explore its sanatoriums and resorts.</p>
          <div className="country-grid">
            {countries.map((c) => (
              <Link href={`/sanatoriums?country=${c.slug}`} className="country-card" key={c.id}>
                <div className="flag">{c.flag}</div>
                <h3>{c.name}</h3>
                <div className="count">{c.count} resorts →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="treatments" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2>Treatment profiles</h2>
          <p className="sub">Find resorts specializing in your condition.</p>
          <div className="filters">
            {treatments.map((t) => (
              <Link href={`/sanatoriums?treatment=${t.slug}`} className="chip" key={t.id}>
                {t.name} ({t.count})
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
                treatments={s.treatments}
              />
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <Link href="/sanatoriums" className="btn">View all resorts</Link>
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
            <a href="mailto:info@healthvoyage.com" className="btn">Request a consultation</a>
          </div>
        </div>
      </section>
    </main>
  );
}
