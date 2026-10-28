import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSanatoriumBySlug, getRelatedSanatoriums } from "@/lib/queries";
import { SanatoriumCard } from "@/components/SanatoriumCard";
import { InquiryForm } from "@/components/InquiryForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSanatoriumBySlug(slug);
  if (!s) return { title: "Sanatorium — HealthVoyage" };
  return {
    title: s.meta_title || `${s.name} — ${s.city}, ${s.country_name} | HealthVoyage`,
    description: s.meta_description || s.summary,
    keywords: s.keywords || undefined,
  };
}

export default async function SanatoriumDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const s = await getSanatoriumBySlug(slug);
  if (!s) notFound();

  const related = await getRelatedSanatoriums(s.country_id, s.id, 4);

  return (
    <main>
      <SiteNav />
      <section className="detail-cover detail-cover-nav">
        <Image src={s.image ?? "/logo.jpg"} alt={s.name} fill priority sizes="100vw" style={{ objectFit: "cover" }} />
        <div className="detail-cover-shade" />
        <div className="container detail-cover-inner">
          <div className="breadcrumb">
            <Link href="/">Home</Link> /{" "}
            <Link href="/sanatoriums">Sanatoriums</Link> /{" "}
            <Link href={`/sanatoriums?country=${s.country_slug}`}>{s.country_name}</Link> / {s.name}
          </div>
          <h1>{s.name}</h1>
          <div className="meta">
            {s.stars ? <span className="cover-stars">{"★".repeat(s.stars)}</span> : null}
            <span>{s.country_flag} {s.city}, {s.country_name}</span>
          </div>
        </div>
      </section>

      <section className="detail-body">
        <div className="container">
          <div className="desc post-content" dangerouslySetInnerHTML={{ __html: s.description }} />

          {s.gallery && s.gallery.length > 0 && (
            <div className="detail-gallery">
              {s.gallery.map((g) => (
                <div key={g} className="detail-gallery-item">
                  <Image src={g} alt={s.name} fill sizes="(max-width:768px) 50vw, 300px" style={{ objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}

          <h3>Treatment profile</h3>
          <div className="filters">
            {s.treatments.map((t) => (
              <Link key={t.slug} href={`/sanatoriums?treatment=${t.slug}`} className="chip">
                {t.name}
              </Link>
            ))}
          </div>

          <div className="cta-box" id="inquire">
            <h3>Interested in {s.name}?</h3>
            <p>
              Request pricing, availability and a treatment program tailored to
              your condition. We coordinate consultation and transfer for
              international patients.
            </p>
            <InquiryForm sanatoriumId={s.id} sanatoriumName={s.name} compact />
          </div>

          {related.length > 0 && (
            <>
              <h3 style={{ marginTop: 44 }}>More in {s.country_name}</h3>
              <div className="scard-grid">
                {related.map((r) => (
                  <SanatoriumCard
                    key={r.id}
                    slug={r.slug}
                    name={r.name}
                    city={r.city}
                    country={r.country_name}
                    flag={r.country_flag}
                    stars={r.stars}
                    summary={r.summary}
                    image={r.image}
                    treatments={r.treatments}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
