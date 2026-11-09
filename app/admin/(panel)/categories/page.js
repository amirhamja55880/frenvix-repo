import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import CategoryManager from "./CategoryManager";

export default async function Categories() {
  await connectDB();
  const [cats, counts] = await Promise.all([Category.find().sort({ sortOrder: 1, name: 1 }).lean(), Product.aggregate([{ $group: { _id: "$category", n: { $sum: 1 } } }])]);
  const n = Object.fromEntries(counts.map((c) => [c._id, c.n]));
  const initial = cats.map((c) => ({ slug: c.slug, name: c.name, subs: c.subs, sortOrder: c.sortOrder, isActive: c.isActive, products: n[c.name] || 0 }));
  return <><h1>Categories</h1><CategoryManager initial={initial} /></>;
}
