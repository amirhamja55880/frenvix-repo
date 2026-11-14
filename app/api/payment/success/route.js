import { NextResponse } from "next/server";
import { settlePayment } from "@/lib/sslcommerz";
import { siteUrl } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// SSLCommerz sends the customer's browser here (POST) after a successful payment.
export async function POST(req) {
  const f = Object.fromEntries(await req.formData());
  let r = { ok: false, orderId: String(f.tran_id || "") };
  try { r = await settlePayment(f); } catch (e) { console.error("Payment success error:", e.message); }
  const to = r.ok ? `/order/${r.orderId}?paid=1` : "/checkout/payment?status=failed";
  return NextResponse.redirect(siteUrl() + to, 303);
}
