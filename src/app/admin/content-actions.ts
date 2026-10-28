"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/auth";
import {
  createTestimonial, updateTestimonial, deleteTestimonial,
  createFaq, updateFaq, deleteFaq,
  createBlogPost, updateBlogPost, deleteBlogPost, createBlogCategory,
} from "@/lib/queries";

async function requireAuth() {
  if (!(await isAuthed())) redirect("/admin/login");
}

// --- Testimonials ---
export async function saveTestimonial(id: number | null, formData: FormData) {
  await requireAuth();
  const d = {
    name: String(formData.get("name") ?? "").trim(),
    country: String(formData.get("country") ?? "").trim() || null,
    resort: String(formData.get("resort") ?? "").trim() || null,
    quote: String(formData.get("quote") ?? "").trim(),
    rating: Number(formData.get("rating") ?? 5),
    published: formData.get("published") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
  if (!d.name || !d.quote) return;
  if (id) await updateTestimonial(id, d); else await createTestimonial(d);
  revalidatePath("/admin/testimonials"); revalidatePath("/");
  redirect("/admin/testimonials");
}
export async function removeTestimonial(id: number) {
  await requireAuth(); await deleteTestimonial(id);
  revalidatePath("/admin/testimonials"); revalidatePath("/");
}

// --- FAQ ---
export async function saveFaq(id: number | null, formData: FormData) {
  await requireAuth();
  const d = {
    question: String(formData.get("question") ?? "").trim(),
    answer: String(formData.get("answer") ?? "").trim(),
    published: formData.get("published") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
  if (!d.question || !d.answer) return;
  if (id) await updateFaq(id, d); else await createFaq(d);
  revalidatePath("/admin/faq"); revalidatePath("/");
  redirect("/admin/faq");
}
export async function removeFaq(id: number) {
  await requireAuth(); await deleteFaq(id);
  revalidatePath("/admin/faq"); revalidatePath("/");
}

// --- Blog ---
export async function saveBlogPost(id: number | null, formData: FormData) {
  await requireAuth();
  const catRaw = String(formData.get("categoryId") ?? "").trim();
  const d = {
    title: String(formData.get("title") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    body: String(formData.get("body") ?? "").trim(),
    cover: String(formData.get("cover") ?? "").trim() || null,
    categoryId: catRaw ? Number(catRaw) : null,
    metaTitle: String(formData.get("metaTitle") ?? "").trim() || null,
    metaDescription: String(formData.get("metaDescription") ?? "").trim() || null,
    keywords: String(formData.get("keywords") ?? "").trim() || null,
    published: formData.get("published") === "on",
  };
  if (!d.title || !d.body) return;
  if (id) await updateBlogPost(id, d); else await createBlogPost(d);
  revalidatePath("/admin/blog"); revalidatePath("/blog");
  redirect("/admin/blog");
}
export async function removeBlogPost(id: number) {
  await requireAuth(); await deleteBlogPost(id);
  revalidatePath("/admin/blog"); revalidatePath("/blog");
}
export async function addBlogCategory(formData: FormData) {
  await requireAuth();
  const name = String(formData.get("name") ?? "").trim();
  if (name) await createBlogCategory(name);
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}
