import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getAdmin, sameOrigin } from "@/lib/auth";
import { STATUSES } from "@/lib/admin";
import { sendStatusEmail } from "@/lib/email";
import Admin from "@/models/Admin";
import Settings from "@/models/Settings";
import bcrypt from "bcryptjs";
import { limited, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
const err = (error, status = 400) => NextResponse.json({ error }, { status });

export async function PATCH(req, { params }) {
  if (!(await getAdmin())) return err("Unauthorized", 401);
  if (!sameOrigin(req)) return err("Forbidden", 403);
  const b = await req.json().catch(() => null);
  if (!b) return err("Invalid request");
  try {
    await connectDB();
    const o = await Order.findOne({ orderId: params.id });
    if (!o) return err("Order not found", 404);

    let changed = false;
    if (b.status !== undefined) {
      if (!STATUSES.includes(b.status)) return err("Invalid status");
      if (o.status === "Cancelled" && b.status !== "Cancelled") return err("A cancelled order cannot be changed");
      if (b.status !== o.status) {
        if (b.status === "Cancelled" && !o.stockRestored) {
          for (const i of o.items) await Product.updateOne({ slug: i.slug, variants: { $elemMatch: { color: i.color, size: i.size } } }, { $inc: { "variants.$.stock": i.qty } });
          o.stockRestored = true; // stock goes back only once
        }
        o.status = b.status; changed = true;
      }
    }
    if (b.paymentStatus !== undefined) {
      if (!["Unpaid", "Verifying", "Paid"].includes(b.paymentStatus)) return err("Invalid payment status");
      o.paymentStatus = b.paymentStatus;
    }
    await o.save();

    let emailed = false;
    if (changed && b.notify !== false) { try { emailed = await sendStatusEmail(o); } catch (e) { console.error("Status email failed:", e.message); } }
    return NextResponse.json({ status: o.status, paymentStatus: o.paymentStatus, emailed });
  } catch (e) {
    console.error("Order update error:", e.message);
    return err("Could not update the order", 500);
  }
}

// Permanent delete. Works only when switched on in Settings, and always asks for the admin password.
export async function DELETE(req, { params }) {
  const me = await getAdmin();
  if (!me) return err("Unauthorized", 401);
  if (!sameOrigin(req)) return err("Forbidden", 403);
  if (limited("orderdelete:" + clientIp(req), 6, 10 * 60 * 1000)) return err("Too many attempts. Try again in a few minutes.", 429);
  const b = await req.json().catch(() => null);
  try {
    await connectDB();
    const st = await Settings.findOne({ key: "main" }).select("allowOrderDelete").lean();
    if (!st?.allowOrderDelete) return err("Deleting orders is switched off. Turn it on in Settings first.", 403);
    const admin = await Admin.findById(me.sub);
    const ok = admin && (await bcrypt.compare(String(b?.password || "").slice(0, 200), admin.passwordHash));
    if (!ok) return err("Wrong password", 401);
    const o = await Order.findOne({ orderId: params.id });
    if (!o) return err("Order not found", 404);
    if (b?.returnStock === true && !o.stockRestored) {
      for (const i of o.items) await Product.updateOne({ slug: i.slug, variants: { $elemMatch: { color: i.color, size: i.size } } }, { $inc: { "variants.$.stock": i.qty } });
    }
    await Order.deleteOne({ _id: o._id });
    console.log(`Order ${o.orderId} deleted by ${me.email}${b?.returnStock === true && !o.stockRestored ? " (stock returned)" : ""}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Order delete error:", e.message);
    return err("Could not delete the order", 500);
  }
}
