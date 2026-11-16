import { setRequestLocale, getTranslations } from "next-intl/server";
import { SiteNav } from "@/components/SiteNav";
import { Link } from "@/i18n/routing";
import type { Locale } from "@/lib/queries";
import { getTreatmentsWithCounts } from "@/lib/queries";
import { TREATMENT_INFO } from "@/lib/treatmentInfo";
import { IconArrowRight } from "@/components/Icon";

export const dynamic = "force-dynamic";

export default async function TreatmentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const t = await getTranslations();
  const treatments = await getTreatmentsWithCounts(rawLocale as Locale);

  return (
    <main>
      <SiteNav />
      <section className="page-hero page-hero-nav">
        <div className="container">
          <span className="eyebrow eyebrow-light">{t("treatments.title")}</span>
          <h1>{t("home.treatmentProfilesTitle")}</h1>
          <p>{t("treatments.subtitle")}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="tprofile-grid">
            {treatments.map((item) => (
              <Link href={`/treatments/${item.slug}`} className="reveal tprofile" key={item.id}>
                <span className="tprofile-glow" aria-hidden="true" />
                <div className="tprofile-head">
                  <span className="tprofile-count">{item.count} {t("common.resorts")}</span>
                </div>
                <h3>{item.name}</h3>
                <p>{TREATMENT_INFO[item.slug] ?? ""}</p>
                <span className="tprofile-more">{t("common.explore")} <IconArrowRight width={15} height={15} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
