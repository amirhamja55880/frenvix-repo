import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Banner from "@/models/Banner";
import { adminGuard } from "@/lib/guard";
import { refreshSite } from "@/lib/revalidate";

export const runtime = "nodejs";
const text = (v, n) => String(v ?? "").trim().slice(0, n);

// Shared by create and update
export function parseBanner(b) {
  const image = text(b?.image, 500), mobileImage = text(b?.mobileImage, 500), link = text(b?.link, 300), alt = text(b?.alt, 120);
  if (!/^https:\/\/\S+$/.test(image)) return { error: "A banner needs an image" };
  if (mobileImage && !/^https:\/\/\S+$/.test(mobileImage)) return { error: "The phone image link must start with https://" };
  if (link && !(/^\/(?!\/)\S*$/.test(link) || /^https:\/\/\S+$/.test(link))) return { error: "The link must be a page like /shop, or a full https:// address" };
  const sortOrder = Number.isFinite(Number(b?.sortOrder)) ? Number(b.sortOrder) : 0;
  return { data: { image, mobileImage, link, alt, sortOrder, isActive: b?.isActive !== false } };
}

export async function POST(req) {
  const denied = await adminGuard(req);
  if (denied) return denied;
  const body = await req.json().catch(() => null);
  const { data, error } = parseBanner(body);
  if (error) return NextResponse.json({ error }, { status: 400 });
  await connectDB();
  if (body?.sortOrder === undefined) data.sortOrder = (await Banner.countDocuments()) + 1;
  const b = await Banner.create(data);
  refreshSite("banners");
  return NextResponse.json({ banner: { id: String(b._id), ...data } });
}
