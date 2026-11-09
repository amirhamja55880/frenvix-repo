import Link from "next/link";
import { SITE } from "@/lib/products";
import Logo from "./Logo";

export default function Footer({ settings, menu }) {
  return (
    <footer className="footer">
      <div className="wrap fgrid">
        <div><div className="logo"><Logo height={26} text={SITE.name} /></div><p className="muted">Everyday layers, cut right.</p></div>
        <div><h4>Help</h4><Link href="/track">Track order</Link><Link href="/return-policy">Return policy</Link><Link href="/contact">Contact</Link></div>
        <div><h4>Shop</h4>{menu.categories.map((c) => <Link key={c.slug} href={`/shop?cat=${encodeURIComponent(c.name)}`}>{c.name}</Link>)}</div>
        <div><h4>Contact</h4><p className="muted">{settings.phone}<br />{settings.email}</p></div>
      </div>
      <div className="wrap copy">© {new Date().getFullYear()} {SITE.name}. All rights reserved.</div>
    </footer>
  );
}
