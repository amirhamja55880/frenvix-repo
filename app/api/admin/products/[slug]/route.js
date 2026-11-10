import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { adminGuard } from "@/lib/guard";
import { refreshSite } from "@/lib/revalidate";
import { parseProduct } from "@/lib/adminProduct";

export const runtime = "nodejs";
const err = (error, status = 400) => NextResponse.json({ error }, { status });

export async function PUT(req, { params }) {
  const denied = await adminGuard(req);
  if (denied) return denied;
  try {
    await connectDB();
    const { data, error } = parseProduct(await req.json().catch(() => null), await Category.find().lean(), { creating: false });
    if (error) return err(error);
    const { oldPrice, slug, ...rest } = data; // the slug never changes after creation
    const update = { $set: { ...rest, ...(oldPrice ? { oldPrice } : {}) }, ...(oldPrice ? {} : { $unset: { oldPrice: 1 } }) };
    const r = await Product.updateOne({ slug: params.slug }, update);
    if (!r.matchedCount) return err("Product not found", 404);
    refreshSite("products");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Update product error:", e.message);
    return err("Could not save the product", 500);
  }
}

export async function DELETE(req, { params }) {
  const denied = await adminGuard(req);
  if (denied) return denied;
  await connectDB();
  await Product.deleteOne({ slug: params.slug });
  refreshSite("products");
  return NextResponse.json({ ok: true });
}
