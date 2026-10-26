import type { Metadata } from "next";
import { getCountriesWithCounts } from "@/lib/queries";
import { DestinationCard } from "@/components/DestinationCard";

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
          <div className="dest-grid">
            {countries.map((c) => (
              <DestinationCard key={c.id} slug={c.slug} name={c.name} flag={c.flag} cover={c.cover} count={c.count} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
