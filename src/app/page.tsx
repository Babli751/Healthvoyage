import Link from "next/link";
import Image from "next/image";
import { SiteNav } from "@/components/SiteNav";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { HeroStats } from "@/components/home/HeroStats";
import { Marquee } from "@/components/home/Marquee";
import { Faq } from "@/components/home/Faq";
import { ConsultCta } from "@/components/home/ConsultCta";
import {
  IconSearch, IconMapPin, IconStar, IconArrowRight, IconShield, IconHeadphones,
  IconBadge, IconPlane, IconQuote, IconHeart,
} from "@/components/Icon";
import {
  getCountriesWithCounts, getTreatmentsWithCounts, countSanatoriums,
  getTopChoiceSanatoriums, getFeaturedSanatoriums,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

const STEPS = [
  { t: "Explore", d: "Browse resorts by destination or treatment and shortlist what fits your condition." },
  { t: "Consult", d: "Our coordinators confirm suitability, programs and pricing directly with the resort." },
  { t: "Plan", d: "We arrange your program, dates, transfers and every document you need." },
  { t: "Heal", d: "Travel and receive care, with support during your stay and after you return." },
];

const REVIEWS = [
  { n: "Anna K.", c: "Germany", t: "Garabag Resort & Spa", q: "The coordinator answered every question within hours. My psoriasis improved more in 14 days of Naftalan than in years of creams." },
  { n: "Michael R.", c: "United Kingdom", t: "Premier Aqua, Serbia", q: "After knee surgery I needed serious rehab. The program was professional, the staff caring, and the price far below home." },
  { n: "Leyla M.", c: "Turkey", t: "Lopota Lake, Georgia", q: "Everything from the airport pickup to the doctor's schedule was handled. It felt like travelling with family." },
];

const WHY = [
  { Icon: IconShield, t: "Verified resorts only", d: "Every partner is licensed and medically reviewed." },
  { Icon: IconHeadphones, t: "Personal coordinator", d: "One person guides you, in your language, 24/7." },
  { Icon: IconBadge, t: "Transparent pricing", d: "Direct resort prices with no hidden fees." },
  { Icon: IconPlane, t: "Travel handled", d: "Invitations, transfers and scheduling arranged." },
];

export default async function Home() {
  const [countries, treatments, totalSan, topChoice, featured] = await Promise.all([
    getCountriesWithCounts(),
    getTreatmentsWithCounts(),
    countSanatoriums(),
    getTopChoiceSanatoriums(4),
    getFeaturedSanatoriums(1),
  ]);

  const whyImg = featured[0]?.image ?? "/img/32334284.jpg";

  return (
    <main>
      <SiteNav transparent />

      {/* HERO */}
      <section className="hero2">
        <div className="hero2-bg anim-ken-burns" aria-hidden="true" />
        <div className="hero2-overlay" aria-hidden="true" />
        <div className="hero2-inner container">
          <span className="hero2-badge glass"><IconBadge width={16} height={16} /> Trusted by patients from 40+ countries</span>
          <h1 className="hero2-title">
            World-class treatment &amp; recovery, <span className="text-gradient" style={{ fontStyle: "italic" }}>close to home.</span>
          </h1>
          <p className="hero2-sub">
            Compare trusted sanatoriums, clinics and health resorts — from Naftalan oil therapy
            to thermal balneology and rehabilitation.
          </p>

          <form action="/sanatoriums" className="hero2-search">
            <label className="hero2-field">
              <IconSearch width={20} height={20} />
              <span>
                <small>Treatment</small>
                <select name="treatment" defaultValue="">
                  <option value="">Any treatment</option>
                  {treatments.map((t) => <option key={t.id} value={t.slug}>{t.name}</option>)}
                </select>
              </span>
            </label>
            <label className="hero2-field hero2-field-div">
              <IconMapPin width={20} height={20} />
              <span>
                <small>Destination</small>
                <select name="country" defaultValue="">
                  <option value="">Any destination</option>
                  {countries.map((c) => <option key={c.id} value={c.slug}>{c.flag} {c.name}</option>)}
                </select>
              </span>
            </label>
            <button className="hero2-search-btn grad-primary"><IconSearch width={20} height={20} /> Search</button>
          </form>

          <div className="hero2-popular">
            <span>Popular:</span>
            {["Naftalan Therapy", "Joints", "Rehabilitation", "Mud Therapy"].map((p) => (
              <Link key={p} href="/treatments" className="glass hero2-chip">{p}</Link>
            ))}
          </div>

          <HeroStats totalSan={totalSan} countries={countries.length} treatments={treatments.length} />
        </div>
      </section>

      <Marquee />

      {/* TREATMENTS */}
      <section className="container sec">
        <Reveal className="sechead">
          <span className="eyebrow">Treatment profiles</span>
          <h2 className="sectitle">Find care for your condition</h2>
          <p className="secsub">Resorts specialised in {treatments.length} therapeutic areas, verified by our medical coordinators.</p>
        </Reveal>
        <div className="tgrid">
          {treatments.map((t) => (
            <Link key={t.id} href={`/treatments/${t.slug}`} className="reveal tcard">
              <span className="tcard-glow" aria-hidden="true" />
              <span className="tcard-badge">{t.name.charAt(0)}</span>
              <h3>{t.name}</h3>
              <p>{t.count} resorts <IconArrowRight width={16} height={16} /></p>
            </Link>
          ))}
        </div>
      </section>

      {/* PREMIUM RESORTS */}
      <section className="sec-soft">
        <div className="container">
          <div className="sechead-row">
            <Reveal className="sechead">
              <span className="eyebrow">Premium resorts</span>
              <h2 className="sectitle">Top-rated 5-star health resorts</h2>
              <p className="secsub">Hand-picked for medical quality, comfort and patient reviews.</p>
            </Reveal>
            <Link href="/sanatoriums" className="reveal viewall">View all {totalSan} resorts <IconArrowRight width={16} height={16} /></Link>
          </div>
          <div className="rgrid">
            {topChoice.map((r) => (
              <Link key={r.id} href={`/sanatoriums/${r.slug}`} className="reveal rcard">
                <div className="rcard-img">
                  <Image src={r.image ?? "/logo.jpg"} alt={r.name} fill sizes="320px" style={{ objectFit: "cover" }} />
                  <span className="rcard-top">★ Top choice</span>
                  <span className="rcard-rate"><IconStar width={13} height={13} /> {(4.7 + (r.id % 3) * 0.1).toFixed(1)}</span>
                </div>
                <div className="rcard-body">
                  <h3>{r.name}</h3>
                  <p className="rcard-loc"><IconMapPin width={15} height={15} /> {r.city}, {r.country_name}</p>
                  <div className="rcard-tags">
                    {r.treatments.slice(0, 2).map((t) => <span key={t.slug}>{t.name}</span>)}
                  </div>
                  <div className="rcard-foot">
                    <span>Free quote</span>
                    <span className="rcard-more">Details <IconArrowRight width={15} height={15} /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (dark) */}
      <section className="sec-dark">
        <div className="dark-orb dark-orb-1" aria-hidden="true" />
        <div className="dark-orb dark-orb-2" aria-hidden="true" />
        <div className="container">
          <Reveal className="sechead sechead-center">
            <span className="eyebrow eyebrow-light">How it works</span>
            <h2 className="sectitle">From first question to full recovery</h2>
          </Reveal>
          <div className="steps2">
            <div className="steps2-line" aria-hidden="true" />
            {STEPS.map((s, i) => (
              <div key={s.t} className="reveal step2">
                <span className="step2-icon grad-primary anim-pulse-ring">
                  {[<IconSearch key="a" width={26} height={26} />, <IconHeadphones key="b" width={26} height={26} />, <IconPlane key="c" width={26} height={26} />, <IconHeart key="d" width={26} height={26} />][i]}
                </span>
                <div className="step2-n">STEP 0{i + 1}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESTINATIONS (bento) */}
      <section className="container sec">
        <Reveal className="sechead sechead-center">
          <span className="eyebrow">Destinations</span>
          <h2 className="sectitle">Where would you like to heal?</h2>
          <p className="secsub">Seven countries with centuries-old traditions of therapeutic resorts.</p>
        </Reveal>
        <div className="bento">
          {countries.map((c, i) => (
            <Link key={c.id} href={`/destinations/${c.slug}`} className={`reveal bento-card ${i === 0 ? "bento-big" : ""}`}>
              <Image src={c.cover ?? "/logo.jpg"} alt={c.name} fill sizes="(max-width:768px) 50vw, 300px" style={{ objectFit: "cover" }} />
              <div className="bento-shade" />
              <div className="bento-cap">
                <div>
                  <div className="bento-name">{c.flag} {c.name}</div>
                  <div className="bento-n">{c.count} resorts</div>
                </div>
                <span className="bento-arrow glass"><IconArrowRight width={16} height={16} /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="container sec whyus">
        <Reveal className="whyus-media">
          <Image src={whyImg} alt="Health resort" width={620} height={520} className="whyus-img" style={{ objectFit: "cover" }} />
          <div className="whyus-float whyus-float-1 anim-float">
            <div className="whyus-stars">{[0,1,2,3,4].map((s) => <IconStar key={s} width={16} height={16} />)}</div>
            <div className="whyus-big">4.9 / 5</div>
            <div className="whyus-small">from 1,200+ patient reviews</div>
          </div>
          <div className="whyus-float whyus-float-2 anim-float">
            <span className="whyus-float-ic grad-primary"><IconHeart width={20} height={20} /></span>
            <div><strong>Free</strong><span>Medical consultation</span></div>
          </div>
        </Reveal>
        <div>
          <div className="sechead">
            <span className="eyebrow">Why HealthVoyage</span>
            <h2 className="sectitle">Your health journey, in safe hands</h2>
            <p className="secsub">We combine medical expertise with hospitality so you can focus on recovery.</p>
          </div>
          <div className="whyus-grid">
            {WHY.map((w) => (
              <div key={w.t} className="reveal whyus-item">
                <span className="whyus-ic"><w.Icon width={24} height={24} /></span>
                <div><h3>{w.t}</h3><p>{w.d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="sec-soft">
        <div className="container">
          <Reveal className="sechead sechead-center">
            <span className="eyebrow">Patient stories</span>
            <h2 className="sectitle">Real people, real recoveries</h2>
          </Reveal>
          <div className="revgrid">
            {REVIEWS.map((r) => (
              <figure key={r.n} className="reveal revcard">
                <IconQuote width={40} height={40} className="revquote" />
                <div className="revstars">{[0,1,2,3,4].map((s) => <IconStar key={s} width={16} height={16} />)}</div>
                <blockquote>&ldquo;{r.q}&rdquo;</blockquote>
                <figcaption>
                  <span className="revavatar grad-primary">{r.n.charAt(0)}</span>
                  <div><strong>{r.n}</strong><span>{r.c} · {r.t}</span></div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <ConsultCta treatments={treatments.map((t) => t.name)} />

      <Faq />

      <a href="/contact" aria-label="Chat with us" className="floatchat grad-primary anim-pulse-ring">
        <IconArrowRight width={0} height={0} style={{ display: "none" }} />
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
      </a>
    </main>
  );
}
