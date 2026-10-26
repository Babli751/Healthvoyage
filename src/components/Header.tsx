import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" className="logo">
          <span className="mark">✦</span>
          HealthVoyage
        </Link>
        <nav className="nav">
          <Link href="/sanatoriums">Sanatoriums</Link>
          <Link href="/#countries">Destinations</Link>
          <Link href="/#treatments">Treatments</Link>
          <Link href="/#contact">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
