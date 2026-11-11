import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Settings from "@/models/Settings";
import { adminGuard } from "@/lib/guard";
import { refreshSite } from "@/lib/revalidate";
import { DIVISIONS } from "@/lib/bd-geo";

export const runtime = "nodejs";
const err = (error) => NextResponse.json({ error }, { status: 400 });
const text = (v, n) => String(v ?? "").trim().slice(0, n);

export async function PUT(req) {
  const denied = await adminGuard(req);
  if (denied) return denied;
  const b = await req.json().catch(() => null);
  const phone = text(b?.phone, 20), whatsapp = text(b?.whatsapp, 20), email = text(b?.email, 120);
  const address = text(b?.address, 200), hours = text(b?.hours, 100), facebook = text(b?.facebook, 200), instagram = text(b?.instagram, 200);
  const inside = Number(b?.deliveryInsideKhulna), outside = Number(b?.deliveryOutsideKhulna);
  if (!/^[0-9+\-\s]{5,20}$/.test(phone)) return err("Enter a valid phone number");
  if (whatsapp && !/^[0-9+\-\s]{5,20}$/.test(whatsapp)) return err("Enter a valid WhatsApp number or leave it empty");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return err("Enter a valid email address");
  for (const [name, url] of [["Facebook", facebook], ["Instagram", instagram]]) if (url && !/^https:\/\/\S+$/.test(url)) return err(`The ${name} link must start with https://`);
  if (!Object.values(DIVISIONS).flat().includes(b?.homeDistrict)) return err("Choose a valid district");
  if (![inside, outside].every((n) => Number.isInteger(n) && n >= 0 && n <= 5000)) return err("Delivery charges must be whole numbers between 0 and 5000");
  await connectDB();
  await Settings.updateOne({ key: "main" }, { $set: { phone, whatsapp, email, address, hours, facebook, instagram, homeDistrict: b.homeDistrict, deliveryInsideKhulna: inside, deliveryOutsideKhulna: outside } }, { upsert: true });
  refreshSite("settings");
  return NextResponse.json({ ok: true });
}
