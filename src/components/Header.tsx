import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" className="logo" aria-label="HealthVoyage home">
          <Image src="/logo-icon.jpg" alt="" width={120} height={113} priority className="logo-icon" />
          <span className="logo-text">Health<span>Voyage</span></span>
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
