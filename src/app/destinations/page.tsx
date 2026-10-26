import type { Metadata } from "next";
import Link from "next/link";
import { getCountriesWithCounts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Destinations — HealthVoyage",
  description: "Medical tourism destinations: sanatoriums and health resorts by country.",
};

export default async function DestinationsPage() {
  const countries = await getCountriesWithCounts();

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <h1>Destinations</h1>
          <p>Explore health resorts and sanatoriums across our partner countries.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="country-grid">
            {countries.map((c) => (
              <Link href={`/destinations/${c.slug}`} className="country-card" key={c.id}>
                <div className="flag">{c.flag}</div>
                <h3>{c.name}</h3>
                <div className="count">{c.count} resorts →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
