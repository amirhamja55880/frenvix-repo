import Link from "next/link";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { taka } from "@/lib/products";
import { STATUSES, fmtDate, esc } from "@/lib/admin";

const PER = 30;

export default async function Orders({ searchParams }) {
  const status = STATUSES.includes(searchParams?.status) ? searchParams.status : "";
  const q = String(searchParams?.q || "").trim().slice(0, 40);
  const page = Math.max(1, parseInt(searchParams?.page) || 1);
  const filter = {};
  if (status) filter.status = status;
  if (q) { const re = new RegExp(esc(q), "i"); filter.$or = [{ orderId: re }, { phone: re }, { name: re }]; }

  await connectDB();
  const [list, total, counts] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * PER).limit(PER).lean(),
    Order.countDocuments(filter),
    Order.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
  ]);
  const count = Object.fromEntries(counts.map((c) => [c._id, c.n]));
  const all = counts.reduce((a, c) => a + c.n, 0);
  const url = (o) => { const p = new URLSearchParams({ status, q, ...o }); [...p].forEach(([k, v]) => !v && p.delete(k)); const s = p.toString(); return "/admin/orders" + (s ? "?" + s : ""); };
  const pages = Math.max(1, Math.ceil(total / PER));

  return (
    <>
      <h1>Orders</h1>
      <div className="chips" style={{ marginBottom: 14 }}>
        <Link className={`chip ${!status ? "on" : ""}`} href={url({ status: "", page: "" })}>All ({all})</Link>
        {STATUSES.map((s) => <Link key={s} className={`chip ${status === s ? "on" : ""}`} href={url({ status: s, page: "" })}>{s} ({count[s] || 0})</Link>)}
      </div>
      <form action="/admin/orders" style={{ display: "flex", gap: 8, marginBottom: 16, maxWidth: 480 }}>
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={q} placeholder="Search order ID, phone or name" />
        <button className="btn dark" style={{ padding: "0 22px" }}>Search</button>
      </form>
      <div className="panel"><div className="tblwrap"><table className="tbl">
        <thead><tr><th>Order</th><th>Customer</th><th>District</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
        <tbody>
          {list.map((o) => (
            <tr key={o.orderId}>
              <td><Link href={`/admin/orders/${o.orderId}`}><b>{o.orderId}</b></Link><br /><span className="muted small">{fmtDate(o.createdAt)}</span></td>
              <td>{o.name}<br /><span className="muted small">{o.phone}</span></td>
              <td>{o.district}</td>
              <td>{taka(o.total)}</td>
              <td>{o.paymentMethod}<br /><span className="muted small">{o.paymentStatus}{o.trxId ? ` · ${o.trxId}` : ""}</span></td>
              <td><span className={`pill2 st-${o.status}`}>{o.status}</span></td>
            </tr>
          ))}
          {!list.length && <tr><td colSpan={6} className="muted">No orders found.</td></tr>}
        </tbody>
      </table></div></div>
      {pages > 1 && (
        <div className="chips">
          {page > 1 && <Link className="chip" href={url({ page: String(page - 1) })}>← Previous</Link>}
          <span className="muted small" style={{ alignSelf: "center" }}>Page {page} of {pages}</span>
          {page < pages && <Link className="chip" href={url({ page: String(page + 1) })}>Next →</Link>}
        </div>
      )}
    </>
  );
}
