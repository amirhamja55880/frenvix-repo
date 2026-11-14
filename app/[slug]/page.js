import Link from "next/link";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/data";
import { taka } from "@/lib/products";
import { phoneOk, telLink, waLink } from "@/lib/contact";
import ContactForm from "@/components/ContactForm";
import { SocialLinks, PhoneIcon, MailIcon, PinIcon, ClockIcon, WhatsAppIcon } from "@/components/SocialIcons";

const pages = {
  about: { title: "About", description: "FRENVIX is a Bangladeshi clothing brand making heavyweight hoodies, sweatshirts and henleys." },
  contact: { title: "Contact", description: "Call, message or email FRENVIX for help with products, sizes and orders." },
  "return-policy": { title: "Return & exchange policy", description: "How size exchanges, faulty items and refunds work at FRENVIX." },
  "privacy-policy": { title: "Privacy policy", description: "What information FRENVIX collects when you order and how it is used and protected." },
};
export const revalidate = 3600;
export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(pages).map((slug) => ({ slug }));
export const generateMetadata = ({ params }) => ({ title: pages[params.slug]?.title, description: pages[params.slug]?.description });

const Head = ({ title, lead }) => <section className="pagehero"><div className="wrap"><h1>{title}</h1><p>{lead}</p></div></section>;

function About({ s }) {
  const values = [
    ["Honest product details", "Every product page shows the fabric, the sizes with chest measurements and what is actually in stock."],
    ["Clear pricing", `The price on the page is the price of the item. Delivery is ${taka(s.deliveryInsideKhulna)} inside ${s.homeDistrict} and ${taka(s.deliveryOutsideKhulna)} elsewhere, and you see it before you confirm.`],
    ["Simple ordering", "No account and no password. Choose your piece, place the order and pay on delivery."],
    ["People you can reach", "We call to confirm every order, and you can contact us by phone or email at any time."],
  ];
  return (
    <>
      <Head title="About FRENVIX" lead="A Bangladeshi clothing brand focused on hoodies, sweatshirts and henleys that are made to be worn often." />
      <div className="wrap sec2">
        <div className="prose">
          <h2 style={{ marginTop: 0 }}>What we do</h2>
          <p>FRENVIX makes heavyweight everyday basics. We keep the range small on purpose: each piece is chosen for the weight of its fabric, the way it fits and how well it holds up to regular wear. The idea is simple. A few good pieces you reach for every day are better than a wardrobe full of average ones.</p>
          <p>We are growing step by step. New styles are added as we are happy with them, never just to fill the page.</p>
        </div>
        <h2 style={{ margin: "48px 0 20px", fontSize: 26 }}>What you can expect from us</h2>
        <div className="cardgrid">{values.map(([t, d]) => <div className="ccard" key={t}><h3>{t}</h3><p className="muted">{d}</p></div>)}</div>
        <div className="prose">
          <h2>How we work with you</h2>
          <ol>
            <li>You place an order on the website. There is no account to create.</li>
            <li>Our team calls you to confirm the order and your delivery details.</li>
            <li>We pack and send it. You can follow the order with your order ID on the <Link className="link" href="/track">Track order</Link> page.</li>
            <li>If the size is not right, you have 3 days to ask for an exchange. See our <Link className="link" href="/return-policy">return policy</Link>.</li>
          </ol>
        </div>
        <div className="actions" style={{ marginTop: 28 }}><Link className="btn dark" href="/shop">Shop the collection</Link><Link className="btn outline" href="/contact">Contact us</Link></div>
      </div>
    </>
  );
}

function Contact({ s }) {
  const items = [];
  if (phoneOk(s.phone)) items.push([<PhoneIcon key="i" />, "Call us", <a href={telLink(s.phone)}>{s.phone}</a>, "Talk to our team about products, sizes or an order."]);
  if (s.whatsapp) items.push([<WhatsAppIcon key="i" />, "WhatsApp", <a href={waLink(s.whatsapp)} target="_blank" rel="noopener noreferrer">{s.whatsapp}</a>, "Message us and we will reply as soon as we can."]);
  if (s.email) items.push([<MailIcon key="i" />, "Email", <a href={`mailto:${s.email}`}>{s.email}</a>, "Best for detailed questions or photos of an item."]);
  if (s.address) items.push([<PinIcon key="i" />, "Address", <span>{s.address}</span>, "Please call before visiting."]);
  items.push([<ClockIcon key="i" />, "Opening hours", <span>{s.hours || "We reply within one working day"}</span>, ""]);
  return (
    <>
      <Head title="Contact us" lead="Questions about a product, a size or your order? Send us a message or reach us directly. We are happy to help." />
      <div className="wrap sec2">
        <div className="contactgrid">
          <div>
            <h2 className="ch">Get in touch</h2>
            <ul className="clist">
              {items.map(([icon, title, body, note]) => (
                <li className="citem" key={title}><span className="cico">{icon}</span><div><span className="ct">{title}</span><div className="cv">{body}</div>{note && <p className="muted small">{note}</p>}</div></li>
              ))}
            </ul>
            {(s.facebook || s.instagram || s.whatsapp) && <><h3 className="ch2">Follow and message us</h3><SocialLinks s={s} colored /></>}
          </div>
          <div className="cform">
            <h2 className="ch" style={{ marginTop: 0 }}>Send us a message</h2>
            <p className="muted small" style={{ marginBottom: 18 }}>We usually reply within one working day.</p>
            <ContactForm />
          </div>
        </div>
        <div className="prose">
          <h2>Contacting us about an order?</h2>
          <p>Please keep your <b>order ID</b> and the <b>phone number</b> you used ready. It helps us find your order straight away.</p>
          <h2>Helpful links</h2>
          <ul>
            <li><Link className="link" href="/track">Track your order</Link></li>
            <li><Link className="link" href="/return-policy">Return and exchange policy</Link></li>
            <li><Link className="link" href="/#faq">Frequently asked questions</Link></li>
          </ul>
        </div>
      </div>
    </>
  );
}

