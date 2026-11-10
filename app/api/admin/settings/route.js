import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";
import { adminGuard } from "@/lib/guard";
import { refreshSite } from "@/lib/revalidate";
import { DIVISIONS } from "@/lib/bd-geo";

export const runtime = "nodejs";
const err = (error) => NextResponse.json({ error }, { status: 400 });

export async function PUT(req) {
  const denied = await adminGuard(req);
  if (denied) return denied;
  const b = await req.json().catch(() => null);
  const phone = String(b?.phone ?? "").trim().slice(0, 20);
  const email = String(b?.email ?? "").trim().slice(0, 120);
  const inside = Number(b?.deliveryInsideKhulna), outside = Number(b?.deliveryOutsideKhulna);
  if (!/^[0-9+\-\s]{5,20}$/.test(phone)) return err("Enter a valid phone number");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return err("Enter a valid email address");
  if (!Object.values(DIVISIONS).flat().includes(b?.homeDistrict)) return err("Choose a valid district");
  if (![inside, outside].every((n) => Number.isInteger(n) && n >= 0 && n <= 5000)) return err("Delivery charges must be whole numbers between 0 and 5000");
  await connectDB();
  await Settings.updateOne({ key: "main" }, { $set: { phone, email, homeDistrict: b.homeDistrict, deliveryInsideKhulna: inside, deliveryOutsideKhulna: outside } }, { upsert: true });
  refreshSite("settings");
  return NextResponse.json({ ok: true });
}
