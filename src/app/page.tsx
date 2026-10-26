import Link from "next/link";
import { SanatoriumCard } from "@/components/SanatoriumCard";
import { DestinationCard } from "@/components/DestinationCard";
import { PremiumCard } from "@/components/PremiumCard";
import {
  getCountriesWithCounts,
  getTreatmentsWithCounts,
  countSanatoriums,
  countTreatments,
  getFeaturedSanatoriums,
  getTopChoiceSanatoriums,
  getSanatoriumsByTreatment,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [countries, treatments, totalSan, totalTreat, featured, topChoice, jointsResorts] =
    await Promise.all([
      getCountriesWithCounts(),
      getTreatmentsWithCounts(),
      countSanatoriums(),
      countTreatments(),
      getFeaturedSanatoriums(6),
      getTopChoiceSanatoriums(4),
      getSanatoriumsByTreatment("musculoskeletal-and-joints", 4),
    ]);

  return (
    <main>
      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-overlay" aria-hidden="true" />
        <div className="container hero-inner">
          <h1>World-class treatment and recovery, close to home.</h1>
          <p>
            HealthVoyage connects international patients with trusted clinics,
            hospitals and health resorts — from Naftalan oil therapy to thermal
            balneology and rehabilitation.
          </p>

          <form className="hero-search" action="/sanatoriums">
            <div className="hero-search-field">
              <label htmlFor="hs-treatment">What care are you looking for?</label>
              <select id="hs-treatment" name="treatment" defaultValue="">
                <option value="">Any treatment</option>
                {treatments.map((t) => (
                  <option key={t.id} value={t.slug}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="hero-search-field">
              <label htmlFor="hs-country">Where would you like to go?</label>
              <select id="hs-country" name="country" defaultValue="">
                <option value="">Any destination</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.slug}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="hero-search-btn">Explore options</button>
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

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="trust-boxes">
            <div className="trust-box">
              <strong>{countries.length}</strong>
              <span>Destinations</span>
            </div>
            <div className="trust-box">
              <strong>{totalSan}</strong>
              <span>Health resorts</span>
            </div>
            <div className="trust-box">
              <strong>{totalTreat}</strong>
              <span>Treatment profiles</span>
            </div>
            <div className="trust-box">
              <strong>Free</strong>
              <span>Consultation &amp; support</span>
            </div>
          </div>
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

      <section className="section">
        <div className="container">
          <h2>Premium resorts</h2>
          <p className="sub">Your health, our commitment to excellence — top-rated 5-star resorts.</p>
          <div className="premium-grid">
            {topChoice.map((s) => (
              <PremiumCard
                key={s.id}
                slug={s.slug}
                name={s.name}
                city={s.city}
                country={s.country_name}
                image={s.image}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="countries" style={{ paddingTop: 0 }}>
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
                <span className="treat-name">{t.name}</span>
                <span className="treat-count">{t.count} resorts →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="showcase-head">
            <div>
              <h2>Care for joints, bones &amp; spine</h2>
              <p className="sub" style={{ marginBottom: 0 }}>Expert musculoskeletal treatment and rehabilitation across our resorts.</p>
            </div>
            <Link href="/treatments/musculoskeletal-and-joints" className="showcase-link">View all →</Link>
          </div>
          <div className="san-grid">
            {jointsResorts.map((s) => (
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
              { t: "Curated resorts", d: "Each sanatorium is listed with its real treatment profile — balneology, Naftalan, rehabilitation and more — so you match care to your condition." },
              { t: "International support", d: "English-speaking coordination, help with travel and transfers, and guidance before, during and after your stay." },
              { t: "Free consultation", d: "Tell us your needs and we handle the back-and-forth with resorts. No fee to use the service." },
              { t: "Real partnerships", d: "We work directly with resorts and sanatoriums to confirm availability, programs and transparent pricing." },
            ].map((w, i) => (
              <div className="why-card" key={w.t}>
                <span className="why-num">{String(i + 1).padStart(2, "0")}</span>
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
