"use client";

import { useState } from "react";
import Image from "next/image";
import { RichText } from "./RichText";

interface Category { id: number; name: string }
interface Props {
  action: (formData: FormData) => void;
  categories: Category[];
  initial?: {
    title: string; excerpt: string | null; body: string; cover: string | null;
    category_id: number | null; meta_title: string | null; meta_description: string | null;
    keywords: string | null; published: boolean;
  };
  submitLabel: string;
}

export function BlogForm({ action, categories, initial, submitLabel }: Props) {
  const [cover, setCover] = useState(initial?.cover ?? "");
  const [busy, setBusy] = useState(false);

  async function onCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (res.ok) setCover(data.path);
    } finally { setBusy(false); }
  }

  return (
    <form action={action} className="admin-form">
      <input type="hidden" name="cover" value={cover} />
      <div className="form-grid">
        <label className="field">
          <span>Title *</span>
          <input name="title" required defaultValue={initial?.title} />
        </label>
        <label className="field">
          <span>Category</span>
          <select name="categoryId" defaultValue={initial?.category_id ?? ""}>
            <option value="">—</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      </div>

      <label className="field">
        <span>Excerpt (short summary)</span>
        <textarea name="excerpt" rows={2} defaultValue={initial?.excerpt ?? ""} maxLength={200} />
      </label>

      <div className="field">
        <span>Cover image</span>
        <div className="upload-row">
          {cover ? <div className="upload-preview"><Image src={cover} alt="" width={120} height={80} style={{ objectFit: "cover", borderRadius: 8 }} /></div>
                 : <div className="upload-preview empty">No image</div>}
          <div>
            <input type="file" accept="image/*" onChange={onCover} disabled={busy} />
            {busy && <span className="hint"> Uploading…</span>}
            {cover && <div><button type="button" className="link-btn" onClick={() => setCover("")}>Remove</button></div>}
          </div>
        </div>
      </div>

      <div className="field">
        <span>Body *</span>
        <RichText name="body" initial={initial?.body ?? ""} />
      </div>

      <label className="checkbox" style={{ marginBottom: 16 }}>
        <input type="checkbox" name="published" defaultChecked={initial?.published ?? true} /> Published
      </label>

      <details className="admin-seo">
        <summary>SEO settings (optional)</summary>
        <label className="field"><span>Meta title</span><input name="metaTitle" defaultValue={initial?.meta_title ?? ""} maxLength={70} /></label>
        <label className="field"><span>Meta description</span><textarea name="metaDescription" rows={2} defaultValue={initial?.meta_description ?? ""} maxLength={180} /></label>
        <label className="field"><span>Keywords</span><input name="keywords" defaultValue={initial?.keywords ?? ""} /></label>
      </details>

      <button className="btn" type="submit">{submitLabel}</button>
    </form>
  );
}
