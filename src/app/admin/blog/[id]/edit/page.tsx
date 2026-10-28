import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { getBlogCategories, getBlogPostById } from "@/lib/queries";
import { BlogForm } from "@/components/admin/BlogForm";
import { saveBlogPost } from "../../../content-actions";

export const dynamic = "force-dynamic";

export default async function EditBlogPost({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) redirect("/admin/login");
  const { id } = await params;
  const pid = Number(id);
  if (!Number.isFinite(pid)) notFound();

  const [categories, post] = await Promise.all([getBlogCategories(), getBlogPostById(pid)]);
  if (!post) notFound();

  const save = saveBlogPost.bind(null, pid);

  return (
    <div className="apage">
      <header className="apage-head">
        <div>
          <Link href="/admin/blog" className="alink">← Back to blog</Link>
          <h1>Edit: {post.title}</h1>
        </div>
      </header>
      <BlogForm action={save} categories={categories} initial={post} submitLabel="Save changes" />
    </div>
  );
}
