import Link from "next/link";

const url = (cat, sub) =>
  `/shop?cat=${encodeURIComponent(cat)}${sub ? `&sub=${encodeURIComponent(sub)}` : ""}`;

export default function CategoryTree({
  categories = [],
  products = [],
  cat,
  sub,
}) {
  return (
    <nav className="tree" aria-label="Categories">
      <Link href="/shop" className={!cat ? "on" : ""}>
        All products <span>{products.length}</span>
      </Link>
      {categories.map((c) => (
        <details key={c.slug} open={cat === c.name}>
          <summary>
            <Link
              href={url(c.name)}
              className={cat === c.name && !sub ? "on" : ""}
            >
              {c.name}{" "}
              <span>
                {products.filter((p) => p.category === c.name).length}
              </span>
            </Link>
          </summary>
          <div className="sub">
            {c.subs.map((s) => (
              <Link
                key={s}
                href={url(c.name, s)}
                className={cat === c.name && sub === s ? "on" : ""}
              >
                {s}{" "}
                <span>
                  {
                    products.filter(
                      (p) => p.category === c.name && p.subCategory === s,
                    ).length
                  }
                </span>
              </Link>
            ))}
          </div>
        </details>
      ))}
    </nav>
  );
}
