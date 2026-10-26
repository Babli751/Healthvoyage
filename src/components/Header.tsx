import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="site-header">
      <div className="container inner">
        <Link href="/" className="logo" aria-label="HealthVoyage home">
          <Image src="/logo.jpg" alt="HealthVoyage" width={132} height={132} priority className="logo-img" />
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
