import { SIZES } from "@/lib/products";

const str = (v, n) => String(v ?? "").trim().slice(0, n);
export const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

export function parseProduct(b, categories, { creating }) {
  if (!b || typeof b !== "object") return { error: "Invalid request" };
  const name = str(b.name, 100);
  if (name.length < 2) return { error: "Enter the product name" };
  const slug = str(b.slug, 60);
  if (creating && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { error: "Slug can only contain lowercase letters, numbers and hyphens" };
  const cat = categories.find((c) => c.name === b.category);
  if (!cat) return { error: "Choose a category" };
  const subCategory = str(b.subCategory, 60);
  if (subCategory && !cat.subs.includes(subCategory)) return { error: "Choose a valid sub category" };
  const price = Number(b.price);
  if (!Number.isFinite(price) || price <= 0 || price > 10000000) return { error: "Enter a valid price" };
  const oldPrice = b.oldPrice === "" || b.oldPrice == null ? undefined : Number(b.oldPrice);
  if (oldPrice !== undefined && (!Number.isFinite(oldPrice) || oldPrice <= price)) return { error: "Old price must be higher than the price" };

  const sizes = Array.isArray(b.sizes) ? [...new Set(b.sizes)].filter((s) => SIZES.includes(s)) : [];
  if (!sizes.length) return { error: "Select at least one size" };
  const colors = (Array.isArray(b.colors) ? b.colors : []).slice(0, 15).map((c) => ({ name: str(c?.name, 30), hex: str(c?.hex, 7), stock: c?.stock || {} }));
  if (!colors.length) return { error: "Add at least one color" };
  if (colors.some((c) => !c.name || !/^#[0-9a-f]{6}$/i.test(c.hex))) return { error: "Every color needs a name and a color value" };
  if (new Set(colors.map((c) => c.name.toLowerCase())).size !== colors.length) return { error: "Color names must be different from each other" };
  const variants = colors.flatMap((c) => sizes.map((s) => ({ color: c.name, size: s, stock: Math.max(0, Math.min(100000, parseInt(c.stock[s]) || 0)) })));

  const images = (Array.isArray(b.images) ? b.images : []).map((u) => str(u, 500)).filter(Boolean);
  if (images.length > 8) return { error: "Use at most 8 images" };
  if (images.some((u) => !u.startsWith("https://"))) return { error: "Image links must start with https://" };

  return { data: { slug, name, category: cat.name, subCategory, price, oldPrice, colors: colors.map(({ name, hex }) => ({ name, hex })), images, fabric: str(b.fabric, 100), description: str(b.description, 2000), variants, isActive: b.isActive !== false } };
}

export function parseCategory(b) {
  const name = str(b?.name, 40);
  if (name.length < 2) return { error: "Enter the category name" };
  const subs = [], hiddenSubs = [], renames = {}, seen = new Set();
  for (const s of (Array.isArray(b?.subs) ? b.subs : []).slice(0, 30)) {
    const n = str(typeof s === "string" ? s : s?.name, 40);
    if (!n || seen.has(n.toLowerCase())) continue;
    seen.add(n.toLowerCase());
    subs.push(n);
    if (s?.visible === false) hiddenSubs.push(n);
    const orig = str(s?.orig, 40);
    if (orig && orig !== n) renames[orig] = n; // renamed sub category: its products move with it
  }
  const sortOrder = Number.isFinite(Number(b?.sortOrder)) ? Number(b.sortOrder) : 0;
  return { data: { name, subs, hiddenSubs, sortOrder, isActive: b?.isActive !== false }, renames };
}
