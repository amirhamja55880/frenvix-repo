import Link from "next/link";

const url = (cat, sub) =>
  `/shop?cat=${encodeURIComponent(cat)}${sub ? `&sub=${encodeURIComponent(sub)}` : ""}`;

// Category list. Sub categories stay closed until the visitor opens them with the + button.
export default function CategoryTree({ categories = [], cat, sub }) {
  return (
    <nav className="tree" aria-label="Categories">
      <Link href="/shop" className={!cat ? "on" : ""}>
        All products
      </Link>
      {categories.map((c) => (
        <details key={c.slug} open={cat === c.name}>
          <summary>
            <Link
              href={url(c.name)}
              className={cat === c.name && !sub ? "on" : ""}
            >
              {c.name}
            </Link>
          </summary>
          <div className="sub">
            {c.subs.map((s) => (
              <Link
                key={s}
                href={url(c.name, s)}
                className={cat === c.name && sub === s ? "on" : ""}
              >
                {s}
              </Link>
            ))}
          </div>
        </details>
      ))}
    </nav>
  );
}
