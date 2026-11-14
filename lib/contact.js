// A phone number counts as "real" only when it has digits (the sample "01XXXXXXXXX" does not).
export const phoneOk = (p) => /^\+?[\d][\d\s-]{6,}$/.test(String(p || "").trim());
export const telLink = (n) => `tel:${String(n).replace(/[^\d+]/g, "")}`;
export const waLink = (n) => {
  const d = String(n || "").replace(/\D/g, "");
  if (!d) return "";
  return `https://wa.me/${d.startsWith("880") ? d : d.startsWith("0") ? "88" + d : "880" + d}`;
};
