import Link from "next/link";
import Image from "next/image";

interface Props {
  slug: string;
  name: string;
  city: string;
  country: string;
  image?: string | null;
}

export function PremiumCard({ slug, name, city, country, image }: Props) {
  return (
    <Link href={`/sanatoriums/${slug}`} className="premium-card">
      <Image src={image ?? "/logo.jpg"} alt={name} fill sizes="(max-width: 640px) 100vw, 300px" style={{ objectFit: "cover" }} />
      <span className="premium-badge">Top Choice</span>
      <div className="premium-shade" />
      <div className="premium-caption">
        <h3>{name}</h3>
        <span>{city}, {country}</span>
      </div>
    </Link>
  );
}
