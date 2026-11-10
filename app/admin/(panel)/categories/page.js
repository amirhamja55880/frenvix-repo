import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import CategoryManager from "./CategoryManager";

export default async function Categories() {
  await connectDB();
  const [cats, counts] = await Promise.all([Category.find().sort({ sortOrder: 1, name: 1 }).lean(), Product.aggregate([{ $group: { _id: "$category", n: { $sum: 1 } } }])]);
  const n = Object.fromEntries(counts.map((c) => [c._id, c.n]));
  const initial = cats.map((c) => ({
    slug: c.slug, name: c.name, sortOrder: c.sortOrder, isActive: c.isActive, products: n[c.name] || 0,
    subs: c.subs.map((s) => ({ name: s, orig: s, visible: !(c.hiddenSubs || []).includes(s) })),
  }));
  return <><h1>Categories</h1><p className="muted" style={{ marginTop: -10, marginBottom: 18 }}>Hiding or removing a category or sub category also hides its products on the website. The products are never deleted, and they return when you show the category again.</p><CategoryManager initial={initial} /></>;
}
