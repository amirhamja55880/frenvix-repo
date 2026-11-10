import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { adminGuard } from "@/lib/guard";
import { refreshSite } from "@/lib/revalidate";
import { parseCategory, slugify } from "@/lib/adminProduct";

export const runtime = "nodejs";
const err = (error, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req) {
  const denied = await adminGuard(req);
  if (denied) return denied;
  const { data, error } = parseCategory(await req.json().catch(() => null));
  if (error) return err(error);
  const slug = slugify(data.name);
  if (!slug) return err("Use letters or numbers in the category name");
  try {
    await connectDB();
    await Category.create({ ...data, slug });
    refreshSite("categories");
    return NextResponse.json({ slug });
  } catch (e) {
    if (e.code === 11000) return err("A category with this name already exists");
    return err("Could not save the category", 500);
  }
}
