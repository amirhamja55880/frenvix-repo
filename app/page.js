import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import { getProducts, getCategories, getSettings } from "@/lib/data";
import { taka } from "@/lib/products";
import { phoneOk, telLink, waLink } from "@/lib/contact";

export const revalidate = 60;

const Icon = ({ children }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;

export default async function Home() {
  const [products, categories, s] = await Promise.all([getProducts(), getCategories(), getSettings()]);
  const [hero, second] = products;
  const wa = s.whatsapp ? waLink(s.whatsapp) : "";

  const trust = [
    ["Cash on delivery", "Pay when your order arrives", <Icon key="a"><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /></Icon>],
    ["Delivery across Bangladesh", `${taka(s.deliveryInsideKhulna)} inside ${s.homeDistrict}, ${taka(s.deliveryOutsideKhulna)} elsewhere`, <Icon key="b"><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></Icon>],
    ["3-day size exchange", "Wrong size? We will swap it", <Icon key="c"><path d="M4 8h13l-3-3" /><path d="M20 16H7l3 3" /></Icon>],
    ["Track your order", "No account needed", <Icon key="d"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></Icon>],
  ];
  const why = [
    ["Heavyweight fabrics", "Our hoodies and sweatshirts use thick, brushed cotton. Every product page lists the fabric so you know exactly what you are buying."],
    ["Everyday fits", "Simple, wearable shapes in a focused colour range, so each piece works with what you already own."],
    ["Honest details", "Real sizes with chest measurements, clear prices and live stock. If a size is sold out, we show it."],
    ["People you can reach", "We call to confirm every order, and you can contact us by phone or email whenever you need help."],
  ];
  const steps = [
    ["Choose your piece", "Pick a colour and size. Sold-out sizes are marked so you never order something we cannot send."],
    ["Place your order", "Enter your delivery details and choose how to pay. There is no account to create."],
    ["We confirm and deliver", "Our team calls to confirm your order, then it is on its way. Track it any time with your order ID."],
  ];
  const faq = [
    ["How long does delivery take?", `Usually 2 to 4 days after your order is confirmed. Delivery costs ${taka(s.deliveryInsideKhulna)} inside ${s.homeDistrict} and ${taka(s.deliveryOutsideKhulna)} everywhere else in Bangladesh.`],
    ["How do I pay?", "Cash on delivery: you pay the courier when the order arrives. Mobile payment with bKash, Nagad and Rocket is coming soon."],
    ["What if the size does not fit?", "Tell us within 3 days of delivery and we will arrange an exchange for another size, as long as the item is unworn with tags attached. See the return policy for details."],
    ["How can I track my order?", "Open Track order and enter your order ID and phone number. Your order ID is also in the confirmation email we send you."],
    ["Do I need an account?", "No. You can order as a guest with just your delivery details."],
  ];

  return (
    <>
      <section className="hero2">
        <img className="heromark" src="/logo-light.png" alt="" aria-hidden="true" />
        <div className="wrap hero2grid">
          <div>
            <span className="eyebrow">Heavyweight everyday basics</span>
            <h1>Built heavy.<br />Worn every day.</h1>
            <p className="lead">Hoodies, sweatshirts and henleys cut from thick, soft cotton. Order without an account and pay when it arrives.</p>
            <div className="actions">
              <Link className="btn light" href="/shop">Shop the collection</Link>
              <a className="btn ghost" href="#how">How ordering works</a>
            </div>
            <div className="heroties"><span>Cash on delivery</span><span>3-day size exchange</span><span>Order tracking</span></div>
          </div>
          {hero && (
            <div className="herostack">
              <Link href={`/product/${hero.slug}`} className="herocard2">
                <ProductImage product={hero} ratio="4/5" width={800} priority />
                <span className="herotag"><b>{hero.name}</b><i>{taka(hero.price)}</i></span>
              </Link>
              {second && <Link href={`/product/${second.slug}`} className="heroimg2" aria-label={second.name}><ProductImage product={second} ratio="1/1" width={400} priority /></Link>}
            </div>
          )}
        </div>
      </section>

      <section className="trustbar">
        <div className="wrap trustgrid">
          {trust.map(([t, d, icon]) => <div className="ti" key={t}>{icon}<div><b>{t}</b><span>{d}</span></div></div>)}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="wrap sec2">
          <div className="sechead2"><div><h2>Shop by category</h2><p className="muted">Find the piece that fits your day.</p></div><Link href="/shop" className="link">View all products</Link></div>
          <div className="cattiles">
            {categories.map((c) => {
              const p = products.find((x) => x.category === c.name);
              return (
                <Link key={c.slug} href={`/shop?cat=${encodeURIComponent(c.name)}`} className="cattile">
                  {p ? <ProductImage product={p} ratio="4/5" width={600} /> : <div className="media" style={{ aspectRatio: "4/5" }} />}
                  <span className="cap"><b>{c.name}</b><i>Shop now →</i></span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="wrap sec2" style={{ paddingTop: 0 }}>
        <div className="sechead2"><div><h2>New arrivals</h2><p className="muted">The latest pieces in the collection.</p></div><Link href="/shop" className="link">View all</Link></div>
        {products.length ? <div className="grid">{products.slice(0, 8).map((p) => <ProductCard key={p.slug} p={p} />)}</div> : <p className="muted">New products are coming soon.</p>}
      </section>

      <section className="why">
        <div className="wrap sec2">
          <div className="sechead2"><div><h2>Why FRENVIX</h2><p className="muted">A small range, made properly, sold honestly.</p></div></div>
          <div className="whygrid">{why.map(([t, d], i) => <div className="whycard" key={t}><span className="n">0{i + 1}</span><h3>{t}</h3><p>{d}</p></div>)}</div>
        </div>
      </section>

      <section className="wrap sec2" id="how">
        <div className="sechead2"><div><h2>How ordering works</h2><p className="muted">Three simple steps from cart to doorstep.</p></div></div>
        <div className="howgrid">{steps.map(([t, d], i) => <div className="step" key={t}><span className="num">Step {i + 1}</span><h3>{t}</h3><p>{d}</p></div>)}</div>
      </section>

      <section className="wrap sec2" id="faq" style={{ paddingTop: 0 }}>
        <div className="sechead2"><div><h2>Questions, answered</h2></div></div>
        <div className="faq">{faq.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
      </section>

      <section className="wrap" style={{ paddingBottom: 72 }}>
        <div className="ctaband">
          <div><h2>Not sure about your size?</h2><p>Message or call us and we will help you choose the right fit before you order.</p></div>
          <div className="actions">
            <Link className="btn light" href="/shop">Shop now</Link>
            {phoneOk(s.phone) && <a className="btn ghost" href={telLink(s.phone)}>Call us</a>}
            {wa && <a className="btn ghost" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
            {!phoneOk(s.phone) && !wa && <Link className="btn ghost" href="/contact">Contact us</Link>}
          </div>
        </div>
      </section>
    </>
  );
}
