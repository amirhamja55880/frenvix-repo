"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cdn } from "@/lib/products";

async function uploadImage(file) {
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed");
  if (file.size > 10 * 1024 * 1024) throw new Error("The image is larger than 10 MB");
  const sr = await fetch("/api/admin/upload-sign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "banners" }) });
  const s = await sr.json();
  if (!sr.ok) throw new Error(s.error || "Upload is not available");
  const fd = new FormData();
  fd.append("file", file); fd.append("api_key", s.apiKey); fd.append("timestamp", s.timestamp); fd.append("folder", s.folder); fd.append("signature", s.signature);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`, { method: "POST", body: fd });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error?.message || "Upload failed");
  return d.secure_url;
}

export default function BannerManager({ initial }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [msg, setMsg] = useState("");
  const [bad, setBad] = useState(false);
  const [busy, setBusy] = useState(false);

  const run = async (fn, ok) => {
    setBusy(true); setMsg(""); setBad(false);
    try { await fn(); if (ok) setMsg(ok); router.refresh(); } catch (e) { setMsg(e.message); setBad(true); } finally { setBusy(false); }
  };
  const call = async (url, method, body) => {
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body && JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Failed");
    return d;
  };
  const patch = (id, p) => setRows((r) => r.map((b) => (b.id === id ? { ...b, ...p } : b)));

  const add = (file) => run(async () => {
    const image = await uploadImage(file);
    const d = await call("/api/admin/banners", "POST", { image, sortOrder: rows.length + 1 });
    setRows((r) => [...r, d.banner]);
  }, "Banner added. It is on the website now.");
  const setMobile = (b, file) => run(async () => { const mobileImage = await uploadImage(file); await call(`/api/admin/banners/${b.id}`, "PUT", { ...b, mobileImage }); patch(b.id, { mobileImage }); }, "Phone image saved.");
  const save = (b) => run(() => call(`/api/admin/banners/${b.id}`, "PUT", b), "Saved.");
  const remove = (b) => { if (confirm("Remove this banner from the website?")) run(async () => { await call(`/api/admin/banners/${b.id}`, "DELETE"); setRows((r) => r.filter((x) => x.id !== b.id)); }, "Banner removed."); };

  const sorted = [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <>
      <p className="muted" style={{ marginTop: -10, marginBottom: 18, maxWidth: 720 }}>
        These pictures slide across the top of the home page. The website adds no text of its own, so put any words you want inside the picture. Best size: <b>1920 × 720 px</b> (wide). Optional phone picture: <b>1080 × 1350 px</b> (tall).
      </p>
      {msg && <p className={bad ? "error" : "note"} role="status" style={{ marginTop: 0 }}>{msg}</p>}
      <div className="panel">
        <label className="btn dark" style={{ cursor: "pointer" }}>{busy ? "Please wait…" : "+ Add banner picture"}
          <input type="file" accept="image/*" hidden disabled={busy} onChange={(e) => { if (e.target.files[0]) add(e.target.files[0]); e.target.value = ""; }} />
        </label>
      </div>
      {sorted.map((b) => (
        <div className="panel" key={b.id} style={b.isActive ? null : { background: "#fafafa" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(220px,340px) 1fr", gap: 20, alignItems: "start" }} className="bnrow">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cdn(b.image, 600)} alt="" style={{ width: "100%", borderRadius: 8, border: "1px solid var(--line)", display: "block" }} />
              <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
                {b.mobileImage && /* eslint-disable-next-line @next/next/no-img-element */ <img src={cdn(b.mobileImage, 120)} alt="" style={{ height: 56, borderRadius: 6, border: "1px solid var(--line)" }} />}
                <label className="chip" style={{ cursor: "pointer" }}>{b.mobileImage ? "Change phone picture" : "+ Phone picture (optional)"}
                  <input type="file" accept="image/*" hidden disabled={busy} onChange={(e) => { if (e.target.files[0]) setMobile(b, e.target.files[0]); e.target.value = ""; }} />
                </label>
              </div>
            </div>
            <div>
              <div className="field"><label>Opens this page when clicked (optional)</label><input value={b.link} onChange={(e) => patch(b.id, { link: e.target.value })} placeholder="/shop  or  /shop?cat=Hoodie  or  https://…" /></div>
              <div className="field"><label>Short description of the picture (for screen readers)</label><input value={b.alt} onChange={(e) => patch(b.id, { alt: e.target.value })} placeholder="optional" /></div>
              <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 400, margin: 0 }}>Order <input type="number" style={{ width: 70 }} value={b.sortOrder} onChange={(e) => patch(b.id, { sortOrder: e.target.value })} /></label>
                <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 400, margin: 0 }}><input type="checkbox" style={{ width: "auto" }} checked={b.isActive} onChange={(e) => patch(b.id, { isActive: e.target.checked })} /> {b.isActive ? "Shown on website" : "Hidden"}</label>
                <span className="spacer" />
                <button className="btn dark" style={{ padding: "9px 20px" }} disabled={busy} onClick={() => save(b)}>Save</button>
                <button className="btn outline" style={{ padding: "9px 20px", color: "#b91c1c", borderColor: "#b91c1c" }} disabled={busy} onClick={() => remove(b)}>Remove</button>
              </div>
            </div>
          </div>
        </div>
      ))}
      {!rows.length && <p className="muted">No banners yet. The home page shows a plain dark banner until you add one.</p>}
    </>
  );
}
