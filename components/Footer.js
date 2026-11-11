import Link from "next/link";
import Logo from "./Logo";
import { SITE } from "@/lib/products";
import { phoneOk, telLink, waLink } from "@/lib/contact";

export default function Footer({ settings: s, menu }) {
  return (
    <footer className="footer">
      <div className="wrap fgrid">
        <div>
          <div className="logo"><Logo height={26} text={SITE.name} /></div>
          <p className="muted" style={{ marginTop: 12, maxWidth: 280 }}>Heavyweight everyday basics: hoodies, sweatshirts and henleys.</p>
          {(s.facebook || s.instagram) && (
            <p style={{ marginTop: 12, display: "flex", gap: 16 }}>
              {s.facebook && <a className="flink" href={s.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>}
              {s.instagram && <a className="flink" href={s.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
            </p>
          )}
        </div>
        <div>
          <h4>Shop</h4>
          <Link href="/shop">All products</Link>
          {menu.categories.map((c) => <Link key={c.slug} href={`/shop?cat=${encodeURIComponent(c.name)}`}>{c.name}</Link>)}
        </div>
        <div>
          <h4>Help</h4>
          <Link href="/track">Track your order</Link>
          <Link href="/return-policy">Return &amp; exchange</Link>
          <Link href="/privacy-policy">Privacy policy</Link>
          <Link href="/contact">Contact us</Link>
        </div>
        <div>
          <h4>Contact</h4>
          {phoneOk(s.phone) && <a href={telLink(s.phone)}>{s.phone}</a>}
          {s.whatsapp && <a href={waLink(s.whatsapp)} target="_blank" rel="noopener noreferrer">WhatsApp: {s.whatsapp}</a>}
          {s.email && <a href={`mailto:${s.email}`}>{s.email}</a>}
          {s.address && <p className="muted" style={{ fontSize: 15 }}>{s.address}</p>}
          {s.hours && <p className="muted" style={{ fontSize: 15 }}>{s.hours}</p>}
        </div>
      </div>
      <div className="wrap copy">© {new Date().getFullYear()} {SITE.name}. All rights reserved. Cash on delivery available across Bangladesh.</div>
    </footer>
  );
}
