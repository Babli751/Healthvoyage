import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { countNewInquiries } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ count: 0 }, { status: 401 });
  const count = await countNewInquiries();
  return NextResponse.json({ count });
}
