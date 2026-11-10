"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const toSubs = (t) => t.split(",").map((s) => s.trim()).filter(Boolean);

export default function CategoryManager({ initial }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [draft, setDraft] = useState({ name: "", subsText: "" });
  const [newSub, setNewSub] = useState({});
  const [msg, setMsg] = useState("");
  const [bad, setBad] = useState(false);
  const [busy, setBusy] = useState(false);

  const call = async (url, method, body, ok) => {
    setBusy(true); setMsg(""); setBad(false);
    try {
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body && JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed");
      setMsg(typeof ok === "function" ? ok(d) : ok); router.refresh();
      return true;
    } catch (e) { setMsg(e.message); setBad(true); return false; } finally { setBusy(false); }
  };
  const patch = (slug, p) => setRows((r) => r.map((c) => (c.slug === slug ? { ...c, ...p } : c)));
  const patchSub = (slug, i, p) => setRows((r) => r.map((c) => (c.slug === slug ? { ...c, subs: c.subs.map((s, k) => (k === i ? { ...s, ...p } : s)) } : c)));
  const addSub = (slug) => {
    const n = (newSub[slug] || "").trim();
    if (!n) return;
    setRows((r) => r.map((c) => (c.slug === slug ? { ...c, subs: [...c.subs, { name: n, orig: "", visible: true }] } : c)));
    setNewSub({ ...newSub, [slug]: "" });
  };
  const delSub = (slug, i) => setRows((r) => r.map((c) => (c.slug === slug ? { ...c, subs: c.subs.filter((_, k) => k !== i) } : c)));
  const save = async (c) => {
    const subs = c.subs.filter((s) => s.name.trim());
    if (await call(`/api/admin/categories/${c.slug}`, "PUT", { name: c.name, sortOrder: c.sortOrder, isActive: c.isActive, subs }, `${c.name} saved.`)) patch(c.slug, { subs: subs.map((s) => ({ ...s, orig: s.name })) });
  };
  const remove = async (c) => {
    if (!confirm(`Delete "${c.name}"?\n\nIts ${c.products} product(s) will be hidden on the website. They are not deleted.`)) return;
    if (await call(`/api/admin/categories/${c.slug}`, "DELETE", null, (d) => `Category deleted. ${d.hidden} product(s) are now hidden on the website.`)) setRows((r) => r.filter((x) => x.slug !== c.slug));
  };
  const create = async () => {
    if (await call("/api/admin/categories", "POST", { name: draft.name, subs: toSubs(draft.subsText).map((name) => ({ name, visible: true })), sortOrder: rows.length + 1 }, "Category added.")) {
      setDraft({ name: "", subsText: "" });
      setTimeout(() => window.location.reload(), 500);
    }
  };

  return (
    <>
      {msg && <p className={bad ? "error" : "note"} role="status" style={{ marginTop: 0 }}>{msg}</p>}
      <div className="panel">
        <h2>Add category</h2>
        <div className="row2">
          <div className="field"><label htmlFor="cn">Name</label><input id="cn" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Jacket" /></div>
          <div className="field"><label htmlFor="cs">Sub categories (separate with commas)</label><input id="cs" value={draft.subsText} onChange={(e) => setDraft({ ...draft, subsText: e.target.value })} placeholder="e.g. Bomber, Denim" /></div>
        </div>
        <button className="btn dark" disabled={busy} onClick={create}>Add category</button>
      </div>

      {rows.map((c) => (
        <div className="panel" key={c.slug} style={c.isActive ? null : { background: "#fafafa" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "end", flexWrap: "wrap" }}>
            <div className="field" style={{ flex: "1 1 220px", marginBottom: 0 }}><label>Category name</label><input value={c.name} onChange={(e) => patch(c.slug, { name: e.target.value })} /></div>
            <div className="field" style={{ width: 90, marginBottom: 0 }}><label>Order</label><input type="number" value={c.sortOrder} onChange={(e) => patch(c.slug, { sortOrder: e.target.value })} /></div>
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 600, margin: "0 0 12px" }}>
              <input type="checkbox" style={{ width: "auto" }} checked={c.isActive} onChange={(e) => patch(c.slug, { isActive: e.target.checked })} /> {c.isActive ? "Visible on website" : "Hidden"}
            </label>
          </div>
          <p className="muted small" style={{ margin: "8px 0 14px" }}>{c.products} product(s){!c.isActive && c.products > 0 ? " are hidden on the website because this category is hidden" : ""}</p>

          <p className="label" style={{ marginTop: 0 }}>Sub categories</p>
          {c.subs.length === 0 && <p className="muted small">No sub categories yet.</p>}
          {c.subs.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
              <input value={s.name} onChange={(e) => patchSub(c.slug, i, { name: e.target.value })} style={{ flex: "1 1 180px" }} aria-label="Sub category name" />
              <label style={{ display: "flex", gap: 6, alignItems: "center", fontWeight: 400, margin: 0 }}><input type="checkbox" style={{ width: "auto" }} checked={s.visible} onChange={(e) => patchSub(c.slug, i, { visible: e.target.checked })} /> {s.visible ? "Visible" : "Hidden"}</label>
              <button type="button" className="link" onClick={() => delSub(c.slug, i)}>Remove</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, margin: "10px 0 16px" }}>
            <input value={newSub[c.slug] || ""} onChange={(e) => setNewSub({ ...newSub, [c.slug]: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addSub(c.slug)} placeholder="New sub category" style={{ maxWidth: 260 }} />
            <button type="button" className="chip" onClick={() => addSub(c.slug)}>+ Add</button>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn dark" style={{ padding: "10px 22px" }} disabled={busy} onClick={() => save(c)}>Save changes</button>
            <button className="btn outline" style={{ padding: "10px 22px", color: "#b91c1c", borderColor: "#b91c1c" }} disabled={busy} onClick={() => remove(c)}>Delete category</button>
            <span className="muted small">Removing a sub category here takes effect after you press Save.</span>
          </div>
        </div>
      ))}
    </>
  );
}
