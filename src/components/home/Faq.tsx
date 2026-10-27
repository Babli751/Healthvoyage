import { IconChevron } from "@/components/Icon";

const FAQS = [
  { q: "Is the consultation really free?", a: "Yes. Our coordinators help you compare resorts, programs and prices at no cost. You pay the resort directly for your stay." },
  { q: "How do I know which resort suits my condition?", a: "Share your diagnosis or medical notes. Our team checks suitability with the resort's doctors before you book." },
  { q: "Do you help with visas and transfers?", a: "We prepare invitation letters where required and can organize airport transfers and local transport." },
  { q: "How long is a typical treatment program?", a: "Most sanatorium programs run 10–21 days. Shorter wellness stays of 5–7 days are also available." },
];

export function Faq() {
  return (
    <section className="container sec-faq">
      <div className="sechead sechead-center">
        <span className="eyebrow">FAQ</span>
        <h2 className="sectitle">Questions, answered</h2>
      </div>
      <div className="faq-list">
        {FAQS.map((f, i) => (
          <details key={i} className="faq-item reveal" style={{ transitionDelay: `${i * 70}ms` }}>
            <summary>
              <span>{f.q}</span>
              <IconChevron width={20} height={20} className="faq-chev" />
            </summary>
            <div className="faq-ans">{f.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
