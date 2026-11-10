"use client";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import ProductImage from "@/components/ProductImage";
import { taka } from "@/lib/products";

const pseudo = (i) => ({ name: i.name, category: i.category, images: i.image ? [i.image] : [], colors: [{ name: i.color, hex: i.hex || "#8a8a8a" }] });

export default function Cart() {
  const { items, setQty, remove, subtotal, ready } = useCart();
  if (!ready) return <div className="wrap section" />;
  if (!items.length) return (
    <div className="wrap section empty"><h1 className="pagetitle">Your cart is empty</h1><p className="muted">Add something from the shop to get started.</p><Link className="btn dark" href="/shop">Continue shopping</Link></div>
  );
  return (
    <div className="wrap section">
      <h1 className="pagetitle">Cart</h1>
      <div className="two">
        <div>
          {items.map((i) => (
            <div className="line" key={i.key}>
              <div className="thumb"><ProductImage product={pseudo(i)} color={i.color} ratio="1/1" width={200} /></div>
              <div className="grow"><Link href={`/product/${i.slug}`}><b>{i.name}</b></Link><p className="muted">{i.color} / {i.size}</p><p className="price">{taka(i.price)}</p>
                <div className="qty small"><button aria-label="Decrease" onClick={() => setQty(i.key, i.qty - 1)}>−</button><span>{i.qty}</span><button aria-label="Increase" onClick={() => setQty(i.key, i.qty + 1)}>+</button></div></div>
              <div className="right"><b>{taka(i.price * i.qty)}</b><button className="link" onClick={() => remove(i.key)}>Remove</button></div>
            </div>
          ))}
        </div>
        <aside className="summary"><h2>Order summary</h2><div className="l"><span>Subtotal</span><span>{taka(subtotal)}</span></div><p className="muted small">Delivery is added at checkout.</p><Link className="btn dark full" href="/checkout">Checkout</Link></aside>
      </div>
    </div>
  );
}
