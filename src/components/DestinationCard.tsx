import { Link } from "@/i18n/routing";
import Image from "next/image";

interface Props {
  slug: string;
  name: string;
  flag?: string | null;
  cover?: string | null;
  count: number;
}

export function DestinationCard({ slug, name, flag, cover, count }: Props) {
  return (
    <Link href={`/destinations/${slug}`} className="dest-card">
      <div className="dest-card-img">
        <Image src={cover ?? "/logo.jpg"} alt={name} fill sizes="(max-width: 640px) 100vw, 360px" style={{ objectFit: "cover" }} />
        <div className="dest-card-shade" />
        <div className="dest-card-caption">
          <span className="dest-flag">{flag}</span>
          <span className="dest-name">{name}</span>
        </div>
      </div>
      <div className="dest-card-foot">
        <span>{count} resorts</span>
        <span className="dest-arrow">→</span>
      </div>
    </Link>
  );
}
