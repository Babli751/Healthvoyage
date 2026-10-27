import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { notFound } from "next/navigation";
import { getTreatmentBySlug, searchSanatoriums } from "@/lib/queries";
import { TREATMENT_INFO } from "@/lib/treatmentInfo";
import { SanatoriumCard } from "@/components/SanatoriumCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTreatmentBySlug(slug);
  if (!t) return { title: "Treatment — HealthVoyage" };
  return {
    title: `${t.name} — Resorts & Sanatoriums | HealthVoyage`,
    description: TREATMENT_INFO[slug] ?? `Resorts offering ${t.name}.`,
  };
}

export default async function TreatmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const treatment = await getTreatmentBySlug(slug);
  if (!treatment) notFound();

  const sanatoriums = await searchSanatoriums({ treatment: slug });

  return (
    <main>
      <SiteNav />
      <section className="page-hero page-hero-nav">
        <div className="container">
          <div className="breadcrumb" style={{ color: "rgba(255,255,255,.82)" }}>
            <Link href="/" style={{ color: "rgba(255,255,255,.92)" }}>Home</Link> /{" "}
            <Link href="/treatments" style={{ color: "rgba(255,255,255,.92)" }}>Treatments</Link> / {treatment.name}
          </div>
          <h1>{treatment.name}</h1>
          {TREATMENT_INFO[slug] && <p>{TREATMENT_INFO[slug]}</p>}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>{sanatoriums.length} resorts offering {treatment.name}</h2>
          <p className="sub">Select a resort to see its full profile and request a consultation.</p>
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
