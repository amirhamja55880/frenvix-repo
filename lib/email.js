import nodemailer from "nodemailer";
import { SITE, taka } from "@/lib/products";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function transport() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  const auth = { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS };
  // Own domain email (cPanel): set SMTP_HOST (e.g. mail.yourdomain.com) and SMTP_PORT (465). Otherwise Gmail is used.
  if (process.env.SMTP_HOST) { const port = Number(process.env.SMTP_PORT || 465); return nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth }); }
  return nodemailer.createTransport({ service: "gmail", auth });
}

const addr = (o) => [o.address, o.thana, o.district, o.division].filter(Boolean).map(esc).join(", ");
const payLabel = (o) => (o.paymentMethod === "COD" ? "Cash on delivery" : o.paymentMethod === "Online" ? `Paid online (${o.paymentStatus === "Paid" ? "payment received" : "awaiting payment"})` : o.trxId ? `${esc(o.paymentMethod)}: TrxID ${esc(o.trxId)}, sent from ${esc(o.payNumber)} (${o.paymentStatus === "Paid" ? "payment verified" : "we will verify it shortly"})` : `${esc(o.paymentMethod)} (our representative will confirm payment details)`);
const trackUrl = (id) => `${siteUrl()}/track?id=${encodeURIComponent(id)}`;

