import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { getInquiries } from "@/lib/queries";
import { setInquiryStatusAction, deleteInquiryAction } from "../actions";

export const dynamic = "force-dynamic";

const STATUS_NEXT: Record<string, { label: string; to: string }> = {
  new: { label: "Mark contacted", to: "contacted" },
  contacted: { label: "Mark closed", to: "closed" },
  closed: { label: "Reopen", to: "new" },
};

export default async function AdminInquiries() {
  if (!(await isAuthed())) redirect("/admin/login");

  const inquiries = await getInquiries();
  const newCount = inquiries.filter((i) => i.status === "new").length;

  return (
    <div className="apage">
      <header className="apage-head">
        <div>
          <h1>Inquiries</h1>
          <p>{inquiries.length} total · {newCount} new</p>
        </div>
      </header>

      {inquiries.length === 0 ? (
        <div className="empty">No inquiries yet.</div>
      ) : (
        <div className="inquiry-cards">
          {inquiries.map((q) => (
            <div className={`inquiry-admin-card status-${q.status}`} key={q.id}>
              <div className="inquiry-admin-head">
                <div>
                  <strong>{q.name}</strong>
                  <span className={`badge badge-${q.status}`}>{q.status}</span>
                </div>
                <span className="muted">{new Date(q.created_at).toLocaleString()}</span>
              </div>
              <div className="inquiry-admin-contact">
                <a href={`mailto:${q.email}`}>{q.email}</a>
                {q.phone && <span> · {q.phone}</span>}
                {q.country && <span> · {q.country}</span>}
              </div>
              {q.sanatorium_name && (
                <div className="inquiry-admin-ref">Re: <strong>{q.sanatorium_name}</strong></div>
              )}
              <p className="inquiry-admin-msg">{q.message}</p>
              <div className="row-actions" style={{ justifyContent: "flex-start" }}>
                <form action={setInquiryStatusAction.bind(null, q.id, STATUS_NEXT[q.status]?.to ?? "new")}>
                  <button type="submit" className="link-btn">{STATUS_NEXT[q.status]?.label ?? "Update"}</button>
                </form>
                <form action={deleteInquiryAction.bind(null, q.id)}>
                  <button type="submit" className="link-btn danger">Delete</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
