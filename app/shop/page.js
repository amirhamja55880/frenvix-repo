import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CategoryTree from "@/components/CategoryTree";
import { getProducts, getCategories } from "@/lib/data";

export async function generateMetadata({ searchParams }) {
  const categories = await getCategories();
  const cat = categories.find((c) => c.name === searchParams?.cat);
  const sub = cat && cat.subs.includes(searchParams?.sub) ? searchParams.sub : null;
  const q = new URLSearchParams();
  if (cat) q.set("cat", cat.name);
  if (sub) q.set("sub", sub);
  const name = sub || cat?.name;
  const empty = cat ? (await getProducts({ cat: cat.name, sub: sub || undefined })).length === 0 : false;
  return {
    robots: empty ? { index: false, follow: true } : undefined,
    title: name ? `${name} in Bangladesh` : "Shop",
    description: name ? `Buy ${name} online in Bangladesh from FRENVIX. Cash on delivery, 3-day size exchange and delivery across all districts.` : "Shop heavyweight hoodies, sweatshirts and henleys. Cash on delivery across Bangladesh.",
    alternates: { canonical: "/shop" + (q.toString() ? `?${q}` : "") },
  };
}

const href = ({ cat, sub, sort }) => {
  const p = new URLSearchParams();
  if (cat) p.set("cat", cat);
  if (sub) p.set("sub", sub);
  if (sort) p.set("sort", sort);
  const q = p.toString();
  return q ? `/shop?${q}` : "/shop";
};

export default async function Shop({ searchParams }) {
  const sort = ["low", "high"].includes(searchParams?.sort) ? searchParams.sort : null;
  const [categories, all] = await Promise.all([getCategories(), getProducts({ sort })]);
  const cat = categories.find((c) => c.name === searchParams?.cat) || null;
  const sub = cat && cat.subs.includes(searchParams?.sub) ? searchParams.sub : null;
  const cn = cat?.name;
  const list = all.filter((p) => (!cn || p.category === cn) && (!sub || p.subCategory === sub));

  return (
    <div className="wrap section">
      <h1 className="pagetitle">{sub || cn || "All products"}</h1>

      {/* Phones and small screens: category buttons on top (sub categories appear after a category is chosen) */}
      <div className="chips mchips">
        <Link className={`chip ${!cat ? "on" : ""}`} href={href({ sort })}>All</Link>
        {categories.map((c) => <Link key={c.slug} className={`chip ${cn === c.name ? "on" : ""}`} href={href({ cat: c.name, sort })}>{c.name}</Link>)}
      </div>
      {cat && cat.subs.length > 0 && (
        <div className="chips mchips">
          <Link className={`chip ${!sub ? "on" : ""}`} href={href({ cat: cn, sort })}>All {cn}</Link>
          {cat.subs.map((s) => <Link key={s} className={`chip ${sub === s ? "on" : ""}`} href={href({ cat: cn, sub: s, sort })}>{s}</Link>)}
        </div>
      )}

      <div className="shoplayout">
        {/* Large screens: category list on the left, closed until opened */}
        <aside className="side"><h3>Categories</h3><CategoryTree categories={categories} cat={cn} sub={sub} allActive={!cn} /></aside>
        <div>
          <div className="toolbar">
            <div className="chips">
              <Link className={`chip ${!sort ? "on" : ""}`} href={href({ cat: cn, sub })}>Newest</Link>
              <Link className={`chip ${sort === "low" ? "on" : ""}`} href={href({ cat: cn, sub, sort: "low" })}>Price: low</Link>
              <Link className={`chip ${sort === "high" ? "on" : ""}`} href={href({ cat: cn, sub, sort: "high" })}>Price: high</Link>
            </div>
          </div>
          {list.length ? <div className="grid">{list.map((p) => <ProductCard key={p.slug} p={p} />)}</div> : <p>No products here yet. Check back soon.</p>}
        </div>
      </div>
    </div>
  );
}
