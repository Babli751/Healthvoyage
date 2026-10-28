"use client";

import { useState } from "react";
import Image from "next/image";
import { RichText } from "./RichText";
import { GalleryUpload } from "./GalleryUpload";

interface Country { id: number; name: string; flag: string | null }
interface Treatment { id: number; name: string }

interface Props {
  action: (formData: FormData) => void;
  countries: Country[];
  treatments: Treatment[];
  initial?: {
    name: string; city: string; stars: number | null; summary: string;
    description: string; image: string | null; country_id: number; treatment_ids: number[];
    gallery?: string[]; meta_title?: string | null; meta_description?: string | null; keywords?: string | null;
  };
  submitLabel: string;
}

export function SanatoriumForm({ action, countries, treatments, initial, submitLabel }: Props) {
  const [image, setImage] = useState(initial?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadErr("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setImage(data.path);
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={action} className="admin-form">
      <input type="hidden" name="image" value={image} />

      <div className="form-grid">
        <label className="field">
          <span>Name *</span>
          <input name="name" required defaultValue={initial?.name} />
        </label>
        <label className="field">
          <span>City *</span>
          <input name="city" required defaultValue={initial?.city} />
        </label>
        <label className="field">
          <span>Country *</span>
          <select name="countryId" required defaultValue={initial?.country_id ?? ""}>
            <option value="" disabled>Select…</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Stars</span>
          <select name="stars" defaultValue={initial?.stars ?? ""}>
            <option value="">—</option>
            <option value="3">3 ★</option>
            <option value="4">4 ★</option>
            <option value="5">5 ★</option>
          </select>
        </label>
      </div>

      <label className="field">
        <span>Short summary (card text) *</span>
        <input name="summary" required defaultValue={initial?.summary} maxLength={200} />
      </label>

      <div className="field">
        <span>Full description *</span>
        <RichText name="description" initial={initial?.description ?? ""} />
      </div>

      <div className="field">
        <span>Image</span>
        <div className="upload-row">
          {image ? (
            <div className="upload-preview">
              <Image src={image} alt="preview" width={120} height={80} style={{ objectFit: "cover", borderRadius: 8 }} />
            </div>
          ) : (
            <div className="upload-preview empty">No image</div>
          )}
          <div>
            <input type="file" accept="image/*" onChange={onUpload} disabled={uploading} />
            {uploading && <span className="hint"> Uploading…</span>}
            {uploadErr && <span className="form-error"> {uploadErr}</span>}
            {image && (
              <div><button type="button" className="link-btn" onClick={() => setImage("")}>Remove image</button></div>
            )}
          </div>
        </div>
      </div>

      <div className="field">
        <span>Treatment profiles</span>
        <div className="checkbox-grid">
          {treatments.map((t) => (
            <label key={t.id} className="checkbox">
              <input
                type="checkbox"
                name="treatments"
                value={t.id}
                defaultChecked={initial?.treatment_ids.includes(t.id)}
              />
              {t.name}
            </label>
          ))}
        </div>
      </div>

      <div className="field">
        <span>Gallery images</span>
        <GalleryUpload initial={initial?.gallery ?? []} />
      </div>

      <details className="admin-seo">
        <summary>SEO settings (optional)</summary>
        <label className="field">
          <span>Meta title</span>
          <input name="metaTitle" defaultValue={initial?.meta_title ?? ""} maxLength={70} />
        </label>
        <label className="field">
          <span>Meta description</span>
          <textarea name="metaDescription" rows={2} defaultValue={initial?.meta_description ?? ""} maxLength={180} />
        </label>
        <label className="field">
          <span>Keywords (comma separated)</span>
          <input name="keywords" defaultValue={initial?.keywords ?? ""} />
        </label>
      </details>

      <button className="btn" type="submit">{submitLabel}</button>
    </form>
  );
}
