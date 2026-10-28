"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, createSession, destroySession, isAuthed } from "@/lib/auth";
import {
  createSanatorium,
  updateSanatorium,
  deleteSanatorium,
  setInquiryStatus,
  deleteInquiry,
  type SanatoriumInput,
} from "@/lib/queries";

export async function loginAction(_prev: unknown, formData: FormData) {
  const pw = String(formData.get("password") ?? "");
  if (!checkPassword(pw)) {
    return { error: "Wrong password." };
  }
  await createSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

async function requireAuth() {
  if (!(await isAuthed())) redirect("/admin/login");
}

function parseInput(formData: FormData): SanatoriumInput {
  const starsRaw = String(formData.get("stars") ?? "").trim();
  const treatmentIds = formData
    .getAll("treatments")
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n));
  return {
    name: String(formData.get("name") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    stars: starsRaw ? Number(starsRaw) : null,
    summary: String(formData.get("summary") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    image: String(formData.get("image") ?? "").trim() || null,
    countryId: Number(formData.get("countryId")),
    treatmentIds,
  };
}

export async function createAction(formData: FormData) {
  await requireAuth();
  const input = parseInput(formData);
  if (!input.name || !input.city || !input.countryId) {
    return { error: "Name, city and country are required." };
  }
  await createSanatorium(input);
  revalidatePath("/admin");
  revalidatePath("/admin/sanatoriums");
  revalidatePath("/sanatoriums");
  revalidatePath("/");
  redirect("/admin/sanatoriums");
}

export async function updateAction(id: number, formData: FormData) {
  await requireAuth();
  const input = parseInput(formData);
  if (!input.name || !input.city || !input.countryId) {
    return { error: "Name, city and country are required." };
  }
  await updateSanatorium(id, input);
  revalidatePath("/admin");
  revalidatePath("/admin/sanatoriums");
  revalidatePath("/sanatoriums");
  revalidatePath("/");
  redirect("/admin/sanatoriums");
}

export async function deleteAction(id: number) {
  await requireAuth();
  await deleteSanatorium(id);
  revalidatePath("/admin");
  revalidatePath("/admin/sanatoriums");
  revalidatePath("/sanatoriums");
  revalidatePath("/");
}

export async function setInquiryStatusAction(id: number, status: string) {
  await requireAuth();
  await setInquiryStatus(id, status);
  revalidatePath("/admin/inquiries");
}

export async function deleteInquiryAction(id: number) {
  await requireAuth();
  await deleteInquiry(id);
  revalidatePath("/admin/inquiries");
}
