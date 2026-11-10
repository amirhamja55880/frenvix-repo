import Link from "next/link";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { taka, cdn } from "@/lib/products";
import { esc } from "@/lib/admin";
import ImageCheck from "./ImageCheck";

export default async function Products({ searchParams }) {
  const q = String(searchParams?.q || "").trim().slice(0, 40);
  await connectDB();
  const [list, cats] = await Promise.all([Product.find(q ? { name: new RegExp(esc(q), "i") } : {}).sort({ createdAt: -1 }).lean(), Category.find().lean()]);
  const byName = Object.fromEntries(cats.map((c) => [c.name, c]));
  // Why a product is (not) shown on the website
  const status = (p) => {
    if (!p.isActive) return ["Hidden", "st-Hidden"];
    const c = byName[p.category];
    if (!c) return ["Hidden · category removed", "st-Hidden"];
    if (!c.isActive) return ["Hidden · category hidden", "st-Hidden"];
    if (p.subCategory && !c.subs.includes(p.subCategory)) return ["Hidden · sub category removed", "st-Hidden"];
    if (p.subCategory && (c.hiddenSubs || []).includes(p.subCategory)) return ["Hidden · sub category hidden", "st-Hidden"];
    return ["Active", "st-Active"];
  };
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1>Products ({list.length})</h1>
        <Link className="btn dark" href="/admin/products/new">+ Add product</Link>
      </div>
      <form action="/admin/products" style={{ display: "flex", gap: 8, margin: "0 0 16px", maxWidth: 420 }}>
        <input name="q" defaultValue={q} placeholder="Search product name" /><button className="btn dark" style={{ padding: "0 22px" }}>Search</button>
      </form>
      <ImageCheck />
      <div className="panel"><div className="tblwrap"><table className="tbl">
        <thead><tr><th></th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>On website</th><th></th></tr></thead>
        <tbody>
          {list.map((p) => {
            const stock = p.variants.reduce((a, v) => a + v.stock, 0);
            const [label, cls] = status(p);
            return (
              <tr key={p.slug}>
                <td>{p.images?.[0] ? /* eslint-disable-next-line @next/next/no-img-element */ <img className="pimg" src={cdn(p.images[0], 100)} alt="" /> : <div className="pimg" />}</td>
                <td><Link href={`/admin/products/${p.slug}`}><b>{p.name}</b></Link></td>
                <td>{p.category}{p.subCategory && <><br /><span className="muted small">{p.subCategory}</span></>}</td>
                <td>{taka(p.price)}</td>
                <td><b style={{ color: stock === 0 ? "#b91c1c" : "inherit" }}>{stock === 0 ? "Sold out" : stock}</b></td>
                <td><span className={`pill2 ${cls}`}>{label}</span></td>
                <td><Link className="btn outline" style={{ padding: "6px 16px", fontSize: 14 }} href={`/admin/products/${p.slug}`}>Edit</Link></td>
              </tr>
            );
          })}
          {!list.length && <tr><td colSpan={7} className="muted">No products found.</td></tr>}
        </tbody>
      </table></div></div>
    </>
  );
}
