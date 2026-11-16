import { Link } from "@/i18n/routing";

export function Header() {
  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" className="logo" aria-label="HealthVoyage home">
          <span className="logo-text">Health<span>Voyage</span></span>
        </Link>
        <nav className="nav">
          <Link href="/sanatoriums">Sanatoriums</Link>
          <Link href="/destinations">Destinations</Link>
          <Link href="/treatments">Treatments</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
