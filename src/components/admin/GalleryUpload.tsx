"use client";

import { useState } from "react";
import Image from "next/image";

// Multi-image uploader. Each path becomes a hidden input named `gallery`.
export function GalleryUpload({ name = "gallery", initial = [] }: { name?: string; initial?: string[] }) {
  const [paths, setPaths] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBusy(true); setErr("");
    try {
      for (const file of files) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        setPaths((p) => [...p, data.path]);
      }
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="gup">
      <div className="gup-grid">
        {paths.map((p) => (
          <div key={p} className="gup-item">
            <Image src={p} alt="" width={120} height={84} style={{ objectFit: "cover" }} />
            <button type="button" className="gup-x" onClick={() => setPaths((x) => x.filter((v) => v !== p))}>×</button>
            <input type="hidden" name={name} value={p} />
          </div>
        ))}
        <label className="gup-add">
          {busy ? "Uploading…" : "+ Add images"}
          <input type="file" accept="image/*" multiple onChange={onFiles} disabled={busy} hidden />
        </label>
      </div>
      {err && <p className="form-error">{err}</p>}
    </div>
  );
}
