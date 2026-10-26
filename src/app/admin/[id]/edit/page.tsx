import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { getCountries, getTreatments, getSanatoriumById } from "@/lib/queries";
import { SanatoriumForm } from "@/components/admin/SanatoriumForm";
import { updateAction } from "../../actions";

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
    <main className="admin-wrap">
      <div className="admin-topbar">
        <div>
          <Link href="/admin" className="link-btn">← Back</Link>
          <h1>Edit: {sanatorium.name}</h1>
        </div>
      </div>
      <SanatoriumForm
        action={boundUpdate}
        countries={countries}
        treatments={treatments}
        initial={sanatorium}
        submitLabel="Save changes"
      />
    </main>
  );
}
