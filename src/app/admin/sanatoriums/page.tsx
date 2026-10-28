import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { getAllSanatoriumsAdmin } from "@/lib/queries";
import { deleteAction } from "../actions";
import { IconSearch } from "@/components/Icon";

export const dynamic = "force-dynamic";

export default async function AdminSanatoriums({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  if (!(await isAuthed())) redirect("/admin/login");

  const { q } = await searchParams;
  let rows = await getAllSanatoriumsAdmin();
  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    rows = rows.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.city.toLowerCase().includes(term) ||
        s.country_name.toLowerCase().includes(term)
    );
  }

  return (
    <div className="apage">
      <header className="apage-head">
        <div>
          <h1>Sanatoriums</h1>
          <p>{rows.length} resorts in the catalog.</p>
        </div>
        <Link href="/admin/sanatoriums/new" className="abtn grad-primary">+ Add sanatorium</Link>
      </header>

      <form className="atoolbar" action="/admin/sanatoriums">
        <div className="asearch">
          <IconSearch width={18} height={18} />
          <input name="q" defaultValue={q ?? ""} placeholder="Search by name, city or country…" />
        </div>
        {q ? <Link href="/admin/sanatoriums" className="abtn-ghost">Clear</Link> : null}
      </form>

      <div className="atable-wrap">
        <table className="atable">
          <thead>
            <tr>
              <th></th><th>Name</th><th>Country</th><th>City</th><th>Stars</th><th>Tags</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td>
                  {s.image ? (
                    <Image src={s.image} alt="" width={52} height={38} style={{ objectFit: "cover", borderRadius: 7 }} />
                  ) : <div className="athumb" />}
                </td>
                <td><strong>{s.name}</strong></td>
                <td>{s.country_flag} {s.country_name}</td>
                <td>{s.city}</td>
                <td>{s.stars ? "★".repeat(s.stars) : "—"}</td>
                <td className="amuted">{s.treatments.length}</td>
                <td className="arow-actions">
                  <Link href={`/sanatoriums/${s.slug}`} target="_blank" className="alink">View</Link>
                  <Link href={`/admin/sanatoriums/${s.id}/edit`} className="alink">Edit</Link>
                  <form action={deleteAction.bind(null, s.id)}>
                    <button type="submit" className="alink danger">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
