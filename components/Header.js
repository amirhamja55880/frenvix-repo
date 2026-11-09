"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";
import CategoryTree from "./CategoryTree";
import Logo from "./Logo";
import { SITE } from "@/lib/products";

const links = [["/track", "Track order"], ["/about", "About"], ["/contact", "Contact"]];

export default function Header({ menu }) {
  const { categories, products } = menu;
  const { count } = useCart();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [skip, setSkip] = useState(false);
  const cls = (h) => (path.startsWith(h) ? "on" : "");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div className="topbar">Cash on delivery across Bangladesh</div>
      <header className="header">
        <div className="wrap nav">
          <Link href="/" className="logo" aria-label={SITE.name}><Logo text={SITE.name} /></Link>

          <nav className="links" aria-label="Main">
            <div className={`hasmenu ${skip ? "skip" : ""}`} onMouseLeave={() => setSkip(false)}>
              <Link href="/shop" className={cls("/shop")}>Shop <span className="caret">▾</span></Link>
              <div className="mega" onClick={(e) => e.target.closest("a") && setSkip(true)}>
                <div className="wrap megain">
                  {categories.map((c) => (
                    <div key={c.slug}>
                      <h5><Link href={`/shop?cat=${encodeURIComponent(c.name)}`}>{c.name}</Link></h5>
                      {products.filter((p) => p.category === c.name).map((p) => <Link key={p.slug} href={`/product/${p.slug}`}>{p.name}</Link>)}
                    </div>
                  ))}
                </div>
                <div className="wrap megafoot"><Link href="/shop">View all products →</Link></div>
              </div>
            </div>
            {links.map(([h, l]) => <Link key={h} href={h} className={cls(h)}>{l}</Link>)}
          </nav>

          <div className="navright">
            <Link href="/cart" className="cartlink">Cart<span className="count">{count}</span></Link>
            <button className="burger" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}><span /><span /><span /></button>
          </div>
        </div>
      </header>

      <div className={`overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`drawer ${open ? "open" : ""}`} aria-label="Menu" onClick={(e) => e.target.closest("a") && setOpen(false)}>
        <div className="drawerhead"><span className="logo"><Logo text={SITE.name} /></span><button className="closebtn" aria-label="Close menu" onClick={() => setOpen(false)}>✕</button></div>
        <div className="dl"><Link href="/">Home</Link><Link href="/shop">Shop</Link>{links.map(([h, l]) => <Link key={h} href={h}>{l}</Link>)}</div>
        <h4>Categories</h4>
        <CategoryTree categories={categories} products={products} />
      </aside>
    </>
  );
}
