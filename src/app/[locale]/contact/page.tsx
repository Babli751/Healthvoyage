import { setRequestLocale, getTranslations } from "next-intl/server";
import { SiteNav } from "@/components/SiteNav";
import { InquiryForm } from "@/components/InquiryForm";

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const t = await getTranslations();
  return (
    <main>
      <SiteNav />
      <section className="page-hero page-hero-nav">
        <div className="container">
          <h1>{t("contactPage.title")}</h1>
          <p>{t("contactPage.heroSub")}</p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-layout">
          <div className="contact-main">
            <InquiryForm />
          </div>
          <aside className="contact-aside">
            <h3>{t("contactPage.otherWays")}</h3>
            <ul className="contact-list">
              <li><strong>{t("contactPage.email")}</strong><br /><a href="mailto:info@healthvoyage.com">info@healthvoyage.com</a></li>
              <li><strong>{t("contactPage.responseTime")}</strong><br />{t("contactPage.responseTimeValue")}</li>
              <li><strong>{t("contactPage.languages")}</strong><br />{t("contactPage.languagesValue")}</li>
            </ul>
            <div className="contact-steps">
              <p><strong>{t("contactPage.whatNext")}</strong></p>
              <ol>
                <li>{t("contactPage.step1")}</li>
                <li>{t("contactPage.step2")}</li>
                <li>{t("contactPage.step3")}</li>
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
