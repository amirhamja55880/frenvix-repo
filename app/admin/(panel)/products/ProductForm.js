"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cdn } from "@/lib/products";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

// One uploaded image preview. Falls back to the original file if the resized version cannot load.
function Thumb({ url }) {
  const [lvl, setLvl] = useState(0);
  if (lvl > 1) return <div className="thumbfail">Image cannot be loaded</div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={lvl ? url : cdn(url, 200)} alt="" onError={() => setLvl(lvl + 1)} />;
}

export default function ProductForm({ categories, product }) {
  const router = useRouter();
  const editing = !!product;
  const [f, setF] = useState(() => product ? {
    name: product.name, slug: product.slug, category: categories.some((c) => c.name === product.category) ? product.category : "", subCategory: (categories.find((c) => c.name === product.category)?.subs || []).includes(product.subCategory) ? product.subCategory : "", price: String(product.price), oldPrice: product.oldPrice ? String(product.oldPrice) : "",
    fabric: product.fabric || "", description: product.description || "", isActive: product.isActive, images: product.images || [],
    sizes: ALL_SIZES.filter((s) => product.variants.some((v) => v.size === s)),
    colors: product.colors.map((c) => ({ name: c.name, hex: c.hex, stock: Object.fromEntries(product.variants.filter((v) => v.color === c.name).map((v) => [v.size, String(v.stock)])) })),
  } : { name: "", slug: "", category: categories[0]?.name || "", subCategory: "", price: "", oldPrice: "", fabric: "", description: "", isActive: true, images: [], sizes: ["S", "M", "L", "XL", "XXL"], colors: [{ name: "Black", hex: "#18181a", stock: {} }] });
  const [busy, setBusy] = useState(false);
  const [up, setUp] = useState(false);
  const [imgErr, setImgErr] = useState("");
  const [upNote, setUpNote] = useState("");
  const [msg, setMsg] = useState("");
  const [link, setLink] = useState("");
  const cat = categories.find((c) => c.name === f.category);

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const onName = (e) => { const v = e.target.value; setF((p) => ({ ...p, name: v, ...(!editing && p.slug === slugify(p.name) ? { slug: slugify(v) } : {}) })); };
  const onCat = (e) => setF((p) => ({ ...p, category: e.target.value, subCategory: "" }));
  const toggleSize = (s) => setF((p) => ({ ...p, sizes: p.sizes.includes(s) ? p.sizes.filter((x) => x !== s) : ALL_SIZES.filter((x) => p.sizes.includes(x) || x === s) }));
  const setColor = (i, patch) => setF((p) => ({ ...p, colors: p.colors.map((c, k) => (k === i ? { ...c, ...patch } : c)) }));
  const setStock = (i, s, v) => setF((p) => ({ ...p, colors: p.colors.map((c, k) => (k === i ? { ...c, stock: { ...c.stock, [s]: v } } : c)) }));
  const addColor = () => setF((p) => ({ ...p, colors: [...p.colors, { name: "", hex: "#888888", stock: {} }] }));
  const delColor = (i) => setF((p) => ({ ...p, colors: p.colors.filter((_, k) => k !== i) }));
  const delImg = (i) => setF((p) => ({ ...p, images: p.images.filter((_, k) => k !== i) }));
  const mainImg = (i) => setF((p) => ({ ...p, images: [p.images[i], ...p.images.filter((_, k) => k !== i)] }));

  const upload = async (files) => {
    setUp(true); setImgErr(""); let n = 0;
    try {
      for (const file of files) {
        setUpNote(`Uploading ${++n} of ${files.length}…`);
        if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed");
        if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name} is larger than 10 MB`);
        const sr = await fetch("/api/admin/upload-sign", { method: "POST" });
        const s = await sr.json();
        if (!sr.ok) throw new Error(s.error || "Upload is not available");
        const fd = new FormData();
        fd.append("file", file); fd.append("api_key", s.apiKey); fd.append("timestamp", s.timestamp); fd.append("folder", s.folder); fd.append("signature", s.signature);
        const r = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`, { method: "POST", body: fd });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error?.message || "Upload failed");
        setF((p) => ({ ...p, images: [...p.images, d.secure_url] }));
      }
    } catch (e) { setImgErr(e.message); }
    setUp(false); setUpNote("");
  };

  const save = async () => {
    setBusy(true); setMsg("");
    try {
      const r = await fetch(editing ? `/api/admin/products/${product.slug}` : "/api/admin/products", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not save");
      router.push("/admin/products"); router.refresh();
    } catch (e) { setMsg(e.message); setBusy(false); }
  };
  const remove = async () => {
    if (!confirm("Delete this product permanently? Hiding it is safer if you may sell it again.")) return;
    setBusy(true);
    await fetch(`/api/admin/products/${product.slug}`, { method: "DELETE" });
    router.push("/admin/products"); router.refresh();
  };

  return (
    <div className="split">
      <div>
        <div className="panel">
          <h2>Details</h2>
          <div className="field"><label htmlFor="n">Product name</label><input id="n" value={f.name} onChange={onName} /></div>
          <div className="field"><label htmlFor="sl">Slug (web address)</label><input id="sl" value={f.slug} onChange={set("slug")} disabled={editing} />{editing && <p className="muted small">The slug cannot change after the product is created.</p>}</div>
          <div className="row2">
            <div className="field"><label htmlFor="pr">Price (৳)</label><input id="pr" inputMode="numeric" value={f.price} onChange={set("price")} /></div>
            <div className="field"><label htmlFor="op">Old price (optional, for sale)</label><input id="op" inputMode="numeric" value={f.oldPrice} onChange={set("oldPrice")} /></div>
          </div>
          <div className="field"><label htmlFor="fb">Fabric</label><input id="fb" value={f.fabric} onChange={set("fabric")} placeholder="e.g. 380 GSM brushed fleece" /></div>
          <div className="field"><label htmlFor="ds">Description</label><textarea id="ds" rows={4} value={f.description} onChange={set("description")} /></div>
        </div>

        <div className="panel">
          <h2>Colors, sizes and stock</h2>
          <p className="label" style={{ marginTop: 0 }}>Sizes available</p>
          <div className="chips" style={{ marginBottom: 16 }}>{ALL_SIZES.map((s) => <button type="button" key={s} className={`chip ${f.sizes.includes(s) ? "on" : ""}`} onClick={() => toggleSize(s)}>{s}</button>)}</div>
          <div className="tblwrap"><table className="tbl matrix">
            <thead><tr><th>Color</th><th></th>{f.sizes.map((s) => <th key={s}>{s}</th>)}<th></th></tr></thead>
            <tbody>
              {f.colors.map((c, i) => (
                <tr key={i}>
                  <td><input value={c.name} onChange={(e) => setColor(i, { name: e.target.value })} placeholder="Color name" style={{ minWidth: 110 }} /></td>
                  <td><input type="color" value={c.hex} onChange={(e) => setColor(i, { hex: e.target.value })} aria-label="Color value" style={{ width: 44, height: 40, padding: 2 }} /></td>
                  {f.sizes.map((s) => <td key={s}><input inputMode="numeric" value={c.stock[s] ?? ""} onChange={(e) => setStock(i, s, e.target.value)} placeholder="0" style={{ width: 68 }} /></td>)}
                  <td><button type="button" className="link" onClick={() => delColor(i)} disabled={f.colors.length === 1}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table></div>
          <p className="muted small">Numbers are the stock for each color and size. Leave 0 for sold out.</p>
          <button type="button" className="chip" onClick={addColor}>+ Add color</button>
        </div>
      </div>

      <div>
        <div className="panel">
          <h2>Status</h2>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 400, margin: 0 }}><input type="checkbox" style={{ width: "auto" }} checked={f.isActive} onChange={(e) => setF({ ...f, isActive: e.target.checked })} /> Active (visible on the website)</label>
        </div>
        <div className="panel">
          <h2>Category</h2>
          <div className="field"><label htmlFor="ct">Category</label><select id="ct" value={f.category} onChange={onCat}><option value="">Choose a category</option>{categories.map((c) => <option key={c.slug}>{c.name}{c.isActive ? "" : " (hidden)"}</option>)}</select>{editing && !f.category && <p className="error">This product's category was removed, so it is hidden on the website. Choose a category to show it again.</p>}</div>
          <div className="field"><label htmlFor="sc">Sub category</label><select id="sc" value={f.subCategory} onChange={set("subCategory")}><option value="">None</option>{(cat?.subs || []).map((s) => <option key={s} value={s}>{s}{(cat.hiddenSubs || []).includes(s) ? " (hidden)" : ""}</option>)}</select></div>
        </div>
        <div className="panel">
          <h2>Images</h2>
          <div className="thumbs">
            {f.images.map((u, i) => (
              <div className="thumb2" key={u + i}>
                <Thumb url={u} />
                <button type="button" className="x" onClick={() => delImg(i)} aria-label="Remove image">✕</button>
                {i === 0 ? <span className="main">Main</span> : <button type="button" className="mk" onClick={() => mainImg(i)}>Make main</button>}
              </div>
            ))}
          </div>
          {f.images.length > 0 && <p className="note" style={{ margin: "12px 0 0" }}>✓ {f.images.length} photo(s) added. Press &quot;{editing ? "Save changes" : "Create product"}&quot; to show them on the website.</p>}
          <label className="btn outline full" style={{ cursor: "pointer", marginTop: 12 }}>{up ? upNote || "Uploading…" : "Upload images"}<input type="file" accept="image/*" multiple hidden disabled={up} onChange={(e) => { upload([...e.target.files]); e.target.value = ""; }} /></label>
          {imgErr && <p className="error" role="alert">{imgErr}</p>}
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}><input value={link} onChange={(e) => setLink(e.target.value)} placeholder="or paste an image link (https://…)" /><button type="button" className="chip" onClick={() => { if (link.startsWith("https://")) { setF((p) => ({ ...p, images: [...p.images, link.trim()] })); setLink(""); } }}>Add</button></div>
          <p className="muted small" style={{ marginTop: 8 }}>The first image is the main one. Up to 8 images, 10 MB each.</p>
        </div>
        {msg && <p className="error" role="alert">{msg}</p>}
        <button className="btn dark full" style={{ marginTop: 0 }} onClick={save} disabled={busy || up}>{busy ? "Saving…" : editing ? "Save changes" : "Create product"}</button>
        {editing && <button className="btn outline full" onClick={remove} disabled={busy} style={{ color: "#b91c1c", borderColor: "#b91c1c" }}>Delete product</button>}
      </div>
    </div>
  );
}
