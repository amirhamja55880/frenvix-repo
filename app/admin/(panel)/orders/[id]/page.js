import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { taka } from "@/lib/products";
import { fmtDate } from "@/lib/admin";
import OrderActions from "./OrderActions";

export default async function OrderPage({ params }) {
  await connectDB();
  const o = await Order.findOne({ orderId: params.id }).lean();
  if (!o) notFound();
  const cod = o.paymentMethod === "COD";
  return (
    <>
      <p className="noprint"><Link className="link" href="/admin/orders">← All orders</Link></p>
      <h1>Order {o.orderId} <span className={`pill2 st-${o.status}`} style={{ verticalAlign: "middle" }}>{o.status}</span></h1>
      <div className="split">
        <div className="panel">
          <h2>Items</h2>
          <table className="tbl"><thead><tr><th>Product</th><th>Qty</th><th style={{ textAlign: "right" }}>Price</th></tr></thead><tbody>
            {o.items.map((i, k) => <tr key={k}><td>{i.name}<br /><span className="muted small">{i.color} / {i.size}</span></td><td>{i.qty}</td><td style={{ textAlign: "right" }}>{taka(i.price * i.qty)}</td></tr>)}
            <tr><td colSpan={2}>Subtotal</td><td style={{ textAlign: "right" }}>{taka(o.subtotal)}</td></tr>
            <tr><td colSpan={2}>Delivery</td><td style={{ textAlign: "right" }}>{taka(o.deliveryFee)}</td></tr>
            <tr><td colSpan={2}><b>Total</b></td><td style={{ textAlign: "right" }}><b>{taka(o.total)}</b></td></tr>
          </tbody></table>
          <p className="muted small" style={{ marginTop: 10 }}>Placed {fmtDate(o.createdAt)} · Payment: {cod ? "Cash on delivery" : o.paymentMethod} ({o.paymentStatus})</p>
          {o.trxId && (
            <div className="note" style={{ marginTop: 12 }}>
              <b>{o.paymentMethod} payment to verify</b><br />
              Amount to match: <b>{taka(o.total)}</b><br />
              Sent from: <b>{o.payNumber}</b><br />
              Transaction ID: <b>{o.trxId}</b><br />
              Status: <b>{o.paymentStatus}</b>
            </div>
          )}
        </div>
        <div>
          <div className="panel">
            <h2>Customer</h2>
            <p><b>{o.name}</b><br /><a className="link" href={`tel:${o.phone}`}>{o.phone}</a><br />{o.email}</p>
            <p style={{ marginTop: 10 }}>{o.address}<br />{o.thana}, {o.district}, {o.division}</p>
            {o.note && <p className="note" style={{ marginBottom: 0 }}>Note: {o.note}</p>}
          </div>
          <div className="panel noprint">
            <h2>Manage order</h2>
            <OrderActions orderId={o.orderId} status={o.status} paymentStatus={o.paymentStatus} manual={Boolean(o.trxId)} />
          </div>
        </div>
      </div>
    </>
  );
}
