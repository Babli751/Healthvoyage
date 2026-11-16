import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { SiteNav } from "@/components/SiteNav";
import { SanatoriumCard } from "@/components/SanatoriumCard";
import type { Locale } from "@/lib/queries";
import {
  searchSanatoriums,
  getCountries,
  getTreatments,
  getCountryBySlug,
  getTreatmentBySlug,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

interface SearchParams {
  country?: string;
  treatment?: string;
  q?: string;
}

export default async function SanatoriumsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(rawLocale);
  const tr = await getTranslations();
  const { country, treatment, q } = await searchParams;

  const [sanatoriums, countries, treatments, activeCountry, activeTreatment] =
    await Promise.all([
      searchSanatoriums({ country, treatment, q, locale }),
      getCountries(locale),
      getTreatments(locale),
      country ? getCountryBySlug(country, locale) : Promise.resolve(null),
      treatment ? getTreatmentBySlug(treatment, locale) : Promise.resolve(null),
    ]);

  const title = activeCountry
    ? `${activeCountry.flag} ${activeCountry.name}`
    : activeTreatment
      ? `${activeTreatment.name}`
      : q
        ? `“${q}”`
        : tr("sanatoriums.title");

  const qs = (patch: Partial<SearchParams>) => {
    const p = new URLSearchParams();
    const merged: SearchParams = { country, treatment, q, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/sanatoriums?${s}` : "/sanatoriums";
  };

  return (
    <main>
      <SiteNav />
      <section className="catalog-hero">
        <div className="catalog-hero-orb" aria-hidden="true" />
        <div className="container catalog-hero-inner">
          <div className="breadcrumb breadcrumb-light">
            <Link href="/">{tr("nav.home")}</Link> / {tr("nav.sanatoriums")}
          </div>
          <h1>{title}</h1>
          <p className="catalog-count">{sanatoriums.length} {tr("common.resorts")}</p>
          <form action={`${locale === "en" ? "" : "/" + locale}/sanatoriums`} className="catalog-search">
            <input type="text" name="q" defaultValue={q ?? ""} placeholder={tr("sanatoriums.searchPlaceholder")} />
            <button type="submit" className="grad-primary">{tr("home.searchBtn")}</button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="filterbar">
            <div className="filterbar-label">{tr("sanatoriums.filterCountry")}</div>
            <div className="filters">
              <Link href="/sanatoriums" className={`chip ${!country && !treatment ? "active" : ""}`}>{tr("sanatoriums.filterAll")}</Link>
              {countries.map((c) => (
                <Link key={c.id} href={qs({ country: c.slug, treatment: undefined })} className={`chip ${country === c.slug ? "active" : ""}`}>
                  {c.flag} {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="filterbar">
            <div className="filterbar-label">{tr("sanatoriums.filterTreatment")}</div>
            <div className="filters">
              {treatments.map((t) => (
                <Link key={t.id} href={qs({ treatment: t.slug, country: undefined })} className={`chip ${treatment === t.slug ? "active" : ""}`}>
                  {t.name}
                </Link>
              ))}
            </div>
          </div>

          {sanatoriums.length === 0 ? (
            <div className="empty">{tr("sanatoriums.noResults")} <Link href="/sanatoriums" style={{ color: "var(--brand)" }}>{tr("sanatoriums.filterAll")}</Link></div>
          ) : (
            <div className="scard-grid">
              {sanatoriums.map((s) => (
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
          )}
        </div>
      </section>
    </main>
  );
}
