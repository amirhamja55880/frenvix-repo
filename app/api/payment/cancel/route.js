import { NextResponse } from "next/server";
import { abandonPayment } from "@/lib/sslcommerz";
import { siteUrl } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const f = Object.fromEntries(await req.formData());
  try { await abandonPayment(f.tran_id); } catch (e) { console.error("Payment cancel error:", e.message); }
  return NextResponse.redirect(siteUrl() + "/checkout/payment?status=cancel", 303);
}
