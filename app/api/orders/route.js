import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { visibleQuery } from "@/lib/visibility";
import { getSettings } from "@/lib/data";
import { PAYMENT_METHODS } from "@/lib/products";
import { DIVISIONS } from "@/lib/bd-geo";
import { sendCustomerEmail, sendAdminEmail } from "@/lib/email";
import { limited, clientIp } from "@/lib/rateLimit";
import { sslcReady, startPayment } from "@/lib/sslcommerz";

export const runtime = "nodejs";

const clean = (s, n) => String(s ?? "").replace(/[<>]/g, "").trim().slice(0, n);
const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const newId = () => "FRX-" + Array.from(crypto.randomBytes(6), (b) => ALPHA[b % ALPHA.length]).join("");
const fail = (error, status = 400) => NextResponse.json({ error }, { status });
const byVariant = (i) => ({ slug: i.slug, variants: { $elemMatch: { color: i.color, size: i.size } } });
const giveBack = async (done) => { for (const i of done) await Product.updateOne(byVariant(i), { $inc: { "variants.$.stock": i.qty } }); };

const toClient = (d) => ({
  id: d.orderId, name: d.name, phone: d.phone, email: d.email, division: d.division, district: d.district, thana: d.thana,
  address: d.address, note: d.note, items: d.items, subtotal: d.subtotal, fee: d.deliveryFee, total: d.total,
  paymentMethod: d.paymentMethod, paymentStatus: d.paymentStatus, trxId: d.trxId, payNumber: d.payNumber, status: d.status, createdAt: d.createdAt,
});

export async function POST(req) {
  if (limited("order:" + clientIp(req), 5, 10 * 60 * 1000)) return fail("Too many orders, please wait a few minutes", 429);
  const b = await req.json().catch(() => null);
  if (!b || b.website) return fail("Invalid request");

  const d = { name: clean(b.name, 80), phone: clean(b.phone, 11), email: clean(b.email, 120).toLowerCase(), division: clean(b.division, 30), district: clean(b.district, 30), thana: clean(b.thana, 60), address: clean(b.address, 250), note: clean(b.note, 250) };
  if (d.name.length < 3) return fail("Enter your full name");
  if (!/^01[3-9]\d{8}$/.test(d.phone)) return fail("Enter a valid mobile number");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) return fail("Enter a valid email address");
  if (!DIVISIONS[d.division] || !DIVISIONS[d.division].includes(d.district)) return fail("Choose a valid division and district");
  if (d.thana.length < 2) return fail("Enter your thana");
  if (d.address.length < 10) return fail("Enter your full address");
  const paymentMethod = String(b.paymentMethod || "COD");
  if (!PAYMENT_METHODS.some((m) => m.id === paymentMethod)) return fail("Choose a valid payment method");
  const manual = Boolean(PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.manual);
  const payNumber = clean(b.payNumber, 12).replace(/\s/g, ""), trxId = clean(b.trxId, 20).toUpperCase().replace(/\s/g, "");
  if (manual) {
    if (!/^01[3-9]\d{8}\d?$/.test(payNumber)) return fail("Enter the mobile number you sent the money from");
    if (!/^[A-Z0-9]{6,20}$/.test(trxId)) return fail("Enter a valid Transaction ID (TrxID) from your payment message");
  }
  if (paymentMethod === "Online" && !sslcReady()) return fail("Online payment is not available right now. Please choose cash on delivery");
  if (!Array.isArray(b.items) || !b.items.length || b.items.length > 20) return fail("Your cart is empty");

  const reserved = [];
  try {
    await connectDB();
    const settings = await getSettings();
    if (manual) {
      if (!settings[paymentMethod.toLowerCase() + "Number"]) return fail(`${paymentMethod} payment is not available right now. Please choose another method`);
      if (await Order.exists({ trxId, status: { $ne: "Cancelled" } })) return fail("This Transaction ID has already been used for another order");
    }

    // Prices and stock always come from the database, never from the browser.
    const found = await Product.find(await visibleQuery({ slug: { $in: b.items.map((i) => String(i?.slug)) } })).lean();
    const bySlug = Object.fromEntries(found.map((p) => [p.slug, p]));
    const items = [];
    for (const i of b.items) {
      const p = bySlug[i?.slug];
      const qty = Number(i?.qty);
      if (!p || !p.variants.some((v) => v.color === i.color && v.size === i.size) || !Number.isInteger(qty) || qty < 1 || qty > 10) return fail("A cart item is no longer available, please refresh your cart");
      items.push({ slug: p.slug, name: p.name, color: i.color, size: i.size, qty, price: p.price });
    }

    // Reserve stock item by item (atomic per item). Undo everything if one fails.
    for (const i of items) {
      const r = await Product.updateOne({ slug: i.slug, isActive: true, variants: { $elemMatch: { color: i.color, size: i.size, stock: { $gte: i.qty } } } }, { $inc: { "variants.$.stock": -i.qty } });
      if (r.modifiedCount !== 1) { await giveBack(reserved); return fail(`${i.name} (${i.color}, ${i.size}) is out of stock or has less quantity available`, 409); }
      reserved.push(i);
    }

    const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
    const fee = d.district === settings.homeDistrict ? settings.deliveryInsideKhulna : settings.deliveryOutsideKhulna;
    let doc = null;
    for (let t = 0; t < 5 && !doc; t++) {
      try { doc = await Order.create({ ...d, orderId: newId(), items, subtotal, deliveryFee: fee, total: subtotal + fee, paymentMethod, paymentStatus: manual ? "Verifying" : "Unpaid", ...(manual ? { payNumber, trxId } : {}) }); }
      catch (e) { if (e.code !== 11000) throw e; }
    }
    if (!doc) { await giveBack(reserved); return fail("Could not create order, please try again", 500); }

    // Online payment: send the customer to SSLCommerz. Emails go out only after the payment is confirmed.
    if (paymentMethod === "Online") {
      try {
        const gatewayUrl = await startPayment(doc);
        return NextResponse.json({ order: toClient(doc), gatewayUrl });
      } catch (e) {
        console.error("Payment start error:", e.message);
        await Order.deleteOne({ _id: doc._id });
        await giveBack(reserved);
        return fail("Could not start online payment. Please try again or choose cash on delivery", 502);
      }
    }

    // The order is already saved. A failed email must never fail the order.
    const [c, a] = await Promise.allSettled([sendCustomerEmail(doc), sendAdminEmail(doc)]);
    [c, a].forEach((r) => r.status === "rejected" && console.error("Email error:", r.reason?.message));
    if (c.status === "fulfilled" && c.value) await Order.updateOne({ _id: doc._id }, { emailSent: true });

    return NextResponse.json({ order: toClient(doc) });
  } catch (e) {
    console.error("Order error:", e.message);
    try { await giveBack(reserved); } catch {}
    return fail("Something went wrong, please try again", 500);
  }
}
