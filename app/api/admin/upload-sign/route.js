import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminGuard } from "@/lib/guard";

export const runtime = "nodejs";

// Gives the browser a short-lived signature so it can upload an image straight to Cloudinary.
export async function POST(req) {
  const denied = await adminGuard(req);
  if (denied) return denied;
  const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: secret } = process.env;
  if (!cloudName || !apiKey || !secret) return NextResponse.json({ error: "Cloudinary is not set up. Add the 3 CLOUDINARY_ values to .env.local and restart." }, { status: 500 });
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "frenvix/products";
  const signature = crypto.createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest("hex");
  return NextResponse.json({ cloudName, apiKey, timestamp, folder, signature });
}
