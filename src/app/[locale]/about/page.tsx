import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { SiteNav } from "@/components/SiteNav";
import type { Locale } from "@/lib/queries";
import { countSanatoriums, getCountriesWithCounts, getTreatmentsWithCounts } from "@/lib/queries";
import { IconShield, IconHeadphones, IconBadge, IconPlane, IconArrowRight } from "@/components/Icon";

export const dynamic = "force-dynamic";

const VALUES = [
  { Icon: IconShield, t: "about.value1t", d: "about.value1d" },
  { Icon: IconHeadphones, t: "about.value2t", d: "about.value2d" },
  { Icon: IconPlane, t: "about.value3t", d: "about.value3d" },
  { Icon: IconBadge, t: "about.value4t", d: "about.value4d" },
];

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations();
  const [totalSan, countries, treatments] = await Promise.all([
    countSanatoriums(),
    getCountriesWithCounts(locale),
    getTreatmentsWithCounts(locale),
  ]);

  return (
    <main>
      <SiteNav />
      <section className="page-hero page-hero-nav">
        <div className="container">
          <span className="eyebrow eyebrow-light">{t("about.kicker")}</span>
          <h1>{t("about.title")}</h1>
          <p>
            {t("about.heroSub")}
          </p>
        </div>
      </section>

      {/* stat strip */}
      <section className="about-stats">
        <div className="container about-stats-inner">
          {[[totalSan, t("about.statResorts")], [countries.length, t("about.statCountries")], [treatments.length, t("about.statTreatments")], [t("common.free"), t("about.statConsultation")]].map(([n, l]) => (
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
            <h2>{t("about.whatWeDo")}</h2>
            <p>{t("about.whatWeDoP1")}</p>
            <p style={{ marginTop: 14 }}>{t("about.whatWeDoP2")}</p>
          </div>
        </div>
      </section>

      {/* values */}
      <section className="sec-soft">
        <div className="container">
          <div className="sechead sechead-center">
            <span className="eyebrow">{t("about.howWeHelp")}</span>
            <h2 className="sectitle">{t("about.howWeHelpTitle")}</h2>
          </div>
          <div className="about-values">
            {VALUES.map((v) => (
              <div key={v.t} className="reveal about-value">
                <span className="about-value-ic"><v.Icon width={24} height={24} /></span>
                <h3>{t(v.t)}</h3>
                <p>{t(v.d)}</p>
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
            <h2 className="sectitle" style={{ color: "#fff" }}>{t("about.ctaTitle")}</h2>
            <p>{t("about.ctaSub")}</p>
          </div>
          <Link href="/contact" className="about-cta-btn">{t("about.requestConsultation")} <IconArrowRight width={16} height={16} /></Link>
        </div>
      </section>
    </main>
  );
}