const rows = (o) => o.items.map((i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${esc(i.name)}<br><span style="color:#777;font-size:13px">${esc(i.color)} / ${esc(i.size)} × ${i.qty}</span></td><td align="right" style="padding:8px 0;border-bottom:1px solid #eee">${taka(i.price * i.qty)}</td></tr>`).join("");

// Live address: NEXT_PUBLIC_SITE_URL if set, otherwise the address Vercel provides automatically
const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")).replace(/\/$/, "");
// The logo shows in emails only on the live https site and needs /logo.png in the public folder
const brand = () => (siteUrl().startsWith("https://") ? `<img src="${siteUrl()}/logo.png" alt="${SITE.name}" height="32" style="display:block;height:32px;width:auto">` : SITE.name);

const shell = (inner) => `<div style="background:#f3f3f1;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#111"><div style="max-width:540px;margin:0 auto;background:#fff;padding:28px;border-radius:6px"><div style="font-weight:800;letter-spacing:.14em;font-size:20px;margin-bottom:20px">${brand()}</div>${inner}<p style="color:#777;font-size:12px;margin-top:28px">${SITE.name} · ${esc(SITE.phone)} · ${esc(SITE.email)}</p></div></div>`;

const totals = (o) => `<table width="100%" cellspacing="0" style="font-size:14px">${rows(o)}
      <tr><td style="padding:8px 0">Delivery</td><td align="right">${taka(o.deliveryFee)}</td></tr>
      <tr><td style="padding:8px 0"><b>Total</b></td><td align="right"><b>${taka(o.total)}</b></td></tr></table>`;

export async function sendCustomerEmail(o) {
  const t = transport();
  if (!t) return false;
  const html = shell(`
    <h2 style="margin:0 0 12px">Thank you, ${esc(o.name)}</h2>
    <p style="margin:0 0 12px">Your order is <b style="background:#fff1c2;padding:2px 8px;border-radius:99px">Pending</b>.</p>
    <div style="background:#f3f3f1;border:1px dashed #999;border-radius:6px;padding:14px;text-align:center;margin:0 0 16px"><div style="font-size:12px;color:#666">Your order ID (tap and hold to copy) · অর্ডার আইডি কপি করতে চেপে ধরে রাখুন</div><div style="font-family:Consolas,Menlo,monospace;font-size:24px;font-weight:700;letter-spacing:.08em;user-select:all;-webkit-user-select:all">${esc(o.orderId)}</div></div>
    <p style="margin:0 0 6px">One of our representatives will contact you shortly.</p>
    <p style="margin:0 0 18px;color:#444">আপনার অর্ডারটি পেন্ডিং আছে। আমাদের একজন প্রতিনিধি কিছুক্ষণের মধ্যে আপনার সাথে যোগাযোগ করবেন।</p>
    ${totals(o)}
    <p style="font-size:14px;margin-top:18px"><b>Delivery address</b><br>${addr(o)}</p>
    <p style="font-size:14px"><b>Payment</b><br>${payLabel(o)}</p>
    <p style="margin-top:20px"><a href="${trackUrl(o.orderId)}" style="display:inline-block;background:#111;color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:600">Track your order</a></p>`);
  await t.sendMail({ from: `"${SITE.name}" <${process.env.SMTP_USER}>`, to: o.email, subject: `Order ${o.orderId} received (Pending)`, html });
  return true;
}

export async function sendAdminEmail(o) {
  const t = transport();
  if (!t) return false;
  const html = shell(`
    <h2 style="margin:0 0 12px">New order ${esc(o.orderId)}</h2>
    <p style="margin:0 0 14px;font-size:14px"><b>${esc(o.name)}</b><br>${esc(o.phone)} · ${esc(o.email)}<br>${addr(o)}${o.note ? `<br><i>Note: ${esc(o.note)}</i>` : ""}</p>
    ${totals(o)}
    <p style="font-size:14px;margin-top:16px"><b>Payment:</b> ${payLabel(o)}</p>
    <p style="font-size:14px">Call the customer to confirm this order.</p>`);
  await t.sendMail({ from: `"${SITE.name} Orders" <${process.env.SMTP_USER}>`, to: process.env.ADMIN_EMAIL || process.env.SMTP_USER, subject: `New order ${o.orderId} · ${taka(o.total)}`, html });
  return true;
}

const STATUS_TEXT = {
  Pending: ["Your order is pending.", "আপনার অর্ডারটি পেন্ডিং আছে।"],
  Confirmed: ["Your order has been confirmed and is being prepared for delivery.", "আপনার অর্ডারটি নিশ্চিত করা হয়েছে এবং ডেলিভারির জন্য প্রস্তুত করা হচ্ছে।"],
  Shipped: ["Your order is on its way. Our courier will contact you soon.", "আপনার অর্ডারটি পাঠানো হয়েছে। কুরিয়ার শীঘ্রই আপনার সাথে যোগাযোগ করবে।"],
  Delivered: ["Your order has been delivered. Thank you for shopping with us.", "আপনার অর্ডারটি ডেলিভারি হয়েছে। কেনাকাটার জন্য ধন্যবাদ।"],
  Cancelled: [`Your order has been cancelled. If this is a mistake, please call us on ${SITE.phone}.`, "আপনার অর্ডারটি বাতিল করা হয়েছে। ভুল হয়ে থাকলে আমাদের সাথে যোগাযোগ করুন।"],
};

export async function sendStatusEmail(o) {
  const t = transport();
  if (!t) return false;
  const [en, bn] = STATUS_TEXT[o.status] || STATUS_TEXT.Pending;
  const html = shell(`
    <h2 style="margin:0 0 12px">Order update</h2>
    <p style="margin:0 0 10px">Order <b style="font-family:Consolas,Menlo,monospace">${esc(o.orderId)}</b> is now <b style="background:#eef;padding:2px 8px;border-radius:99px">${esc(o.status)}</b></p>
    <p style="margin:0 0 6px">${esc(en)}</p><p style="margin:0 0 18px;color:#444">${esc(bn)}</p>
    <p><a href="${trackUrl(o.orderId)}" style="display:inline-block;background:#111;color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:600">Track your order</a></p>`);
  await t.sendMail({ from: `"${SITE.name}" <${process.env.SMTP_USER}>`, to: o.email, subject: `Order ${o.orderId} is now ${o.status}`, html });
  return true;
}

// ---- Contact form ----
export async function sendContactEmail(m) {
  const t = transport();
  if (!t) return false;
  const html = shell(`
    <h2 style="margin:0 0 12px">New message from ${esc(m.name)}</h2>
    <p style="margin:0 0 14px;font-size:14px"><b>Topic:</b> ${esc(m.subject)}${m.orderId ? `<br><b>Order ID:</b> ${esc(m.orderId)}` : ""}<br><b>Phone:</b> ${esc(m.phone || "not given")}<br><b>Email:</b> ${esc(m.email || "not given")}</p>
    <div style="background:#f3f3f1;border-radius:6px;padding:14px;font-size:15px;white-space:pre-wrap">${esc(m.message)}</div>
    <p style="font-size:14px;margin-top:16px">${m.email ? "Reply to this email to answer the customer." : "The customer gave no email. Please call them."}</p>`);
  await t.sendMail({ from: `"${SITE.name} Website" <${process.env.SMTP_USER}>`, to: process.env.ADMIN_EMAIL || process.env.SMTP_USER, replyTo: m.email || undefined, subject: `Message: ${m.subject} · ${m.name}`, html });
  return true;
}

export async function sendContactReceipt(m) {
  const t = transport();
  if (!t || !m.email) return false;
  const html = shell(`
    <h2 style="margin:0 0 12px">Thank you, ${esc(m.name)}</h2>
    <p style="margin:0 0 8px">We have received your message and will reply within one working day.</p>
    <p style="margin:0 0 18px;color:#444">আপনার বার্তা আমরা পেয়েছি। একটি কর্মদিবসের মধ্যে আপনার সাথে যোগাযোগ করব।</p>
    <div style="background:#f3f3f1;border-radius:6px;padding:14px;font-size:14px;white-space:pre-wrap">${esc(m.message)}</div>`);
  await t.sendMail({ from: `"${SITE.name}" <${process.env.SMTP_USER}>`, to: m.email, subject: "We received your message", html });
  return true;
}
