import Link from "next/link";
import { notFound } from "next/navigation";
import { getSanatoriumBySlug, getRelatedSanatoriums } from "@/lib/queries";

export const dynamic = "force-dynamic";

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
      <section className="detail-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> /{" "}
            <Link href="/sanatoriums">Sanatoriums</Link> /{" "}
            <Link href={`/sanatoriums?country=${s.country_slug}`}>{s.country_name}</Link> / {s.name}
          </div>
          <h1>{s.name}</h1>
          <div className="meta">
            {s.stars ? <span className="stars" style={{ color: "var(--star)" }}>{"★".repeat(s.stars)}</span> : null}
            <span>{s.country_flag} {s.city}, {s.country_name}</span>
          </div>
        </div>
      </section>

      <section className="detail-body">
        <div className="container">
          <p className="desc">{s.description}</p>

          <h3>Treatment profile</h3>
          <div className="filters">
            {s.treatments.map((t) => (
              <Link key={t.slug} href={`/sanatoriums?treatment=${t.slug}`} className="chip">
                {t.name}
              </Link>
            ))}
          </div>

          <div className="cta-box">
            <h3>Interested in {s.name}?</h3>
            <p>
              Request pricing, availability and a treatment program tailored to
              your condition. We coordinate consultation and transfer for
              international patients.
            </p>
            <a
              href={`mailto:info@healthvoyage.com?subject=Inquiry: ${encodeURIComponent(s.name)}`}
              className="btn"
            >
              Send an inquiry
            </a>
          </div>

          {related.length > 0 && (
            <>
              <h3 style={{ marginTop: 44 }}>More in {s.country_name}</h3>
              <div className="san-grid">
                {related.map((r) => (
                  <Link key={r.id} href={`/sanatoriums/${r.slug}`} className="san-card">
                    <div className="top">
                      <h3>{r.name}</h3>
                      {r.stars ? <span className="stars">{"★".repeat(r.stars)}</span> : null}
                    </div>
                    <div className="loc">{r.country_flag} {r.city}</div>
                    <p className="sum">{r.summary}</p>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
