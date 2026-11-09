import { garment } from "@/lib/garment";
import { cdn } from "@/lib/products";

// product needs: category, images[], colors[{name,hex}]
export default function ProductImage({ product, color, ratio = "4/5", index = 0, width = 900 }) {
  const photo = product.images?.[index] || product.images?.[0];
  const hex = product.colors?.find((c) => c.name === color)?.hex || product.colors?.[0]?.hex || "#8a8a8a";
  return (
    <div className="media" style={{ aspectRatio: ratio }}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cdn(photo, width)} alt={product.name} loading="lazy" />
      ) : (
        <div className="ph" role="img" aria-label={`${product.name} in ${color || product.colors?.[0]?.name || ""}`} dangerouslySetInnerHTML={{ __html: garment(product.category, hex) }} />
      )}
    </div>
  );
}
