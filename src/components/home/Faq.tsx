import { useTranslations } from "next-intl";
import { IconChevron } from "@/components/Icon";

interface FaqItem { id: number; question: string; answer: string }

export function Faq({ items }: { items: FaqItem[] }) {
  const t = useTranslations("home");
  if (!items.length) return null;
  return (
    <section className="container sec-faq">
      <div className="sechead sechead-center">
        <span className="eyebrow">{t("faqKicker")}</span>
        <h2 className="sectitle">{t("faqTitle")}</h2>
      </div>
      <div className="faq-list">
        {items.map((f, i) => (
          <details key={f.id} className="faq-item reveal" style={{ transitionDelay: `${i * 70}ms` }}>
            <summary>
              <span>{f.question}</span>
              <IconChevron width={20} height={20} className="faq-chev" />
            </summary>
            <div className="faq-ans">{f.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
