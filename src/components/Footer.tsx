import Image from "next/image";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container inner">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Image src="/logo-trim.jpg" alt="HealthVoyage" width={90} height={125} className="footer-logo" />
          <span>Medical tourism &amp; sanatorium booking — clinics, hospitals and health resorts across the region.</span>
        </div>
        <div>
          © {new Date().getFullYear()} HealthVoyage. For international patients.
        </div>
      </div>
    </footer>
  );
}
