import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";
import { getSettings } from "@/lib/data";
import { SITE, taka } from "@/lib/products";

export const metadata = {
  title: "About us",
  description:
    "FRENVIX was started by two friends, still students, from home. Our goal: grow from a student startup into a brand known across Bangladesh.",
};

const VALUES = [
  {
    t: "Quality first",
    en: "Thick, soft cotton and clean stitching. We would rather sell fewer pieces than sell something we would not wear ourselves.",
    bn: "মোটা, নরম কটন আর পরিষ্কার সেলাই। যা আমরা নিজেরা পরব না, তা আমরা বেচব না।",
  },
  {
    t: "Honest & simple",
    en: "No account needed. Pay when your order arrives. Clear prices, clear delivery charge.",
    bn: "অ্যাকাউন্ট লাগবে না। পণ্য হাতে পেয়ে টাকা দিন। দাম ও ডেলিভারি চার্জ পরিষ্কার।",
  },
  {
    t: "Built by students",
    en: "We are learning, listening and improving with every order. Your feedback shapes what we make next.",
    bn: "প্রতিটি অর্ডার থেকে আমরা শিখছি। আপনার মতামতই ঠিক করে দেয় আমরা পরে কী বানাব।",
  },
];

export default async function About() {
  const s = await getSettings();
  return (
    <>
      <section className="hero abouthero">
        <div className="wrap narrow2">
          <p className="eyebrow">About {SITE.name}</p>
          <h1>Two friends. One idea. Started from home.</h1>
          <p className="bn">দুই বন্ধু, একটি স্বপ্ন। শুরু হয়েছে বাসা থেকে।</p>
        </div>
      </section>

      <section className="wrap section narrow2">
        <h2 className="h2">Our story</h2>
        <p className="desc big2">
          {SITE.name} was started by two friends who are still students. We do
          not have a shop yet. We began from our own homes, with one belief: you
          do not need to wait until you are &ldquo;big&rdquo; to build something
          good.
        </p>
        <p className="desc big2 bn">
          আমরা দুই বন্ধু, এখনো ছাত্র। আমাদের কোনো দোকান নেই, আমরা নিজেদের বাসা
          থেকেই শুরু করেছি। আমাদের বিশ্বাস, ভালো কিছু বানাতে বড় হওয়া পর্যন্ত
          অপেক্ষা করতে হয় না।
        </p>
        <blockquote className="goal">
          <b>Our goal</b>
          <span>
            Start as students. Grow into a brand people across Bangladesh trust.
          </span>
          <span className="bn">
            ছাত্রাবস্থা থেকে শুরু করে বড় পরিসরে পৌঁছানোই আমাদের লক্ষ্য।
          </span>
        </blockquote>
      </section>

      <section className="wrap section">
        <h2 className="h2">What we stand for</h2>
        <div className="vals">
          {VALUES.map((v) => (
            <div key={v.t} className="val">
              <h3>{v.t}</h3>
              <p>{v.en}</p>
              <p className="muted bn">{v.bn}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section">
        <div className="trust">
          <div>
            <b>Cash on delivery</b>
            <p className="muted">Pay the courier when your order arrives.</p>
          </div>
          <div>
            <b>Delivery across Bangladesh</b>
            <p className="muted">
              {taka(s.deliveryInsideKhulna)} inside {s.homeDistrict},{" "}
              {taka(s.deliveryOutsideKhulna)} outside.
            </p>
          </div>
          <div>
            <b>Easy size exchange</b>
            <p className="muted">Wrong size? Exchange within 3 days.</p>
          </div>
        </div>
      </section>

      <section className="wrap section narrow2 connect">
        <h2 className="h2">Follow our journey</h2>
        <p className="desc">
          We share new drops and our growth story as it happens. Come grow with
          us.
        </p>
        <p className="desc bn">
          নতুন কালেকশন ও আমাদের পথচলার খবর পেতে আমাদের সাথে থাকুন।
        </p>
        <SocialLinks email={s.email} />
        <div
          className="actions"
          style={{ marginTop: 28, justifyContent: "center" }}
        >
          <Link className="btn dark" href="/shop">
            Shop now
          </Link>
          <Link className="btn outline" href="/contact">
            Contact us
          </Link>
        </div>
      </section>
    </>
  );
}
