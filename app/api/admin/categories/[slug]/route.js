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
  const { data, renames, error } = parseCategory(await req.json().catch(() => null));
  if (error) return err(error);
  try {
    await connectDB();
    const old = await Category.findOne({ slug: params.slug });
    if (!old) return err("Category not found", 404);
    if (await Category.findOne({ name: data.name, _id: { $ne: old._id } })) return err("A category with this name already exists");
    // Renamed sub categories and a renamed category take their products with them.
    for (const [from, to] of Object.entries(renames)) {
      if (old.subs.includes(from)) await Product.updateMany({ category: old.name, subCategory: from }, { $set: { subCategory: to } });
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

// Removing a category does not delete its products. They become hidden on the website.
export async function DELETE(req, { params }) {
  const denied = await adminGuard(req);
  if (denied) return denied;
  await connectDB();
  const old = await Category.findOne({ slug: params.slug });
  if (!old) return err("Category not found", 404);
  const hidden = await Product.countDocuments({ category: old.name });
  await old.deleteOne();
  refreshSite("categories", "products");
  return NextResponse.json({ ok: true, hidden });
}
