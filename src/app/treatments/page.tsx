import type { Metadata } from "next";
import Link from "next/link";
import { getTreatmentsWithCounts } from "@/lib/queries";
import { TREATMENT_INFO } from "@/lib/treatmentInfo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Treatments — HealthVoyage",
  description: "Treatment profiles offered across our health resorts and sanatoriums.",
};

export default async function TreatmentsPage() {
  const treatments = await getTreatmentsWithCounts();

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <h1>Treatment profiles</h1>
          <p>Find resorts specializing in your condition, from balneology to rehabilitation.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="why-grid">
            {treatments.map((t) => (
              <Link href={`/treatments/${t.slug}`} className="treat-card" key={t.id}>
                <h3 style={{ marginBottom: 6 }}>{t.name}</h3>
                <p style={{ marginBottom: 10 }}>{TREATMENT_INFO[t.slug] ?? ""}</p>
                <span className="count" style={{ color: "var(--brand)", fontWeight: 600, fontSize: 14 }}>
                  {t.count} resorts →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
