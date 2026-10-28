import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { getTestimonials } from "@/lib/queries";
import { saveTestimonial, removeTestimonial } from "../content-actions";
import { IconStar } from "@/components/Icon";

export const dynamic = "force-dynamic";

export default async function AdminTestimonials() {
  if (!(await isAuthed())) redirect("/admin/login");
  const rows = await getTestimonials();
  const add = saveTestimonial.bind(null, null);

  return (
    <div className="apage">
      <header className="apage-head">
        <div><h1>Testimonials</h1><p>{rows.length} patient reviews shown on the homepage.</p></div>
      </header>

      <div className="acard" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, marginBottom: 14 }}>Add testimonial</h2>
        <form action={add} className="cform">
          <div className="cform-row">
            <input name="name" placeholder="Name *" required />
            <input name="country" placeholder="Country" />
            <input name="resort" placeholder="Resort" />
          </div>
          <textarea name="quote" placeholder="Quote *" rows={2} required />
          <div className="cform-row">
            <label className="cform-inline">Rating <input name="rating" type="number" min={1} max={5} defaultValue={5} /></label>
            <label className="cform-inline">Order <input name="sort_order" type="number" defaultValue={rows.length} /></label>
            <label className="cform-inline"><input type="checkbox" name="published" defaultChecked /> Published</label>
            <button className="abtn grad-primary" type="submit">Add</button>
          </div>
        </form>
      </div>

      <div className="clist">
        {rows.map((t) => (
          <div key={t.id} className="citem">
            <form action={saveTestimonial.bind(null, t.id)} className="cform">
              <div className="cform-row">
                <input name="name" defaultValue={t.name} required />
                <input name="country" defaultValue={t.country ?? ""} placeholder="Country" />
                <input name="resort" defaultValue={t.resort ?? ""} placeholder="Resort" />
              </div>
              <textarea name="quote" defaultValue={t.quote} rows={2} required />
              <div className="cform-row">
                <label className="cform-inline">Rating <input name="rating" type="number" min={1} max={5} defaultValue={t.rating} /></label>
                <label className="cform-inline">Order <input name="sort_order" type="number" defaultValue={t.sort_order} /></label>
                <label className="cform-inline"><input type="checkbox" name="published" defaultChecked={t.published} /> Published</label>
                <span className="cstars">{Array.from({ length: t.rating }).map((_, i) => <IconStar key={i} width={14} height={14} />)}</span>
                <button className="alink" type="submit">Save</button>
              </div>
            </form>
            <form action={removeTestimonial.bind(null, t.id)}>
              <button className="alink danger" type="submit">Delete</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
