// Helpers for SEO: site address and structured data (JSON-LD).
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export const orgJsonLd = (s) => ({
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": siteUrl() + "/#website", url: siteUrl(), name: "FRENVIX", inLanguage: "en-BD" },
    {
      "@type": "Organization",
      "@id": siteUrl() + "/#org",
      name: "FRENVIX",
      url: siteUrl(),
      logo: siteUrl() + "/logo.png",
      email: s.email || undefined,
      telephone: s.phone && !/X/.test(s.phone) ? s.phone : undefined,
      areaServed: "BD",
      address: { "@type": "PostalAddress", streetAddress: s.address || undefined, addressLocality: s.homeDistrict || undefined, addressCountry: "BD" },
      sameAs: [s.facebook, s.instagram].filter(Boolean),
    },
  ],
});

export const breadcrumbJsonLd = (p) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl() },
    { "@type": "ListItem", position: 2, name: p.category, item: `${siteUrl()}/shop?cat=${encodeURIComponent(p.category)}` },
    { "@type": "ListItem", position: 3, name: p.name, item: `${siteUrl()}/product/${p.slug}` },
  ],
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
    color: (p.colors || []).map((c) => c.name).join(", ") || undefined,
    material: p.fabric || undefined,
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
