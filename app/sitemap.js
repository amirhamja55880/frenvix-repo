import { getProducts, getCategories } from "@/lib/data";
import { siteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap() {
  const base = siteUrl();
  const now = new Date();
  const fixed = [
    ["", 1], ["/shop", 0.9], ["/about", 0.5], ["/contact", 0.5], ["/return-policy", 0.3], ["/privacy-policy", 0.3],
  ].map(([p, priority]) => ({ url: base + p, lastModified: now, priority }));
  let products = [];
  try {
    products = (await getProducts()).map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: p.updatedAt ? new Date(p.updatedAt) : now, priority: 0.8 }));
  } catch (e) { console.error("Sitemap products error:", e.message); }
  let cats = [];
  try {
    for (const c of await getCategories()) {
      cats.push({ url: `${base}/shop?cat=${encodeURIComponent(c.name)}`, lastModified: now, priority: 0.8 });
      for (const s of c.subs) cats.push({ url: `${base}/shop?cat=${encodeURIComponent(c.name)}&sub=${encodeURIComponent(s)}`, lastModified: now, priority: 0.6 });
    }
  } catch (e) { console.error("Sitemap categories error:", e.message); }
  return [...fixed, ...cats, ...products];
}
