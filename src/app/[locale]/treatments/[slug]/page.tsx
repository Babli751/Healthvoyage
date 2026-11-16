import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { SiteNav } from "@/components/SiteNav";
import { notFound } from "next/navigation";
import { getTreatmentBySlug, searchSanatoriums } from "@/lib/queries";
import { TREATMENT_INFO } from "@/lib/treatmentInfo";
import { SanatoriumCard } from "@/components/SanatoriumCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTreatmentBySlug(slug, locale as "en"|"ru"|"az");
  if (!t) return { title: "Treatment — HealthVoyage" };
  return {
    title: `${t.name} — Resorts & Sanatoriums | HealthVoyage`,
    description: TREATMENT_INFO[slug] ?? `Resorts offering ${t.name}.`,
  };
}

export default async function TreatmentPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const tx = await getTranslations();
  const treatment = await getTreatmentBySlug(slug, locale as "en"|"ru"|"az");
  if (!treatment) notFound();

  const sanatoriums = await searchSanatoriums({ treatment: slug, locale: locale as "en"|"ru"|"az" });

  return (
    <main>
      <SiteNav />
      <section className="page-hero page-hero-nav">
        <div className="container">
          <div className="breadcrumb" style={{ color: "rgba(255,255,255,.82)" }}>
            <Link href="/" style={{ color: "rgba(255,255,255,.92)" }}>{tx("nav.home")}</Link> /{" "}
            <Link href="/treatments" style={{ color: "rgba(255,255,255,.92)" }}>{tx("nav.treatments")}</Link> / {treatment.name}
          </div>
          <h1>{treatment.name}</h1>
          {TREATMENT_INFO[slug] && <p>{TREATMENT_INFO[slug]}</p>}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>{sanatoriums.length} {tx("common.resorts")} — {treatment.name}</h2>
          <p className="sub">{tx("treatments.subtitle")}</p>
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
                image={s.image}
                treatments={s.treatments}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
