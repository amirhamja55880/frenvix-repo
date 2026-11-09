import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { limited, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req) {
  if (limited("track:" + clientIp(req), 20, 10 * 60 * 1000)) return NextResponse.json({ error: "Too many attempts, try again later" }, { status: 429 });
  const b = await req.json().catch(() => null);
  const id = String(b?.id || "").trim().toUpperCase().slice(0, 20);
  const phone = String(b?.phone || "").trim().slice(0, 11);
  try {
    await connectDB();
    const o = await Order.findOne({ orderId: id, phone }).lean();
    if (!o) return NextResponse.json({ error: "No order found. Check the order number and phone number." }, { status: 404 });
    return NextResponse.json({ status: o.status, total: o.total, itemCount: o.items.reduce((a, i) => a + i.qty, 0), createdAt: o.createdAt });
  } catch (e) {
    console.error("Track error:", e.message);
    return NextResponse.json({ error: "Something went wrong, please try again" }, { status: 500 });
  }
}
