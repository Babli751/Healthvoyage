import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export async function Footer() {
  const t = await getTranslations();
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-logo-row">
            <img src="/logo.png" alt="HealthVoyage" className="footer-logo-img" />
          </div>
          <p>{t("footer.tagline")}</p>
        </div>
        <div className="footer-col">
          <h4>{t("footer.explore")}</h4>
          <Link href="/sanatoriums">{t("nav.sanatoriums")}</Link>
          <Link href="/destinations">{t("nav.destinations")}</Link>
          <Link href="/treatments">{t("nav.treatments")}</Link>
          <Link href="/blog">{t("nav.blog")}</Link>
        </div>
        <div className="footer-col">
          <h4>{t("footer.company")}</h4>
          <Link href="/about">{t("nav.about")}</Link>
          <Link href="/contact">{t("nav.contact")}</Link>
          <a href="mailto:info@healthvoyage.com">info@healthvoyage.com</a>
        </div>
      </div>
      <div className="container footer-bottom">
        © {new Date().getFullYear()} HealthVoyage. {t("footer.rights")}
      </div>
    </footer>
  );
}
