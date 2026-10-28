import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { getBlogCategories } from "@/lib/queries";
import { BlogForm } from "@/components/admin/BlogForm";
import { saveBlogPost } from "../../content-actions";

export const dynamic = "force-dynamic";

export default async function NewBlogPost() {
  if (!(await isAuthed())) redirect("/admin/login");
  const categories = await getBlogCategories();
  const create = saveBlogPost.bind(null, null);

  return (
    <div className="apage">
      <header className="apage-head">
        <div>
          <Link href="/admin/blog" className="alink">← Back to blog</Link>
          <h1>New post</h1>
        </div>
      </header>
      <BlogForm action={create} categories={categories} submitLabel="Publish post" />
    </div>
  );
}