function Returns({ s }) {
  return (
    <>
      <Head title="Return & exchange policy" lead="Simple rules, so you know exactly what to expect if something is not right." />
      <div className="wrap sec2">
        <div className="pbox"><div><b>3 days</b>to ask for an exchange after delivery</div><div><b>Free replacement</b>if the item is faulty or wrong</div><div><b>Unworn</b>with tags attached and unwashed</div></div>
        <div className="prose">
          <h2>Size exchange</h2>
          <p>If the size does not fit, contact us within 3 days of receiving your order. We will exchange it for another size, subject to stock.</p>
          <h2>Conditions</h2>
          <ul>
            <li>The item must be unworn and unwashed, with the original tags attached.</li>
            <li>It must be free from marks, odours and alterations.</li>
            <li>Items showing signs of wear or washing cannot be exchanged.</li>
          </ul>
          <h2>Faulty or wrong items</h2>
          <p>If your item arrives damaged, faulty or different from what you ordered, tell us within 3 days. Please share your order ID and a clear photo. We will replace it and cover all delivery charges.</p>
          <h2>How to request an exchange</h2>
          <ol>
            <li>Contact us by phone, WhatsApp or email{phoneOk(s.phone) ? <> (<a className="link" href={telLink(s.phone)}>{s.phone}</a>)</> : null} with your order ID, your phone number and the size you need.</li>
            <li>We confirm the size is available and tell you how to send the item back.</li>
            <li>After we receive and check the item, we send you the new size.</li>
          </ol>
          <h2>Delivery charges for exchanges</h2>
          <p>For size exchanges, the delivery charge for sending the new item is paid by the customer. For faulty or wrong items, we pay all delivery charges.</p>
          <h2>Refunds</h2>
          <p>If the size you need is out of stock, we will refund the price of the item. Refunds are sent to your bKash, Nagad or bank account after we receive and check the item. Delivery charges are refunded only when the item was faulty or wrong.</p>
          <h2>Cancelling an order</h2>
          <p>You can cancel an order before it is shipped. Call or message us with your order ID and we will cancel it.</p>
          <p style={{ marginTop: 28 }}>Questions about this policy? <Link className="link" href="/contact">Contact us</Link>.</p>
        </div>
      </div>
    </>
  );
}

function Privacy({ s }) {
  return (
    <>
      <Head title="Privacy policy" lead="What we collect when you order, why we need it and how we protect it." />
      <div className="wrap sec2">
        <div className="prose">
          <p className="muted small">Last updated: November 2026</p>
          <h2>What we collect</h2>
          <p>When you place an order we collect your name, phone number, email address, delivery address (division, district, thana and full address), any note you add, and the details of your order. You do not need an account, and we do not collect card details.</p>
          <h2>Why we collect it</h2>
          <ul>
            <li>To confirm, pack and deliver your order.</li>
            <li>To call you about your order and send confirmation and status emails.</li>
            <li>To help you with exchanges, returns and questions.</li>
          </ul>
          <h2>Who can see it</h2>
          <p>Our team can see your order details. Our delivery partners receive the name, phone number and address they need to deliver your parcel. We do not sell or rent your information to anyone. We may share it only if the law requires us to.</p>
          <h2>How we protect it</h2>
          <p>Your information is stored in a secured database with restricted access, and our admin area is protected by a private login. We keep order records for as long as we need them to support you and to meet our business and legal obligations.</p>
          <h2>Cookies and browser storage</h2>
          <p>Your cart and recent order details are saved in your own browser so they are not lost when you refresh the page. If we add analytics or advertising tools in the future, we will update this page.</p>
          <h2>Your choices</h2>
          <p>You can ask us to correct or delete your information by contacting us. We may need to keep some records where the law or our accounts require it.</p>
          <h2>Contact</h2>
          <p>Questions about privacy? Email <a className="link" href={`mailto:${s.email}`}>{s.email}</a>{phoneOk(s.phone) ? <> or call <a className="link" href={telLink(s.phone)}>{s.phone}</a></> : null}.</p>
        </div>
      </div>
    </>
  );
}

export default async function Info({ params }) {
  if (!pages[params.slug]) notFound();
  const s = await getSettings();
  const View = { about: About, contact: Contact, "return-policy": Returns, "privacy-policy": Privacy }[params.slug];
  return <View s={s} />;
}
