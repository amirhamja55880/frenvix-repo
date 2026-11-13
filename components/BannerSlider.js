"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cdn } from "@/lib/products";

// Full-width home banner. Only the pictures are shown, no text is added by the website.
export default function BannerSlider({ banners }) {
  const n = banners.length;
  const [i, setI] = useState(0);
  const [pause, setPause] = useState(false);
  const [x0, setX0] = useState(null);
  const go = (d) => setI((x) => (x + d + n) % n);

  useEffect(() => {
    if (n < 2 || pause) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 5500);
    return () => clearInterval(t);
  }, [n, pause]);

  if (!n) return <section className="bn" aria-hidden="true"><div className="bn-empty"><img src="/logo-light.png" alt="" /></div></section>;

  const allMobile = banners.every((b) => b.mobileImage);
  return (
    <section
      className="bn" style={{ "--m-ratio": allMobile ? "4 / 5" : "16 / 9" }} aria-roledescription="carousel" aria-label="Featured"
      onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}
      onTouchStart={(e) => setX0(e.touches[0].clientX)}
      onTouchEnd={(e) => { if (x0 !== null && n > 1) { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); } setX0(null); }}
    >
      <div className="bn-track" style={{ transform: `translateX(-${i * 100}%)` }}>
        {banners.map((b, k) => {
          const pic = (
            <picture>
              {b.mobileImage && <source media="(max-width: 700px)" srcSet={cdn(b.mobileImage, 900)} />}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cdn(b.image, 1800)} alt={b.alt || ""} loading={k === 0 ? "eager" : "lazy"} decoding="async" />
            </picture>
          );
          const internal = b.link && b.link.startsWith("/");
          return (
            <div className="bn-slide" key={b.id} aria-hidden={k !== i}>
              {!b.link ? pic : internal ? <Link href={b.link} tabIndex={k === i ? 0 : -1}>{pic}</Link> : <a href={b.link} target="_blank" rel="noopener noreferrer" tabIndex={k === i ? 0 : -1}>{pic}</a>}
            </div>
          );
        })}
      </div>
      {n > 1 && (
        <>
          <button className="bn-arrow bn-prev" onClick={() => go(-1)} aria-label="Previous banner">‹</button>
          <button className="bn-arrow bn-next" onClick={() => go(1)} aria-label="Next banner">›</button>
          <div className="bn-dots">{banners.map((b, k) => <button key={b.id} className={k === i ? "on" : ""} onClick={() => setI(k)} aria-label={`Banner ${k + 1}`} />)}</div>
        </>
      )}
    </section>
  );
}
