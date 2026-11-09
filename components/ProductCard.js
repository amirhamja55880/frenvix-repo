import Link from "next/link";
import ProductImage from "./ProductImage";
import { taka } from "@/lib/products";

export default function ProductCard({ p }) {
  const soldOut = p.variants.reduce((a, v) => a + v.stock, 0) === 0;
  return (
    <Link href={`/product/${p.slug}`} className="card">
      <div className="cardmedia">
        <ProductImage product={p} />
        {soldOut ? (
          <span className="badge" style={{ background: "#111" }}>
            Sold out
          </span>
        ) : (
          p.oldPrice && <span className="badge">Sale</span>
        )}
      </div>
      <div className="cardinfo">
        <h3>{p.name}</h3>
        <p className="muted">{p.category}</p>
        <p className="price">
          {taka(p.price)}
          {p.oldPrice && <s>{taka(p.oldPrice)}</s>}
        </p>
        <div className="dots">
          {p.colors.map((c) => (
            <i key={c.name} style={{ background: c.hex }} title={c.name} />
          ))}
        </div>
      </div>
    </Link>
  );
}
