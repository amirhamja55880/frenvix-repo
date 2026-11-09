"use client";
import { useState } from "react";

// Put your logo in the "public" folder as logo.svg (best) or logo.png.
// If neither file exists, the FRENVIX text is shown instead.
const FILES = ["/logo.svg", "/logo.png"];

export default function Logo({ height = 28, text = "FRENVIX" }) {
  const [i, setI] = useState(0);
  if (i >= FILES.length) return <span>{text}</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={FILES[i]} alt={text} style={{ display: "block", height, width: "auto" }}
      ref={(el) => { if (el && el.complete && el.naturalWidth === 0) setI(i + 1); }}
      onError={() => setI(i + 1)}
    />
  );
}
