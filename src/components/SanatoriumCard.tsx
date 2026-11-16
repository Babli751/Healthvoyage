import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { IconMapPin, IconStar, IconArrowRight } from "./Icon";

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
  const t = useTranslations("common");
  return (
    <Link href={`/sanatoriums/${slug}`} className="reveal scard">
      <div className="scard-img">
        <Image src={image ?? "/logo.jpg"} alt={name} fill sizes="(max-width: 640px) 100vw, 360px" style={{ objectFit: "cover" }} />
        {stars ? <span className="scard-stars"><IconStar width={13} height={13} /> {stars}.0</span> : null}
        <span className="scard-flag">{flag}</span>
      </div>
      <div className="scard-body">
        <h3>{name}</h3>
        <p className="scard-loc"><IconMapPin width={15} height={15} /> {city}, {country}</p>
        <p className="scard-sum">{summary}</p>
        <div className="scard-tags">
          {treatments.slice(0, 3).map((t) => (
            <span key={t.name}>{t.name}</span>
          ))}
        </div>
        <div className="scard-foot">
          <span>{t("freeQuote")}</span>
          <span className="scard-more">{t("viewDetails")} <IconArrowRight width={15} height={15} /></span>
        </div>
      </div>
    </Link>
  );
}
