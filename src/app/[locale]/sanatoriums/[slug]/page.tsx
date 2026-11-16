import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { SiteNav } from "@/components/SiteNav";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSanatoriumBySlug, getRelatedSanatoriums } from "@/lib/queries";
import { SanatoriumCard } from "@/components/SanatoriumCard";
import { InquiryForm } from "@/components/InquiryForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params;
  const s = await getSanatoriumBySlug(slug, locale as "en" | "ru" | "az");
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
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const loc = locale as "en" | "ru" | "az";
  setRequestLocale(locale);
  const tx = await getTranslations();

  const s = await getSanatoriumBySlug(slug, loc);
  if (!s) notFound();

  const related = await getRelatedSanatoriums(s.country_id, s.id, 4, loc);

  return (
    <main>
      <SiteNav />
      <section className="detail-cover detail-cover-nav">
        <Image src={s.image ?? "/logo.jpg"} alt={s.name} fill priority sizes="100vw" style={{ objectFit: "cover" }} />
        <div className="detail-cover-shade" />
        <div className="container detail-cover-inner">
          <div className="breadcrumb">
            <Link href="/">{tx("nav.home")}</Link> /{" "}
            <Link href="/sanatoriums">{tx("nav.sanatoriums")}</Link> /{" "}
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
          {/* TEST: description text + video side by side (Garabag only). */}
          {s.slug === "garabag-resort-and-spa-naftalan" ? (
            <div className="desc-video-row">
              <div className="desc post-content" dangerouslySetInnerHTML={{ __html: s.description }} />
              <div className="desc-video">
                <video controls autoPlay muted loop playsInline poster={s.image ?? "/logo.jpg"}>
                  <source src="/IMG_3974.MP4" type="video/mp4" />
                </video>
              </div>
            </div>
          ) : (
            <div className="desc post-content" dangerouslySetInnerHTML={{ __html: s.description }} />
          )}

          {s.gallery && s.gallery.length > 0 && (
            <div className="detail-gallery">
              {s.gallery.map((g) => (
                <div key={g} className="detail-gallery-item">
                  <Image src={g} alt={s.name} fill sizes="(max-width:768px) 50vw, 300px" style={{ objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}

          <h3>{tx("sanatoriums.treatmentProfile")}</h3>
          <div className="filters">
            {s.treatments.map((t) => (
              <Link key={t.slug} href={`/sanatoriums?treatment=${t.slug}`} className="chip">
                {t.name}
              </Link>
            ))}
          </div>

          <div className="cta-box" id="inquire">
            <h3>{tx("sanatoriums.interestedIn")} {s.name}?</h3>
            <p>{tx("sanatoriums.inquireText")}</p>
            <InquiryForm sanatoriumId={s.id} sanatoriumName={s.name} compact />
          </div>

          {related.length > 0 && (
            <>
              <h3 style={{ marginTop: 44 }}>{tx("sanatoriums.moreIn")} {s.country_name}</h3>
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
