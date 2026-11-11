import { unstable_cache as cache } from "next/cache";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Settings from "@/models/Settings";
import { visibleQuery } from "@/lib/visibility";
import { SITE } from "@/lib/products";

// Results are cached for 60 seconds (and cleared at once when the admin saves a change),
// so most visitors never wait for the database.
const TTL = 60;
const plain = (d) => JSON.parse(JSON.stringify(d));
const DEFAULTS = { phone: SITE.phone, whatsapp: "", email: SITE.email, address: "", hours: "", facebook: "", instagram: "", homeDistrict: "Khulna", deliveryInsideKhulna: 60, deliveryOutsideKhulna: 120 };

export const getSettings = cache(async () => {
  await connectDB();
  const s = (await Settings.findOne({ key: "main" }).lean()) || {};
  const out = {};
  for (const k of Object.keys(DEFAULTS)) out[k] = s[k] ?? DEFAULTS[k];
  return out;
}, ["settings"], { revalidate: TTL, tags: ["settings"] });

export const getCategories = cache(async () => {
  await connectDB();
  const cats = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
  return plain(cats.map((c) => ({ ...c, subs: c.subs.filter((s) => !(c.hiddenSubs || []).includes(s)) })));
}, ["categories"], { revalidate: TTL, tags: ["categories"] });

export const getProducts = cache(async ({ cat, sub, sort } = {}) => {
  await connectDB();
  const q = await visibleQuery({ ...(cat && { category: cat }), ...(sub && { subCategory: sub }) });
  const order = sort === "low" ? { price: 1 } : sort === "high" ? { price: -1 } : { createdAt: -1 };
  return plain(await Product.find(q).sort(order).lean());
}, ["products"], { revalidate: TTL, tags: ["products"] });

export const getProduct = cache(async (slug) => {
  await connectDB();
  const p = await Product.findOne(await visibleQuery({ slug })).lean();
  return p ? plain(p) : null;
}, ["product"], { revalidate: TTL, tags: ["products"] });

// Light data for header menu, footer and category counts
export const getMenu = cache(async () => {
  await connectDB();
  const [cats, products] = await Promise.all([
    Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).select("name slug subs hiddenSubs").lean(),
    Product.find(await visibleQuery()).sort({ createdAt: -1 }).select("slug name category subCategory").lean(),
  ]);
  const categories = cats.map((c) => ({ name: c.name, slug: c.slug, subs: c.subs.filter((s) => !(c.hiddenSubs || []).includes(s)) }));
  return plain({ categories, products });
}, ["menu"], { revalidate: TTL, tags: ["products", "categories"] });
