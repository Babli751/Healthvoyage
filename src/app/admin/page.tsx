import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { getAllSanatoriumsAdmin, getCountriesWithCounts, countNewInquiries } from "@/lib/queries";
import { logoutAction, deleteAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  if (!(await isAuthed())) redirect("/admin/login");

  const [sanatoriums, countries, newInquiries] = await Promise.all([
    getAllSanatoriumsAdmin(),
    getCountriesWithCounts(),
    countNewInquiries(),
  ]);

  return (
    <main className="admin-wrap">
      <div className="admin-topbar">
        <div>
          <h1>Content panel</h1>
          <p className="sub">{sanatoriums.length} sanatoriums · {countries.length} countries</p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/inquiries" className="link-btn">
            Inquiries{newInquiries > 0 && <span className="badge badge-new" style={{ marginLeft: 6 }}>{newInquiries}</span>}
          </Link>
          <Link href="/" className="link-btn">View site ↗</Link>
          <Link href="/admin/new" className="btn">+ New sanatorium</Link>
          <form action={logoutAction}><button className="link-btn" type="submit">Sign out</button></form>
        </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Country</th>
            <th>City</th>
            <th>Stars</th>
            <th>Tags</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sanatoriums.map((s) => (
            <tr key={s.id}>
              <td>
                {s.image ? (
                  <Image src={s.image} alt="" width={56} height={40} style={{ objectFit: "cover", borderRadius: 6 }} />
                ) : (
                  <div className="thumb-empty" />
                )}
              </td>
              <td><strong>{s.name}</strong></td>
              <td>{s.country_flag} {s.country_name}</td>
              <td>{s.city}</td>
              <td>{s.stars ? "★".repeat(s.stars) : "—"}</td>
              <td className="muted">{s.treatments.length}</td>
              <td className="row-actions">
                <Link href={`/sanatoriums/${s.slug}`} className="link-btn">View</Link>
                <Link href={`/admin/${s.id}/edit`} className="link-btn">Edit</Link>
                <form action={deleteAction.bind(null, s.id)}>
                  <button type="submit" className="link-btn danger">Delete</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
