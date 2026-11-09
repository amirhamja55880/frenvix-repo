import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Settings from "@/models/Settings";
import { SITE } from "@/lib/products";

const plain = (d) => JSON.parse(JSON.stringify(d));
const DEFAULTS = {
  phone: SITE.phone,
  email: SITE.email,
  homeDistrict: "Khulna",
  deliveryInsideKhulna: 60,
  deliveryOutsideKhulna: 120,
};

export async function getSettings() {
  await connectDB();
  const s = (await Settings.findOne({ key: "main" }).lean()) || {};
  const out = {};
  for (const k of Object.keys(DEFAULTS)) out[k] = s[k] ?? DEFAULTS[k];
  return out;
}

export async function getCategories() {
  await connectDB();
  return plain(
    await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean(),
  );
}

export async function getProducts({ cat, sub, sort } = {}) {
  await connectDB();
  const q = { isActive: true };
  if (cat) q.category = cat;
  if (sub) q.subCategory = sub;
  const order =
    sort === "low"
      ? { price: 1 }
      : sort === "high"
        ? { price: -1 }
        : { createdAt: -1 };
  return plain(await Product.find(q).sort(order).lean());
}

export async function getProduct(slug) {
  await connectDB();
  const p = await Product.findOne({ slug, isActive: true }).lean();
  return p ? plain(p) : null;
}

// Light data for header menu, footer and category counts
export async function getMenu() {
  await connectDB();
  const [categories, products] = await Promise.all([
    Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select("name slug subs")
      .lean(),
    Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select("slug name category subCategory")
      .lean(),
  ]);
  return plain({ categories, products });
}
