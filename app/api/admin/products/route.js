import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { adminGuard } from "@/lib/guard";
import { refreshSite } from "@/lib/revalidate";
import { parseProduct } from "@/lib/adminProduct";

export const runtime = "nodejs";
const err = (error, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req) {
  const denied = await adminGuard(req);
  if (denied) return denied;
  try {
    await connectDB();
    const { data, error } = parseProduct(await req.json().catch(() => null), await Category.find().lean(), { creating: true });
    if (error) return err(error);
    await Product.create(data);
    refreshSite("products");
    return NextResponse.json({ slug: data.slug });
  } catch (e) {
    if (e.code === 11000) return err("A product with this slug already exists");
    console.error("Create product error:", e.message);
    return err("Could not save the product", 500);
  }
}
