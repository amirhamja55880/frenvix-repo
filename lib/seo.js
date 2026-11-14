// Helpers for SEO: site address and structured data (JSON-LD).
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export const orgJsonLd = (s) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FRENVIX",
  url: siteUrl(),
  logo: siteUrl() + "/logo.png",
  email: s.email || undefined,
  telephone: s.phone && !/X/.test(s.phone) ? s.phone : undefined,
  sameAs: [s.facebook, s.instagram].filter(Boolean),
});

export const productJsonLd = (p) => {
  const inStock = p.variants?.some((v) => v.stock > 0);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description || undefined,
    image: (p.images || []).slice(0, 5),
    sku: p.slug,
    brand: { "@type": "Brand", name: "FRENVIX" },
    category: p.category || undefined,
    offers: {
      "@type": "Offer",
      url: `${siteUrl()}/product/${p.slug}`,
      priceCurrency: "BDT",
      price: String(p.price),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
};
