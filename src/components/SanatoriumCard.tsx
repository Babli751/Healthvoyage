import Link from "next/link";
import Image from "next/image";

interface Props {
  slug: string;
  name: string;
  city: string;
  country: string;
  flag?: string | null;
  stars?: number | null;
  summary: string;
  image?: string | null;
  treatments: { name: string }[];
}

export function SanatoriumCard({ slug, name, city, country, flag, stars, summary, image, treatments }: Props) {
  return (
    <Link href={`/sanatoriums/${slug}`} className="san-card">
      <div className="san-card-img">
        <Image src={image ?? "/logo.jpg"} alt={name} fill sizes="(max-width: 640px) 100vw, 360px" style={{ objectFit: "cover" }} />
        {stars ? <span className="san-card-stars">{"★".repeat(stars)}</span> : null}
      </div>
      <div className="san-card-body">
        <h3>{name}</h3>
        <div className="loc">
          <span>{flag}</span> {city}, {country}
        </div>
        <p className="sum">{summary}</p>
        <div className="tags">
          {treatments.slice(0, 4).map((t) => (
            <span className="tag" key={t.name}>
              {t.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
