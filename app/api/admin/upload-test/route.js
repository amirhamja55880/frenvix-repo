import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminGuard } from "@/lib/guard";

export const runtime = "nodejs";
const GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // 1x1 test picture

// Admin-only check: uploads a tiny test picture to Cloudinary and tests that it can be shown on the website.
export async function POST(req) {
  const denied = await adminGuard(req);
  if (denied) return denied;
  const cloud = process.env.CLOUDINARY_CLOUD_NAME, key = process.env.CLOUDINARY_API_KEY, secret = process.env.CLOUDINARY_API_SECRET;
  const missing = [["CLOUDINARY_CLOUD_NAME", cloud], ["CLOUDINARY_API_KEY", key], ["CLOUDINARY_API_SECRET", secret]].filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) return NextResponse.json({ ok: false, step: "settings", message: `Missing in .env.local (or the server was not restarted): ${missing.join(", ")}` });
  try {
    const timestamp = Math.floor(Date.now() / 1000), folder = "frenvix/test";
    const signature = crypto.createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest("hex");
    const fd = new FormData();
    fd.append("file", GIF); fd.append("api_key", key); fd.append("timestamp", String(timestamp)); fd.append("folder", folder); fd.append("signature", signature);
    const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body: fd });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return NextResponse.json({ ok: false, step: "upload", message: d.error?.message || `Cloudinary answered with HTTP ${r.status}` });
    const status = async (u) => { try { const x = await fetch(u); await x.arrayBuffer(); return x.status; } catch { return 0; } };
    const [rawStatus, resizedStatus] = await Promise.all([status(d.secure_url), status(d.secure_url.replace("/upload/", "/upload/f_auto,q_auto,c_limit,w_900/"))]);
    return NextResponse.json({ ok: true, rawStatus, resizedStatus });
  } catch (e) {
    return NextResponse.json({ ok: false, step: "network", message: "Could not reach Cloudinary from this computer: " + e.message });
  }
}
