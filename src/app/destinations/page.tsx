import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteNav } from "@/components/SiteNav";
import { getCountriesWithCounts } from "@/lib/queries";
import { IconArrowRight } from "@/components/Icon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Destinations — HealthVoyage",
  description: "Medical tourism destinations: sanatoriums and health resorts by country.",
};

export default async function DestinationsPage() {
  const countries = await getCountriesWithCounts();

  return (
    <main>
      <SiteNav />
      <section className="page-hero page-hero-nav">
        <div className="container">
          <span className="eyebrow eyebrow-light">Destinations</span>
          <h1>Where would you like to heal?</h1>
          <p>Seven countries with centuries-old traditions of therapeutic resorts.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="bento">
            {countries.map((c, i) => (
              <Link key={c.id} href={`/destinations/${c.slug}`} className={`reveal bento-card ${i === 0 ? "bento-big" : ""}`}>
                <Image src={c.cover ?? "/logo.jpg"} alt={c.name} fill sizes="(max-width:768px) 50vw, 320px" style={{ objectFit: "cover" }} />
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
        </div>
      </section>
    </main>
  );
}
