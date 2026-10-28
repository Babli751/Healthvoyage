import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import {
  countSanatoriums, getCountriesWithCounts, getTreatmentsWithCounts,
  countNewInquiries, getInquiries,
} from "@/lib/queries";
import { IconMapPin, IconMessage, IconBadge, IconArrowRight } from "@/components/Icon";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  if (!(await isAuthed())) redirect("/admin/login");

  const [totalSan, countries, treatments, newInq, inquiries] = await Promise.all([
    countSanatoriums(),
    getCountriesWithCounts(),
    getTreatmentsWithCounts(),
    countNewInquiries(),
    getInquiries(),
  ]);

  const recent = inquiries.slice(0, 6);

  const stats = [
    { label: "Sanatoriums", value: totalSan, href: "/admin/sanatoriums", Icon: IconMapPin, tone: "blue" },
    { label: "Countries", value: countries.length, href: "/admin/sanatoriums", Icon: IconMapPin, tone: "teal" },
    { label: "Treatment profiles", value: treatments.length, href: "/admin/sanatoriums", Icon: IconBadge, tone: "amber" },
    { label: "New inquiries", value: newInq, href: "/admin/inquiries", Icon: IconMessage, tone: "green" },
  ];

  return (
    <div className="apage">
      <header className="apage-head">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your catalog and patient inquiries.</p>
        </div>
        <Link href="/admin/sanatoriums/new" className="abtn grad-primary">+ Add sanatorium</Link>
      </header>

      <div className="astat-grid">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`astat astat-${s.tone}`}>
            <span className="astat-ic"><s.Icon width={22} height={22} /></span>
            <div className="astat-v">{s.value}</div>
            <div className="astat-l">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="adash-grid">
        <section className="acard">
          <div className="acard-head">
            <h2>Recent inquiries</h2>
            <Link href="/admin/inquiries" className="acard-link">View all <IconArrowRight width={14} height={14} /></Link>
          </div>
          {recent.length === 0 ? (
            <p className="amuted">No inquiries yet.</p>
          ) : (
            <ul className="arecent">
              {recent.map((q) => (
                <li key={q.id}>
                  <span className={`adot adot-${q.status}`} />
                  <div className="arecent-main">
                    <strong>{q.name}</strong>
                    <span className="amuted">{q.sanatorium_name ? `Re: ${q.sanatorium_name}` : q.email}</span>
                  </div>
                  <span className="arecent-date">{new Date(q.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="acard">
          <div className="acard-head"><h2>By country</h2></div>
          <ul className="abars">
            {countries.map((c) => {
              const max = Math.max(...countries.map((x) => x.count), 1);
              return (
                <li key={c.id}>
                  <span className="abars-label">{c.flag} {c.name}</span>
                  <span className="abars-track"><span className="abars-fill grad-primary" style={{ width: `${(c.count / max) * 100}%` }} /></span>
                  <span className="abars-n">{c.count}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
