import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { sendCustomerEmail, sendAdminEmail } from "@/lib/email";
import { siteUrl } from "@/lib/seo";

const live = () => process.env.SSLC_IS_LIVE === "true";
const host = () => (live() ? "https://securepay.sslcommerz.com" : "https://sandbox.sslcommerz.com");
export const sslcReady = () => Boolean(process.env.SSLC_STORE_ID && process.env.SSLC_STORE_PASSWORD);

// Step 1: ask SSLCommerz for a payment page address for this order.
export async function startPayment(o) {
  const base = siteUrl();
  const items = o.items.reduce((a, i) => a + i.qty, 0);
  const body = new URLSearchParams({
    store_id: process.env.SSLC_STORE_ID,
    store_passwd: process.env.SSLC_STORE_PASSWORD,
    total_amount: Number(o.total).toFixed(2),
    currency: "BDT",
    tran_id: o.orderId,
    success_url: `${base}/api/payment/success`,
    fail_url: `${base}/api/payment/fail`,
    cancel_url: `${base}/api/payment/cancel`,
    ipn_url: `${base}/api/payment/ipn`,
    shipping_method: "Courier",
    product_name: o.items.map((i) => i.name).join(", ").slice(0, 200),
    product_category: "Clothing",
    product_profile: "physical-goods",
    num_of_item: String(items),
    cus_name: o.name, cus_email: o.email, cus_phone: o.phone,
    cus_add1: o.address, cus_city: o.district, cus_postcode: "0000", cus_country: "Bangladesh",
    ship_name: o.name, ship_add1: o.address, ship_city: o.district, ship_postcode: "0000", ship_country: "Bangladesh",
  });
  const r = await fetch(`${host()}/gwprocess/v4/api.php`, { method: "POST", body, cache: "no-store" });
  const d = await r.json().catch(() => ({}));
  if (d.status !== "SUCCESS" || !d.GatewayPageURL) throw new Error(d.failedreason || "SSLCommerz did not start the payment");
  return d.GatewayPageURL;
}

// Step 2: after the customer pays, never trust the browser. Ask SSLCommerz directly if the payment is real.
async function validate(valId) {
  const q = new URLSearchParams({ val_id: valId, store_id: process.env.SSLC_STORE_ID, store_passwd: process.env.SSLC_STORE_PASSWORD, v: "1", format: "json" });
  const r = await fetch(`${host()}/validator/api/validationserverAPI.php?${q}`, { cache: "no-store" });
  return r.json().catch(() => ({}));
}

// Used by both the success redirect and the IPN call. Safe to run twice: emails and the "Paid" flag happen only once.
export async function settlePayment(fields) {
  const tranId = String(fields.tran_id || "");
  const valId = String(fields.val_id || "");
  if (!tranId || !valId) return { ok: false, orderId: tranId };
  await connectDB();
  const o = await Order.findOne({ orderId: tranId, paymentMethod: "Online" });
  if (!o) return { ok: false, orderId: tranId };
  if (o.paymentStatus === "Paid") return { ok: true, orderId: tranId };

  const v = await validate(valId);
  const good = ["VALID", "VALIDATED"].includes(v.status) && v.tran_id === o.orderId && v.currency_type === "BDT" && Math.abs(Number(v.amount) - o.total) < 0.01;
  if (!good) { console.error("Payment validation failed for", tranId, v.status); return { ok: false, orderId: tranId }; }

  const paid = await Order.findOneAndUpdate({ orderId: tranId, paymentStatus: "Unpaid" }, { paymentStatus: "Paid", paymentRef: String(v.bank_tran_id || valId), paymentVia: String(v.card_type || "") }, { new: true });
  if (paid) {
    const [c, a] = await Promise.allSettled([sendCustomerEmail(paid), sendAdminEmail(paid)]);
    [c, a].forEach((x) => x.status === "rejected" && console.error("Email error:", x.reason?.message));
    if (c.status === "fulfilled" && c.value) await Order.updateOne({ _id: paid._id }, { emailSent: true });
  }
  return { ok: true, orderId: tranId };
}

// Payment failed or the customer cancelled: free the reserved stock (only once) and cancel the order.
export async function abandonPayment(tranId) {
  tranId = String(tranId || "");
  if (!tranId) return;
  await connectDB();
  const o = await Order.findOneAndUpdate({ orderId: tranId, paymentMethod: "Online", paymentStatus: "Unpaid", status: "Pending", stockRestored: false }, { status: "Cancelled", stockRestored: true }, { new: true });
  if (!o) return;
  for (const i of o.items) await Product.updateOne({ slug: i.slug, variants: { $elemMatch: { color: i.color, size: i.size } } }, { $inc: { "variants.$.stock": i.qty } });
}
