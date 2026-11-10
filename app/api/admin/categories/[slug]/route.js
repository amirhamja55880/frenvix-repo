import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { adminGuard } from "@/lib/guard";
import { refreshSite } from "@/lib/revalidate";
import { parseCategory } from "@/lib/adminProduct";

export const runtime = "nodejs";
const err = (error, status = 400) => NextResponse.json({ error }, { status });

export async function PUT(req, { params }) {
  const denied = await adminGuard(req);
  if (denied) return denied;
  const { data, error } = parseCategory(await req.json().catch(() => null));
  if (error) return err(error);
  try {
    await connectDB();
    const old = await Category.findOne({ slug: params.slug });
    if (!old) return err("Category not found", 404);
    if (await Category.findOne({ name: data.name, _id: { $ne: old._id } })) return err("A category with this name already exists");
    const removed = old.subs.filter((s) => !data.subs.includes(s));
    if (removed.length) {
      const n = await Product.countDocuments({ category: old.name, subCategory: { $in: removed } });
      if (n) return err(`You removed a sub category that ${n} product(s) still use. Change those products first.`);
    }
    if (data.name !== old.name) await Product.updateMany({ category: old.name }, { $set: { category: data.name } });
    Object.assign(old, data);
    await old.save();
    refreshSite("categories", "products");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Update category error:", e.message);
    return err("Could not save the category", 500);
  }
}

export async function DELETE(req, { params }) {
  const denied = await adminGuard(req);
  if (denied) return denied;
  await connectDB();
  const old = await Category.findOne({ slug: params.slug });
  if (!old) return err("Category not found", 404);
  const n = await Product.countDocuments({ category: old.name });
  if (n) return err(`This category has ${n} product(s). Move or delete them first.`);
  await old.deleteOne();
  refreshSite("categories");
  return NextResponse.json({ ok: true });
}
