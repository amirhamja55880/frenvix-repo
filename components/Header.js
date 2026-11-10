"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";
import CategoryTree from "./CategoryTree";
import Logo from "./Logo";
import { SITE } from "@/lib/products";

const links = [["/shop", "Shop"], ["/track", "Track order"], ["/about", "About"], ["/contact", "Contact"]];

export default function Header({ menu }) {
  const { categories, products } = menu;
  const { count } = useCart();
  const path = usePathname();
  const [open, setOpen] = useState(false);

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
            {links.map(([h, l]) => <Link key={h} href={h} className={path.startsWith(h) ? "on" : ""}>{l}</Link>)}
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
        <div className="dl"><Link href="/">Home</Link>{links.map(([h, l]) => <Link key={h} href={h}>{l}</Link>)}</div>
        <h4>Categories</h4>
        <CategoryTree categories={categories} products={products} />
      </aside>
    </>
  );
}
