"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const toSubs = (t) => t.split(",").map((s) => s.trim()).filter(Boolean);

export default function CategoryManager({ initial }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial.map((c) => ({ ...c, subsText: c.subs.join(", ") })));
  const [draft, setDraft] = useState({ name: "", subsText: "", sortOrder: 0 });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const call = async (url, method, body, ok) => {
    setBusy(true); setMsg("");
    try {
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body && JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      setMsg(ok); router.refresh();
      return true;
    } catch (e) { setMsg(e.message); return false; } finally { setBusy(false); }
  };
  const edit = (slug, patch) => setRows((r) => r.map((c) => (c.slug === slug ? { ...c, ...patch } : c)));
  const body = (c) => ({ name: c.name, subs: toSubs(c.subsText), sortOrder: c.sortOrder, isActive: c.isActive });

  return (
    <>
      {msg && <p className="note" role="status" style={{ marginTop: 0 }}>{msg}</p>}
      <div className="panel">
        <h2>Add category</h2>
        <div className="row2">
          <div className="field"><label htmlFor="cn">Name</label><input id="cn" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Jacket" /></div>
          <div className="field"><label htmlFor="cs">Sub categories (separate with commas)</label><input id="cs" value={draft.subsText} onChange={(e) => setDraft({ ...draft, subsText: e.target.value })} placeholder="e.g. Bomber, Denim" /></div>
        </div>
        <button className="btn dark" disabled={busy} onClick={async () => { if (await call("/api/admin/categories", "POST", { name: draft.name, subs: toSubs(draft.subsText), sortOrder: rows.length + 1 }, "Category added.")) { setDraft({ name: "", subsText: "", sortOrder: 0 }); setTimeout(() => window.location.reload(), 400); } }}>Add category</button>
      </div>

      {rows.map((c) => (
        <div className="panel" key={c.slug}>
          <div className="row2">
            <div className="field"><label>Name</label><input value={c.name} onChange={(e) => edit(c.slug, { name: e.target.value })} /></div>
            <div className="field"><label>Sub categories (separate with commas)</label><input value={c.subsText} onChange={(e) => edit(c.slug, { subsText: e.target.value })} /></div>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ display: "flex", gap: 6, alignItems: "center", fontWeight: 400, margin: 0 }}>Order <input type="number" style={{ width: 70 }} value={c.sortOrder} onChange={(e) => edit(c.slug, { sortOrder: e.target.value })} /></label>
            <label style={{ display: "flex", gap: 6, alignItems: "center", fontWeight: 400, margin: 0 }}><input type="checkbox" style={{ width: "auto" }} checked={c.isActive} onChange={(e) => edit(c.slug, { isActive: e.target.checked })} /> Active</label>
            <span className="muted small">{c.products} product(s)</span>
            <span className="spacer" />
            <button className="btn dark" style={{ padding: "10px 20px" }} disabled={busy} onClick={() => call(`/api/admin/categories/${c.slug}`, "PUT", body(c), `${c.name} saved.`)}>Save</button>
            <button className="btn outline" style={{ padding: "10px 20px", color: "#b91c1c", borderColor: "#b91c1c" }} disabled={busy} onClick={async () => { if (confirm(`Delete ${c.name}?`) && (await call(`/api/admin/categories/${c.slug}`, "DELETE", null, "Category deleted."))) setRows((r) => r.filter((x) => x.slug !== c.slug)); }}>Delete</button>
          </div>
        </div>
      ))}
    </>
  );
}
