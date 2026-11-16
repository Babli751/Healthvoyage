"use server";

import { createInquiry } from "@/lib/queries";

export interface InquiryState {
  ok?: boolean;
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitInquiry(_prev: InquiryState | null, formData: FormData): Promise<InquiryState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const sanatoriumName = String(formData.get("sanatoriumName") ?? "").trim();
  const sanatoriumIdRaw = String(formData.get("sanatoriumId") ?? "").trim();
  // Honeypot: real users leave this empty.
  const trap = String(formData.get("company") ?? "").trim();

  if (trap) return { ok: true }; // silently drop bots

  if (!name || name.length < 2) return { error: "Please enter your name." };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email." };
  if (!message || message.length < 5) return { error: "Please tell us a bit about what you need." };

  try {
    await createInquiry({
      name,
      email,
      phone: phone || null,
      country: country || null,
      message,
      sanatoriumId: sanatoriumIdRaw ? Number(sanatoriumIdRaw) : null,
      sanatoriumName: sanatoriumName || null,
    });
    return { ok: true };
  } catch {
    return { error: "Something went wrong. Please try again or email us directly." };
  }
}
