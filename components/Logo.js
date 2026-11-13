"use client";
import { useState } from "react";

// Logo picture + brand name. All sizes are set here, so a different logo file can never break the layout.
// Real logo files go in:  public/logo.png (dark, for white backgrounds)  and  public/logo-light.png (light, for dark backgrounds)
export default function Logo({ height = 30, text = "FRENVIX", variant = "dark" }) {
  const [bad, setBad] = useState(false);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, lineHeight: 1, whiteSpace: "nowrap" }}>
      {!bad && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={variant === "light" ? "/logo-light.png" : "/logo.png"} alt=""
          style={{ display: "block", flex: "none", height, width: "auto", maxWidth: height * 2, objectFit: "contain" }}
          ref={(el) => { if (el && el.complete && el.naturalWidth === 0) setBad(true); }}
          onError={() => setBad(true)}
        />
      )}
      <span>{text}</span>
    </span>
  );
}
