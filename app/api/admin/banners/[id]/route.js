import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Banner from "@/models/Banner";
import { adminGuard } from "@/lib/guard";
import { refreshSite } from "@/lib/revalidate";
import { parseBanner } from "../route";

export const runtime = "nodejs";
const err = (error, status = 400) => NextResponse.json({ error }, { status });

export async function PUT(req, { params }) {
  const denied = await adminGuard(req);
  if (denied) return denied;
  if (!mongoose.isValidObjectId(params.id)) return err("Banner not found", 404);
  const { data, error } = parseBanner(await req.json().catch(() => null));
  if (error) return err(error);
  await connectDB();
  const r = await Banner.updateOne({ _id: params.id }, { $set: data });
  if (!r.matchedCount) return err("Banner not found", 404);
  refreshSite("banners");
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const denied = await adminGuard(req);
  if (denied) return denied;
  if (!mongoose.isValidObjectId(params.id)) return err("Banner not found", 404);
  await connectDB();
  await Banner.deleteOne({ _id: params.id });
  refreshSite("banners");
  return NextResponse.json({ ok: true });
}
