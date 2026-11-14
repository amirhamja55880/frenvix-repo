import { NextResponse } from "next/server";
import { settlePayment, abandonPayment } from "@/lib/sslcommerz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// SSLCommerz also calls this server-to-server, so the order is marked Paid even if the customer closes the browser.
export async function POST(req) {
  const f = Object.fromEntries(await req.formData());
  try {
    if (["VALID", "VALIDATED"].includes(f.status)) await settlePayment(f);
    else if (["FAILED", "CANCELLED", "EXPIRED"].includes(f.status)) await abandonPayment(f.tran_id);
  } catch (e) { console.error("IPN error:", e.message); return NextResponse.json({ ok: false }, { status: 500 }); }
  return NextResponse.json({ ok: true });
}
