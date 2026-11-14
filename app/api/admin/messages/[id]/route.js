import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { adminGuard } from "@/lib/guard";

export const runtime = "nodejs";
const err = (error, status = 400) => NextResponse.json({ error }, { status });

export async function PATCH(req, { params }) {
  const denied = await adminGuard(req);
  if (denied) return denied;
  const b = await req.json().catch(() => null);
  if (!mongoose.isValidObjectId(params.id) || !["New", "Done"].includes(b?.status)) return err("Invalid request");
  await connectDB();
  const r = await Message.updateOne({ _id: params.id }, { $set: { status: b.status } });
  return r.matchedCount ? NextResponse.json({ ok: true }) : err("Message not found", 404);
}

export async function DELETE(req, { params }) {
  const denied = await adminGuard(req);
  if (denied) return denied;
  if (!mongoose.isValidObjectId(params.id)) return err("Message not found", 404);
  await connectDB();
  await Message.deleteOne({ _id: params.id });
  return NextResponse.json({ ok: true });
}
