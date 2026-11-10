"use client";
import { useState } from "react";
import { garment } from "@/lib/garment";
import { cdn } from "@/lib/products";

// product needs: category, images[], colors[{name,hex}]
// If a photo cannot load (even without Cloudinary resizing), the illustration is shown instead.
export default function ProductImage({ product, color, ratio = "4/5", index = 0, width = 900, priority = false }) {
  const photo = product.images?.[index] || product.images?.[0];
  const [st, setSt] = useState({ url: "", level: 0 });
  const level = st.url === photo ? st.level : 0; // 0 = resized, 1 = original, 2 = failed
  const hex = product.colors?.find((c) => c.name === color)?.hex || product.colors?.[0]?.hex || "#8a8a8a";
  return (
    <div className="media" style={{ aspectRatio: ratio }}>
      {photo && level < 2 ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={level === 0 ? cdn(photo, width) : photo} alt={product.name} loading={priority ? "eager" : "lazy"} decoding="async" onError={() => setSt({ url: photo, level: level + 1 })} />
      ) : (
        <div className="ph" role="img" aria-label={`${product.name} in ${color || product.colors?.[0]?.name || ""}`} dangerouslySetInnerHTML={{ __html: garment(product.category, hex) }} />
      )}
    </div>
  );
}
