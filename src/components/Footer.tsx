import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Image src="/logo-trim.jpg" alt="HealthVoyage" width={90} height={125} className="footer-logo" />
          <p>Medical tourism &amp; sanatorium booking — clinics, hospitals and health resorts across the region.</p>
        </div>
        <div className="footer-col">
          <h4>Explore</h4>
          <Link href="/sanatoriums">All sanatoriums</Link>
          <Link href="/destinations">Destinations</Link>
          <Link href="/treatments">Treatments</Link>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <Link href="/about">About us</Link>
          <Link href="/contact">Contact</Link>
          <a href="mailto:info@healthvoyage.com">info@healthvoyage.com</a>
        </div>
      </div>
      <div className="container footer-bottom">
        © {new Date().getFullYear()} HealthVoyage. For international patients.
      </div>
    </footer>
  );
}
