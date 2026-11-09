import Link from "next/link";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { taka } from "@/lib/products";
import { fmtDate, bdStartOfToday } from "@/lib/admin";

export default async function Dashboard() {
  await connectDB();
  const start = bdStartOfToday();
  const live = { status: { $ne: "Cancelled" } };
  const sum = (m) => Order.aggregate([{ $match: m }, { $group: { _id: null, total: { $sum: "$total" } } }]);
  const [todayCount, pending, todaySales, allSales, recent, products] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: start } }),
    Order.countDocuments({ status: "Pending" }),
    sum({ ...live, createdAt: { $gte: start } }),
    sum(live),
    Order.find().sort({ createdAt: -1 }).limit(8).lean(),
    Product.find({ isActive: true }).select("name variants").lean(),
  ]);
  const low = products.flatMap((p) => p.variants.filter((v) => v.stock <= 3).map((v) => ({ name: p.name, ...v }))).sort((a, b) => a.stock - b.stock).slice(0, 10);
  const stats = [["Orders today", todayCount], ["Pending orders", pending], ["Sales today", taka(todaySales[0]?.total || 0)], ["Total sales", taka(allSales[0]?.total || 0)]];

  return (
    <>
      <h1>Dashboard</h1>
      <div className="cards">{stats.map(([l, v]) => <div className="acard" key={l}><small>{l}</small><b>{v}</b></div>)}</div>
      <div className="split">
        <div className="panel">
          <h2>Recent orders</h2>
          <div className="tblwrap"><table className="tbl"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead><tbody>
            {recent.map((o) => <tr key={o.orderId}><td><Link href={`/admin/orders/${o.orderId}`}><b>{o.orderId}</b></Link><br /><span className="muted small">{fmtDate(o.createdAt)}</span></td><td>{o.name}<br /><span className="muted small">{o.phone}</span></td><td>{taka(o.total)}</td><td><span className={`pill2 st-${o.status}`}>{o.status}</span></td></tr>)}
            {!recent.length && <tr><td colSpan={4} className="muted">No orders yet.</td></tr>}
          </tbody></table></div>
          <p style={{ marginTop: 12 }}><Link className="link" href="/admin/orders">View all orders</Link></p>
        </div>
        <div className="panel">
          <h2>Low stock (3 or less)</h2>
          {low.length ? <table className="tbl"><tbody>{low.map((v, i) => <tr key={i}><td>{v.name}<br /><span className="muted small">{v.color} / {v.size}</span></td><td style={{ textAlign: "right" }}><b style={{ color: v.stock === 0 ? "#b91c1c" : "inherit" }}>{v.stock === 0 ? "Sold out" : `${v.stock} left`}</b></td></tr>)}</tbody></table> : <p className="muted">All products are well stocked.</p>}
        </div>
      </div>
    </>
  );
}
