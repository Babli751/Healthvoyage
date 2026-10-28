import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { getCountries, getTreatments, getSanatoriumById } from "@/lib/queries";
import { SanatoriumForm } from "@/components/admin/SanatoriumForm";
import { updateAction } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function EditSanatorium({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAuthed())) redirect("/admin/login");

  const { id } = await params;
  const sanatoriumId = Number(id);
  if (!Number.isFinite(sanatoriumId)) notFound();

  const [countries, treatments, sanatorium] = await Promise.all([
    getCountries(),
    getTreatments(),
    getSanatoriumById(sanatoriumId),
  ]);

  if (!sanatorium) notFound();

  const boundUpdate = updateAction.bind(null, sanatoriumId);

  return (
    <div className="apage">
      <header className="apage-head">
        <div>
          <Link href="/admin/sanatoriums" className="alink">← Back to list</Link>
          <h1>Edit: {sanatorium.name}</h1>
        </div>
      </header>
      <SanatoriumForm
        action={boundUpdate}
        countries={countries}
        treatments={treatments}
        initial={sanatorium}
        submitLabel="Save changes"
      />
    </div>
  );
}
