import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { getBlogPosts, getBlogCategories } from "@/lib/queries";
import { removeBlogPost, addBlogCategory } from "../content-actions";

export const dynamic = "force-dynamic";

export default async function AdminBlog() {
  if (!(await isAuthed())) redirect("/admin/login");
  const [posts, categories] = await Promise.all([getBlogPosts(), getBlogCategories()]);

  return (
    <div className="apage">
      <header className="apage-head">
        <div><h1>Blog</h1><p>{posts.length} posts · {categories.length} categories.</p></div>
        <Link href="/admin/blog/new" className="abtn grad-primary">+ New post</Link>
      </header>

      <div className="acard" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, marginBottom: 12 }}>Categories</h2>
        <div className="bcats">
          {categories.map((c) => <span key={c.id} className="bcat">{c.name}</span>)}
        </div>
        <form action={addBlogCategory} className="cform-row" style={{ marginTop: 12 }}>
          <input name="name" placeholder="New category name" />
          <button className="abtn-ghost" type="submit">Add category</button>
        </form>
      </div>

      <div className="atable-wrap">
        <table className="atable">
          <thead><tr><th></th><th>Title</th><th>Category</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td>{p.cover ? <Image src={p.cover} alt="" width={52} height={38} style={{ objectFit: "cover", borderRadius: 7 }} /> : <div className="athumb" />}</td>
                <td><strong>{p.title}</strong></td>
                <td className="amuted">{p.category_name ?? "—"}</td>
                <td>{p.published ? <span className="badge badge-contacted">live</span> : <span className="badge badge-closed">draft</span>}</td>
                <td className="arow-actions">
                  {p.published && <Link href={`/blog/${p.slug}`} target="_blank" className="alink">View</Link>}
                  <Link href={`/admin/blog/${p.id}/edit`} className="alink">Edit</Link>
                  <form action={removeBlogPost.bind(null, p.id)}><button className="alink danger" type="submit">Delete</button></form>
                </td>
              </tr>
            ))}
            {posts.length === 0 && <tr><td colSpan={5} className="amuted" style={{ textAlign: "center", padding: 28 }}>No posts yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
