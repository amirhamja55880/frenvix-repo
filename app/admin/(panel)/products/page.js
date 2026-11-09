import Link from "next/link";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { taka, cdn } from "@/lib/products";
import { esc } from "@/lib/admin";

export default async function Products({ searchParams }) {
  const q = String(searchParams?.q || "").trim().slice(0, 40);
  await connectDB();
  const list = await Product.find(q ? { name: new RegExp(esc(q), "i") } : {}).sort({ createdAt: -1 }).lean();
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1>Products ({list.length})</h1>
        <Link className="btn dark" href="/admin/products/new">+ Add product</Link>
      </div>
      <form action="/admin/products" style={{ display: "flex", gap: 8, margin: "0 0 16px", maxWidth: 420 }}>
        <input name="q" defaultValue={q} placeholder="Search product name" /><button className="btn dark" style={{ padding: "0 22px" }}>Search</button>
      </form>
      <div className="panel"><div className="tblwrap"><table className="tbl">
        <thead><tr><th></th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead>
        <tbody>
          {list.map((p) => {
            const stock = p.variants.reduce((a, v) => a + v.stock, 0);
            return (
              <tr key={p.slug}>
                <td>{p.images?.[0] ? /* eslint-disable-next-line @next/next/no-img-element */ <img className="pimg" src={cdn(p.images[0], 100)} alt="" /> : <div className="pimg" />}</td>
                <td><Link href={`/admin/products/${p.slug}`}><b>{p.name}</b></Link></td>
                <td>{p.category}{p.subCategory && <><br /><span className="muted small">{p.subCategory}</span></>}</td>
                <td>{taka(p.price)}</td>
                <td><b style={{ color: stock === 0 ? "#b91c1c" : "inherit" }}>{stock === 0 ? "Sold out" : stock}</b></td>
                <td><span className={`pill2 ${p.isActive ? "st-Active" : "st-Hidden"}`}>{p.isActive ? "Active" : "Hidden"}</span></td>
              </tr>
            );
          })}
          {!list.length && <tr><td colSpan={6} className="muted">No products found.</td></tr>}
        </tbody>
      </table></div></div>
    </>
  );
}
