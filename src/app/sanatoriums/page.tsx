import Link from "next/link";
import { SanatoriumCard } from "@/components/SanatoriumCard";
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
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { country, treatment, q } = await searchParams;

  const [sanatoriums, countries, treatments, activeCountry, activeTreatment] =
    await Promise.all([
      searchSanatoriums({ country, treatment, q }),
      getCountries(),
      getTreatments(),
      country ? getCountryBySlug(country) : Promise.resolve(null),
      treatment ? getTreatmentBySlug(treatment) : Promise.resolve(null),
    ]);

  const title = activeCountry
    ? `${activeCountry.flag} Sanatoriums in ${activeCountry.name}`
    : activeTreatment
      ? `Sanatoriums for ${activeTreatment.name}`
      : q
        ? `Results for “${q}”`
        : "All sanatoriums & resorts";

  const qs = (patch: Partial<SearchParams>) => {
    const p = new URLSearchParams();
    const merged: SearchParams = { country, treatment, q, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/sanatoriums?${s}` : "/sanatoriums";
  };

  return (
    <main>
      <section className="detail-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> / Sanatoriums
          </div>
          <h1>{title}</h1>
          <div className="meta">{sanatoriums.length} results</div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <form action="/sanatoriums" className="searchbar" style={{ marginTop: 0, marginBottom: 28, maxWidth: 480 }}>
            <input type="text" name="q" defaultValue={q ?? ""} placeholder="Search sanatoriums…" style={{ boxShadow: "var(--shadow)" }} />
          </form>

          <div className="filters">
            <Link href="/sanatoriums" className={`chip ${!country && !treatment ? "active" : ""}`}>
              All
            </Link>
            {countries.map((c) => (
              <Link key={c.id} href={qs({ country: c.slug, treatment: undefined })} className={`chip ${country === c.slug ? "active" : ""}`}>
                {c.flag} {c.name}
              </Link>
            ))}
          </div>

          <div className="filters">
            {treatments.map((t) => (
              <Link key={t.id} href={qs({ treatment: t.slug, country: undefined })} className={`chip ${treatment === t.slug ? "active" : ""}`}>
                {t.name}
              </Link>
            ))}
          </div>

          {sanatoriums.length === 0 ? (
            <div className="empty">No sanatoriums match your filters. <Link href="/sanatoriums" style={{ color: "var(--brand)" }}>Clear filters</Link></div>
          ) : (
            <div className="san-grid">
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
