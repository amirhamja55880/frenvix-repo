"use client";
import { useState } from "react";
import Link from "next/link";
import ProductImage from "./ProductImage";
import { useCart } from "./CartProvider";
import { SIZES, taka, cdn } from "@/lib/products";

export default function ProductClient({ p }) {
  const { add } = useCart();
  const [color, setColor] = useState(p.colors[0]?.name);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");
  const [added, setAdded] = useState(false);
  const [img, setImg] = useState(0);

  const stockOf = (c, s) => p.variants.find((v) => v.color === c && v.size === s)?.stock ?? 0;
  const sizes = [...new Set(p.variants.map((v) => v.size))].sort((a, b) => SIZES.indexOf(a) - SIZES.indexOf(b));
  const soldOut = p.variants.every((v) => v.stock === 0);
  const left = size ? stockOf(color, size) : 0;
  const hex = p.colors.find((c) => c.name === color)?.hex;

  const pickColor = (c) => { setColor(c); if (size && stockOf(c, size) === 0) setSize(null); setQty(1); };
  const pickSize = (s) => { setSize(s); setQty(1); setMsg(""); };
  const submit = () => {
    if (!size) return setMsg("Select a size to continue.");
    add({ slug: p.slug, name: p.name, category: p.category, price: p.price, color, size, qty, image: p.images?.[0] || null, hex });
    setMsg(""); setAdded(true); setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="pd">
      <div>
        <ProductImage product={p} color={color} index={img} priority />
        {p.images?.length > 1 && <div className="thumbs" style={{ marginTop: 10 }}>{p.images.map((u, k) => <button key={k} className={`thumb2 ${k === img ? "cur" : ""}`} onClick={() => setImg(k)} aria-label={`Image ${k + 1}`}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={cdn(u, 160)} alt="" /></button>)}</div>}
      </div>
      <div className="pdinfo">
        <p className="muted"><Link href="/shop">Shop</Link> / {p.category}</p>
        <h1>{p.name}</h1>
        <p className="price big">{taka(p.price)}{p.oldPrice && <s>{taka(p.oldPrice)}</s>}</p>
        <p className="desc">{p.description}</p>
        <p className="label">Color: <b>{color}</b></p>
        <div className="opts">{p.colors.map((c) => <button key={c.name} aria-label={c.name} aria-pressed={c.name === color} className={`sw ${c.name === color ? "on" : ""}`} style={{ background: c.hex }} onClick={() => pickColor(c.name)} />)}</div>
        <p className="label">Size</p>
        <div className="opts">{sizes.map((s) => { const out = stockOf(color, s) === 0; return <button key={s} disabled={out} aria-pressed={s === size} title={out ? "Out of stock" : ""} className={`sz ${s === size ? "on" : ""}`} style={out ? { opacity: 0.4, textDecoration: "line-through", cursor: "not-allowed" } : null} onClick={() => pickSize(s)}>{s}</button>; })}</div>
        {size && left <= 5 && <p className="muted small" style={{ marginTop: 8 }}>Only {left} left in this size</p>}
        {msg && <p className="error" role="alert">{msg}</p>}
        <div className="buyrow">
          <div className="qty"><button aria-label="Decrease" onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span>{qty}</span><button aria-label="Increase" onClick={() => setQty(Math.min(Math.max(left, 1), 10, qty + 1))}>+</button></div>
          <button className="btn dark grow" disabled={soldOut} onClick={submit}>{soldOut ? "Sold out" : added ? "Added to cart" : "Add to cart"}</button>
        </div>
        {added && <Link className="btn outline full" href="/cart">View cart</Link>}
        <dl className="specs">
          <div><dt>Fabric</dt><dd>{p.fabric}</dd></div>
          <div><dt>Size chart (chest)</dt><dd>S 38 · M 40 · L 42 · XL 44 · XXL 46 inches</dd></div>
          <div><dt>Delivery</dt><dd>2–4 days. Cash on delivery.</dd></div>
        </dl>
      </div>
    </div>
  );
}
