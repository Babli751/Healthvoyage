import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteNav";
import Link from "next/link";
import { getTreatmentsWithCounts } from "@/lib/queries";
import { TREATMENT_INFO } from "@/lib/treatmentInfo";
import { IconArrowRight } from "@/components/Icon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Treatments — HealthVoyage",
  description: "Treatment profiles offered across our health resorts and sanatoriums.",
};

export default async function TreatmentsPage() {
  const treatments = await getTreatmentsWithCounts();

  return (
    <main>
      <SiteNav />
      <section className="page-hero page-hero-nav">
        <div className="container">
          <span className="eyebrow eyebrow-light">Treatment profiles</span>
          <h1>Find care for your condition</h1>
          <p>Resorts specialised in {treatments.length} therapeutic areas, from balneology and Naftalan oil to rehabilitation.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="tprofile-grid">
            {treatments.map((t) => (
              <Link href={`/treatments/${t.slug}`} className="reveal tprofile" key={t.id}>
                <span className="tprofile-glow" aria-hidden="true" />
                <div className="tprofile-head">
                  <span className="tprofile-badge">{t.name.charAt(0)}</span>
                  <span className="tprofile-count">{t.count} resorts</span>
                </div>
                <h3>{t.name}</h3>
                <p>{TREATMENT_INFO[t.slug] ?? ""}</p>
                <span className="tprofile-more">Explore <IconArrowRight width={15} height={15} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
