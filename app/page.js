import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import { getProducts, getCategories, getSettings } from "@/lib/data";
import { taka } from "@/lib/products";

export const revalidate = 60;

export default async function Home() {
  const [products, categories, s] = await Promise.all([getProducts(), getCategories(), getSettings()]);
  const hero = products[0];
  return (
    <>
      <section className="hero">
        <div className="wrap herogrid">
          <div className="herotext">
            <h1>Heavyweight basics, made to last.</h1>
            <p>Hoodies, sweatshirts and henleys in thick, soft cotton. No account needed. Pay when it arrives.</p>
            <div className="actions"><Link className="btn light" href="/shop">Shop now</Link></div>
          </div>
          {hero && <Link href={`/product/${hero.slug}`} className="herocard"><ProductImage product={hero} ratio="1/1" width={800} priority /><span>{hero.name} · {taka(hero.price)}</span></Link>}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="wrap section">
          <div className="cats">
            {categories.map((c) => (
              <Link key={c.slug} href={`/shop?cat=${encodeURIComponent(c.name)}`} className="cat"><b>{c.name}</b><span>{products.filter((p) => p.category === c.name).length} styles</span></Link>
            ))}
          </div>
        </section>
      )}

      <section className="wrap section">
        <div className="sechead"><h2>New arrivals</h2><Link href="/shop">View all</Link></div>
        {products.length ? <div className="grid">{products.slice(0, 4).map((p) => <ProductCard key={p.slug} p={p} />)}</div> : <p className="muted">New products are coming soon.</p>}
      </section>

      <section className="wrap section">
        <div className="trust">
          <div><b>Cash on delivery</b><p className="muted">Pay the courier when your order arrives.</p></div>
          <div><b>Delivery across Bangladesh</b><p className="muted">{taka(s.deliveryInsideKhulna)} inside Khulna, {taka(s.deliveryOutsideKhulna)} outside.</p></div>
          <div><b>Easy size exchange</b><p className="muted">Wrong size? Exchange within 3 days.</p></div>
        </div>
      </section>
    </>
  );
}
