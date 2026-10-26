import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { isAuthed } from "@/lib/auth";

const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const MAX_BYTES = 6 * 1024 * 1024; // 6 MB

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const ext = ALLOWED.get(file.type);
  if (!ext) {
    return NextResponse.json({ error: "Only JPG, PNG or WebP" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Max 6 MB" }, { status: 413 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const name = `up-${randomUUID()}.${ext}`;
  const dir = join(process.cwd(), "public", "img");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, name), buf);

  return NextResponse.json({ path: `/img/${name}` });
}
