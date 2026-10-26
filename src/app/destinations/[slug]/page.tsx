import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCountryBySlug, searchSanatoriums } from "@/lib/queries";
import { SanatoriumCard } from "@/components/SanatoriumCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const country = await getCountryBySlug(slug);
  if (!country) return { title: "Destination — HealthVoyage" };
  return {
    title: `${country.name} — Sanatoriums & Resorts | HealthVoyage`,
    description: country.blurb ?? `Health resorts and sanatoriums in ${country.name}.`,
  };
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const country = await getCountryBySlug(slug);
  if (!country) notFound();

  const sanatoriums = await searchSanatoriums({ country: slug });

  return (
    <main>
      <section className="dest-hero">
        <Image src={country.cover ?? "/logo.jpg"} alt={country.name} fill priority sizes="100vw" style={{ objectFit: "cover" }} />
        <div className="dest-hero-shade" />
        <div className="container dest-hero-inner">
          <div className="breadcrumb" style={{ color: "rgba(255,255,255,.82)" }}>
            <Link href="/" style={{ color: "rgba(255,255,255,.92)" }}>Home</Link> /{" "}
            <Link href="/destinations" style={{ color: "rgba(255,255,255,.92)" }}>Destinations</Link> / {country.name}
          </div>
          <h1>{country.flag} {country.name}</h1>
          {country.blurb && <p style={{ maxWidth: 640, opacity: .95, marginTop: 10 }}>{country.blurb}</p>}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>{sanatoriums.length} resorts in {country.name}</h2>
          <p className="sub">Browse health resorts and sanatoriums in this destination.</p>
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
