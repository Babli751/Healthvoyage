import Link from "next/link";

interface Props {
  slug: string;
  name: string;
  city: string;
  country: string;
  flag?: string | null;
  stars?: number | null;
  summary: string;
  treatments: { name: string }[];
}

export function SanatoriumCard({ slug, name, city, country, flag, stars, summary, treatments }: Props) {
  return (
    <Link href={`/sanatoriums/${slug}`} className="san-card">
      <div className="top">
        <h3>{name}</h3>
        {stars ? <span className="stars">{"★".repeat(stars)}</span> : null}
      </div>
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
    </Link>
  );
}
