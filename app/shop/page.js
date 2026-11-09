import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts, getCategories } from "@/lib/data";

export const metadata = { title: "Shop" };

const href = ({ cat, sub, sort }) => {
  const p = new URLSearchParams();
  if (cat) p.set("cat", cat);
  if (sub) p.set("sub", sub);
  if (sort) p.set("sort", sort);
  const q = p.toString();
  return q ? `/shop?${q}` : "/shop";
};

export default async function Shop({ searchParams }) {
  const categories = await getCategories();
  const cat = categories.find((c) => c.name === searchParams?.cat) || null;
  const sub =
    cat && cat.subs.includes(searchParams?.sub) ? searchParams.sub : null;
  const sort = ["low", "high"].includes(searchParams?.sort)
    ? searchParams.sort
    : null;
  const list = await getProducts({ cat: cat?.name, sub, sort });
  const cn = cat?.name;

  return (
    <div className="wrap section">
      <h1 className="pagetitle">{sub || cn || "All products"}</h1>
      <div className="chips fchips">
        <Link className={`chip ${!cat ? "on" : ""}`} href={href({ sort })}>
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            className={`chip ${cn === c.name ? "on" : ""}`}
            href={href({ cat: c.name, sort })}
          >
            {c.name}
          </Link>
        ))}
      </div>
      {cat && cat.subs.length > 0 && (
        <div className="chips fchips">
          <Link
            className={`chip ${!sub ? "on" : ""}`}
            href={href({ cat: cn, sort })}
          >
            All {cn}
          </Link>
          {cat.subs.map((s) => (
            <Link
              key={s}
              className={`chip ${sub === s ? "on" : ""}`}
              href={href({ cat: cn, sub: s, sort })}
            >
              {s}
            </Link>
          ))}
        </div>
      )}
      <div className="toolbar">
        <p className="muted small">
          {list.length} product{list.length === 1 ? "" : "s"}
        </p>
        <div className="chips">
          <Link
            className={`chip ${!sort ? "on" : ""}`}
            href={href({ cat: cn, sub })}
          >
            Newest
          </Link>
          <Link
            className={`chip ${sort === "low" ? "on" : ""}`}
            href={href({ cat: cn, sub, sort: "low" })}
          >
            Price: low
          </Link>
          <Link
            className={`chip ${sort === "high" ? "on" : ""}`}
            href={href({ cat: cn, sub, sort: "high" })}
          >
            Price: high
          </Link>
        </div>
      </div>
      {list.length ? (
        <div className="grid">
          {list.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      ) : (
        <p>No products in this category yet.</p>
      )}
    </div>
  );
}
