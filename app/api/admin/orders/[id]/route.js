import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getAdmin, sameOrigin } from "@/lib/auth";
import { STATUSES } from "@/lib/admin";
import { sendStatusEmail } from "@/lib/email";

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
      if (!["Unpaid", "Paid"].includes(b.paymentStatus)) return err("Invalid payment status");
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
