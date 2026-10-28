import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { getFaqs } from "@/lib/queries";
import { saveFaq, removeFaq } from "../content-actions";

export const dynamic = "force-dynamic";

export default async function AdminFaq() {
  if (!(await isAuthed())) redirect("/admin/login");
  const rows = await getFaqs();
  const add = saveFaq.bind(null, null);

  return (
    <div className="apage">
      <header className="apage-head">
        <div><h1>FAQ</h1><p>{rows.length} questions shown on the homepage.</p></div>
      </header>

      <div className="acard" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, marginBottom: 14 }}>Add question</h2>
        <form action={add} className="cform">
          <input name="question" placeholder="Question *" required />
          <textarea name="answer" placeholder="Answer *" rows={2} required />
          <div className="cform-row">
            <label className="cform-inline">Order <input name="sort_order" type="number" defaultValue={rows.length} /></label>
            <label className="cform-inline"><input type="checkbox" name="published" defaultChecked /> Published</label>
            <button className="abtn grad-primary" type="submit">Add</button>
          </div>
        </form>
      </div>

      <div className="clist">
        {rows.map((f) => (
          <div key={f.id} className="citem">
            <form action={saveFaq.bind(null, f.id)} className="cform">
              <input name="question" defaultValue={f.question} required />
              <textarea name="answer" defaultValue={f.answer} rows={2} required />
              <div className="cform-row">
                <label className="cform-inline">Order <input name="sort_order" type="number" defaultValue={f.sort_order} /></label>
                <label className="cform-inline"><input type="checkbox" name="published" defaultChecked={f.published} /> Published</label>
                <button className="alink" type="submit">Save</button>
              </div>
            </form>
            <form action={removeFaq.bind(null, f.id)}>
              <button className="alink danger" type="submit">Delete</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
