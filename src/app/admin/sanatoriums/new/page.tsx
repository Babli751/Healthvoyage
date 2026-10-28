import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { getCountries, getTreatments } from "@/lib/queries";
import { SanatoriumForm } from "@/components/admin/SanatoriumForm";
import { createAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NewSanatorium() {
  if (!(await isAuthed())) redirect("/admin/login");

  const [countries, treatments] = await Promise.all([getCountries(), getTreatments()]);

  return (
    <div className="apage">
      <header className="apage-head">
        <div>
          <Link href="/admin/sanatoriums" className="alink">← Back to list</Link>
          <h1>New sanatorium</h1>
        </div>
      </header>
      <SanatoriumForm action={createAction} countries={countries} treatments={treatments} submitLabel="Create" />
    </div>
  );
}
