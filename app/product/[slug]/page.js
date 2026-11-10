import { notFound } from "next/navigation";
import ProductClient from "@/components/ProductClient";
import ProductCard from "@/components/ProductCard";
import { getProduct, getProducts } from "@/lib/data";

export const revalidate = 60;
export async function generateStaticParams() { return (await getProducts()).map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }) {
  const p = await getProduct(params.slug);
  return p ? { title: p.name, description: p.description } : {};
}

export default async function ProductPage({ params }) {
  const p = await getProduct(params.slug);
  if (!p) notFound();
  const all = await getProducts();
  const related = all.filter((x) => x.slug !== p.slug).sort((a, b) => (b.category === p.category) - (a.category === p.category)).slice(0, 4);
  return (
    <div className="wrap section">
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
