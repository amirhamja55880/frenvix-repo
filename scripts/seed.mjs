// Run once:  node scripts/seed.mjs
// Inserts demo data. Existing products/categories/settings are NOT overwritten.
import fs from "fs";
import mongoose from "mongoose";

const env = {};
for (const l of fs
  .readFileSync(new URL("../.env.local", import.meta.url), "utf8")
  .split(/\r?\n/)) {
  const i = l.indexOf("=");
  if (i > 0 && !l.trim().startsWith("#"))
    env[l.slice(0, i).trim()] = l.slice(i + 1).trim();
}
if (!env.MONGODB_URI) throw new Error("MONGODB_URI missing in .env.local");

const HEX = {
  Black: "#18181a",
  Charcoal: "#3b3d42",
  Ash: "#a3a5a9",
  Navy: "#1d2a47",
  Olive: "#575d3e",
  Sand: "#cdbfa5",
  Maroon: "#5f1e2a",
};
const STOCK = [
  ["S", 8],
  ["M", 12],
  ["L", 12],
  ["XL", 8],
  ["XXL", 4],
];

const categories = [
  {
    name: "Hoodie",
    slug: "hoodie",
    subs: ["Pullover Hoodie", "Oversized Hoodie"],
    sortOrder: 1,
  },
  {
    name: "Sweatshirt",
    slug: "sweatshirt",
    subs: ["Crewneck", "Heavyweight"],
    sortOrder: 2,
  },
  { name: "Henley", slug: "henley", subs: ["Classic", "Waffle"], sortOrder: 3 },
];
// slug, name, category, subCategory, price, oldPrice, colors, fabric, description
const items = [
  [
    "core-hoodie",
    "Core Hoodie",
    "Hoodie",
    "Pullover Hoodie",
    1890,
    2290,
    ["Black", "Ash", "Navy"],
    "380 GSM brushed fleece",
    "A heavyweight hoodie with a double-lined hood and a deep front pocket. Soft inside, structured outside, and built for everyday wear.",
  ],
  [
    "oversized-hoodie",
    "Oversized Hoodie",
    "Hoodie",
    "Oversized Hoodie",
    2190,
    null,
    ["Sand", "Olive", "Black"],
    "400 GSM brushed fleece",
    "Dropped shoulders and a longer body for a relaxed fit. Order your usual size for the intended look.",
  ],
  [
    "crew-sweatshirt",
    "Crew Sweatshirt",
    "Sweatshirt",
    "Crewneck",
    1590,
    1890,
    ["Ash", "Navy", "Maroon"],
    "320 GSM French terry",
    "A mid-weight crewneck with ribbed cuffs and hem that keep their shape after repeated washing.",
  ],
  [
    "heavy-sweatshirt",
    "Heavy Sweatshirt",
    "Sweatshirt",
    "Heavyweight",
    1790,
    null,
    ["Black", "Charcoal", "Olive"],
    "360 GSM loopback cotton",
    "Dense loopback cotton with a clean neckline. Warm without feeling bulky.",
  ],
  [
    "classic-henley",
    "Classic Henley",
    "Henley",
    "Classic",
    1290,
    null,
    ["Sand", "Navy", "Black"],
    "Slub cotton jersey",
    "A three-button placket on soft slub cotton. Wear it alone or layered under a jacket.",
  ],
  [
    "waffle-henley",
    "Waffle Henley",
    "Henley",
    "Waffle",
    1490,
    1690,
    ["Maroon", "Olive", "Ash"],
    "Waffle-knit cotton",
    "A textured waffle knit that holds warmth and still breathes. Slim fit with long sleeves.",
  ],
];

await mongoose.connect(env.MONGODB_URI);
const db = mongoose.connection;
const now = Date.now();
const add = async (coll, filter, doc) =>
  (
    await db
      .collection(coll)
      .updateOne(filter, { $setOnInsert: doc }, { upsert: true })
  ).upsertedCount;

let c = 0,
  p = 0;
for (const x of categories)
  c += await add(
    "categories",
    { slug: x.slug },
    { ...x, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  );
for (const [n, t] of items.entries()) {
  const [
    slug,
    name,
    category,
    subCategory,
    price,
    oldPrice,
    colors,
    fabric,
    description,
  ] = t;
  const doc = {
    slug,
    name,
    category,
    subCategory,
    price,
    ...(oldPrice && { oldPrice }),
    colors: colors.map((k) => ({ name: k, hex: HEX[k] })),
    images: [],
    fabric,
    description,
    variants: colors.flatMap((k) =>
      STOCK.map(([size, stock]) => ({ color: k, size, stock })),
    ),
    isActive: true,
    createdAt: new Date(now - n * 1000),
    updatedAt: new Date(),
  };
  p += await add("products", { slug }, doc);
}
const s = await add(
  "settings",
  { key: "main" },
  {
    key: "main",
    phone: "01XXXXXXXXX",
    email: "hello@frenvix.com",
    homeDistrict: "Khulna",
    deliveryInsideKhulna: 60,
    deliveryOutsideKhulna: 120,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
);
console.log(
  `Added: ${c} categories, ${p} products, ${s} settings (existing ones were left untouched)`,
);
await mongoose.disconnect();
