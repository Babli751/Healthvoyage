import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { SiteNav } from "@/components/SiteNav";
import type { Locale } from "@/lib/queries";
import { getCountriesWithCounts } from "@/lib/queries";
import { IconArrowRight } from "@/components/Icon";

export const dynamic = "force-dynamic";

export default async function DestinationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const t = await getTranslations();
  const countries = await getCountriesWithCounts(rawLocale as Locale);

  return (
    <main>
      <SiteNav />
      <section className="page-hero page-hero-nav">
        <div className="container">
          <span className="eyebrow eyebrow-light">{t("destinations.title")}</span>
          <h1>{t("destinations.title")}</h1>
          <p>{t("destinations.subtitle")}</p>
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
