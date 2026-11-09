import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { taka } from "@/lib/products";
import { fmtDate, esc } from "@/lib/admin";

export default async function Customers({ searchParams }) {
  const q = String(searchParams?.q || "").trim().slice(0, 40);
  await connectDB();
  const re = q ? new RegExp(esc(q), "i") : null;
  const rows = await Order.aggregate([
    ...(re ? [{ $match: { $or: [{ phone: re }, { name: re }, { email: re }] } }] : []),
    { $sort: { createdAt: -1 } },
    { $group: { _id: "$phone", name: { $first: "$name" }, email: { $first: "$email" }, district: { $first: "$district" }, last: { $first: "$createdAt" }, orders: { $sum: 1 }, spent: { $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 0, "$total"] } } } },
    { $sort: { last: -1 } }, { $limit: 200 },
  ]);
  return (
    <>
      <h1>Customers ({rows.length})</h1>
      <form action="/admin/customers" style={{ display: "flex", gap: 8, marginBottom: 16, maxWidth: 420 }}>
        <input name="q" defaultValue={q} placeholder="Search name, phone or email" /><button className="btn dark" style={{ padding: "0 22px" }}>Search</button>
      </form>
      <div className="panel"><div className="tblwrap"><table className="tbl">
        <thead><tr><th>Customer</th><th>Email</th><th>District</th><th>Orders</th><th>Total spent</th><th>Last order</th></tr></thead>
        <tbody>
          {rows.map((c) => <tr key={c._id}><td><b>{c.name}</b><br /><a className="link small" href={`tel:${c._id}`}>{c._id}</a></td><td>{c.email}</td><td>{c.district}</td><td>{c.orders}</td><td>{taka(c.spent)}</td><td>{fmtDate(c.last)}</td></tr>)}
          {!rows.length && <tr><td colSpan={6} className="muted">No customers yet.</td></tr>}
        </tbody>
      </table></div></div>
      <p className="muted small">Customers are grouped by phone number. Total spent does not include cancelled orders.</p>
    </>
  );
}
