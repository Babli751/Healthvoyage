import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import type { Locale } from "@/lib/queries";
import { SiteNav } from "@/components/SiteNav";
import { Reveal } from "@/components/Reveal";
import { Marquee } from "@/components/home/Marquee";
import { HeroSearch } from "@/components/home/HeroSearch";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { Faq } from "@/components/home/Faq";
import { ConsultCta } from "@/components/home/ConsultCta";
import {
  IconMapPin, IconStar, IconArrowRight, IconShield, IconHeadphones,
  IconBadge, IconPlane, IconQuote, IconHeart,
} from "@/components/Icon";
import {
  getCountriesWithCounts, getTreatmentsWithCounts, countSanatoriums,
  getTopChoiceSanatoriums, getFeaturedSanatoriums, getTestimonials, getFaqs,
} from "@/lib/queries";
import { TREATMENT_INFO } from "@/lib/treatmentInfo";

export const dynamic = "force-dynamic";

const WHY = [
  { Icon: IconShield, t: "home.why1t", d: "home.why1d" },
  { Icon: IconHeadphones, t: "home.why2t", d: "home.why2d" },
  { Icon: IconBadge, t: "home.why3t", d: "home.why3d" },
  { Icon: IconPlane, t: "home.why4t", d: "home.why4d" },
];

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(rawLocale);
  const t = await getTranslations();
  const [countries, treatments, totalSan, topChoice, featured, reviews, faqs] = await Promise.all([
    getCountriesWithCounts(locale),
    getTreatmentsWithCounts(locale),
    countSanatoriums(),
    getTopChoiceSanatoriums(4, locale),
    getFeaturedSanatoriums(1, locale),
    getTestimonials(true, locale),
    getFaqs(true, locale),
  ]);

  const whyImg = featured[0]?.image ?? "/img/32334284.jpg";

  // Most popular treatments by resort count, for the dark feature section.
  const popularTreatments = [...treatments].sort((a, b) => b.count - a.count).slice(0, 6);

  return (
    <main>
      <SiteNav transparent />

      {/* HERO — full-bleed carousel background */}
      <section className="hero3 hero3-bgmode">
        <HeroCarousel fullBleed />
        <div className="hero3-scrim" aria-hidden="true" />
        <div className="container hero3-inner">
          <div className="hero3-copy">
            <span className="hero3-badge"><IconShield width={16} height={16} /> {t("home.heroBadge")}</span>
            <h1 className="hero3-title">
              {t("home.heroTitle1")} <span className="hero3-accent">{t("home.heroTitle2")}</span>
            </h1>
            <p className="hero3-sub">{t("home.heroSub")}</p>

            <HeroSearch
              action={`${locale === "en" ? "" : "/" + locale}/sanatoriums`}
              treatments={treatments.map((tr) => ({ value: tr.slug, label: tr.name }))}
              countries={countries.map((c) => ({ value: c.slug, label: `${c.flag} ${c.name}` }))}
            />

            <div className="hero3-popular">
              <span>{t("home.heroPopular")}</span>
              {[t("home.chip1"), t("home.chip2"), t("home.chip3"), t("home.chip4")].map((p) => (
                <Link key={p} href="/treatments" className="hero3-chip">{p}</Link>
              ))}
            </div>

            <div className="hero3-rating anim-float">
              <span className="hero3-rating-ic"><IconStar width={20} height={20} /></span>
              <div>
                <strong>4.9 / 5</strong>
                <span>1,284 {t("home.verifiedStays")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Marquee />

      {/* DESTINATIONS (bento) — moved up */}
      <section className="container sec">
        <Reveal className="sechead sechead-center">
          <span className="eyebrow">{t("home.destinationsKicker")}</span>
          <h2 className="sectitle">{t("home.destTitle")}</h2>
          <p className="secsub">{t("home.destSub")}</p>
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

      {/* PREMIUM RESORTS */}
      <section className="sec-soft">
        <div className="container">
          <div className="sechead-row">
            <Reveal className="sechead">
              <span className="eyebrow">{t("home.premiumResortsKicker")}</span>
              <h2 className="sectitle">{t("home.premiumTitle")}</h2>
              <p className="secsub">{t("home.premiumSub")}</p>
            </Reveal>
            <Link href="/sanatoriums" className="reveal viewall">{t("home.viewAllResorts", { n: totalSan })} <IconArrowRight width={16} height={16} /></Link>
          </div>
          <div className="rgrid">
            {topChoice.map((r) => (
              <Link key={r.id} href={`/sanatoriums/${r.slug}`} className="reveal rcard">
                <div className="rcard-img">
                  <Image src={r.image ?? "/logo.jpg"} alt={r.name} fill sizes="320px" style={{ objectFit: "cover" }} />
                  <span className="rcard-top">★ {t("home.topChoice")}</span>
                  <span className="rcard-rate"><IconStar width={13} height={13} /> {(4.7 + (r.id % 3) * 0.1).toFixed(1)}</span>
                </div>
                <div className="rcard-body">
                  <h3>{r.name}</h3>
                  <p className="rcard-loc"><IconMapPin width={15} height={15} /> {r.city}, {r.country_name}</p>
                  <div className="rcard-tags">
                    {r.treatments.slice(0, 2).map((t) => <span key={t.slug}>{t.name}</span>)}
                  </div>
                  <div className="rcard-foot">
                    <span>{t("home.freeQuote")}</span>
                    <span className="rcard-more">{t("home.details")} <IconArrowRight width={15} height={15} /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR TREATMENTS (dark) */}
      <section className="sec-dark">
        <div className="dark-orb dark-orb-1" aria-hidden="true" />
        <div className="dark-orb dark-orb-2" aria-hidden="true" />
        <div className="container">
          <div className="sechead-row">
            <Reveal className="sechead">
              <span className="eyebrow eyebrow-light">{t("home.popularKicker")}</span>
              <h2 className="sectitle">{t("home.popularTitle")}</h2>
            </Reveal>
            <Link href="/treatments" className="reveal viewall viewall-light">{t("common.allTreatments")} <IconArrowRight width={16} height={16} /></Link>
          </div>
          <div className="tdark-grid">
            {popularTreatments.map((tr, i) => (
              <Link key={tr.id} href={`/treatments/${tr.slug}`} className="reveal tdark" style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="tdark-img">
                  <Image src={tr.image ?? "/logo.jpg"} alt={tr.name} fill sizes="(max-width:768px) 100vw, 380px" style={{ objectFit: "cover" }} />
                  <span className="tdark-shade" aria-hidden="true" />
                  <span className="tdark-chip">{tr.count} {t("common.resorts")}</span>
                </div>
                <div className="tdark-body">
                  <h3>{tr.name}</h3>
                  <p>{TREATMENT_INFO[tr.slug] ?? `${tr.count} ${t("common.resorts")}`}</p>
                  <span className="tdark-more">{t("common.explore")} <IconArrowRight width={15} height={15} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TREATMENTS — moved down */}
      <section className="container sec">
        <Reveal className="sechead">
          <span className="eyebrow">{t("home.treatmentProfilesKicker")}</span>
          <h2 className="sectitle">{t("home.treatmentProfilesTitle")}</h2>
          <p className="secsub">{t("home.treatmentProfilesSub", { n: treatments.length })}</p>
        </Reveal>
        <div className="tgrid">
          {treatments.map((tr) => (
            <Link key={tr.id} href={`/treatments/${tr.slug}`} className="reveal tcard">
              <span className="tcard-glow" aria-hidden="true" />
              <h3>{tr.name}</h3>
              <p>{tr.count} {t("common.resorts")} <IconArrowRight width={16} height={16} /></p>
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
            <span className="whyus-float-ic"><IconHeart width={20} height={20} /></span>
            <div><strong>{t("common.free")}</strong><span>{t("home.consultKicker")}</span></div>
          </div>
        </Reveal>
        <div>
          <div className="sechead">
            <span className="eyebrow">{t("home.whyKicker")}</span>
            <h2 className="sectitle">{t("home.whyTitle")}</h2>
            <p className="secsub">{t("home.whySub")}</p>
          </div>
          <div className="whyus-grid">
            {WHY.map((w) => (
              <div key={w.t} className="reveal whyus-item">
                <span className="whyus-ic"><w.Icon width={24} height={24} /></span>
                <div><h3>{t(w.t)}</h3><p>{t(w.d)}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="sec-soft">
        <div className="container">
          <Reveal className="sechead sechead-center">
            <span className="eyebrow">{t("home.storiesKicker")}</span>
            <h2 className="sectitle">{t("home.storiesTitle")}</h2>
          </Reveal>
          <div className="revgrid">
            {reviews.map((r) => (
              <figure key={r.id} className="reveal revcard">
                <IconQuote width={40} height={40} className="revquote" />
                <div className="revstars">{Array.from({ length: r.rating }).map((_, s) => <IconStar key={s} width={16} height={16} />)}</div>
                <blockquote>&ldquo;{r.quote}&rdquo;</blockquote>
                <figcaption>
                  <span className="revavatar">{r.name.charAt(0)}</span>
                  <div><strong>{r.name}</strong><span>{[r.country, r.resort].filter(Boolean).join(" · ")}</span></div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <ConsultCta treatments={treatments.map((t) => t.name)} />

      <Faq items={faqs} />

      <a href="/contact" aria-label="Chat with us" className="floatchat grad-primary anim-pulse-ring">
        <IconArrowRight width={0} height={0} style={{ display: "none" }} />
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
      </a>
    </main>
  );
}
