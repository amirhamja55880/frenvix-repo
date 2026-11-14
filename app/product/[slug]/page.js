import { notFound } from "next/navigation";
import ProductClient from "@/components/ProductClient";
import ProductCard from "@/components/ProductCard";
import { getProduct, getProducts } from "@/lib/data";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 60;
export async function generateStaticParams() { return (await getProducts()).map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }) {
  const p = await getProduct(params.slug);
  if (!p) return {};
  const desc = (p.description || `${p.name} by FRENVIX. Cash on delivery across Bangladesh.`).slice(0, 160);
  const img = p.images?.[0];
  return {
    title: /frenvix/i.test(p.name) ? { absolute: `${p.name} | Buy Online in Bangladesh` } : `${p.name} | Buy Online in Bangladesh`, description: desc,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { type: "website", title: p.name, description: desc, url: `/product/${p.slug}`, images: img ? [{ url: img }] : undefined },
    twitter: { card: "summary_large_image", title: p.name, description: desc, images: img ? [img] : undefined },
  };
}

export default async function ProductPage({ params }) {
  const p = await getProduct(params.slug);
  if (!p) notFound();
  const all = await getProducts();
  const related = all.filter((x) => x.slug !== p.slug).sort((a, b) => (b.category === p.category) - (a.category === p.category)).slice(0, 4);
  return (
    <div className="wrap section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(p)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(p)) }} />
      <ProductClient p={p} />
      {related.length > 0 && (
        <>
          <div className="sechead" style={{ marginTop: 64 }}><h2>You may also like</h2></div>
          <div className="grid">{related.map((r) => <ProductCard key={r.slug} p={r} />)}</div>
        </>
      )}
    </div>
  );
}
