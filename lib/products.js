// Products, categories and settings now live in MongoDB (see lib/data.js).
export const SITE = { name: "FRENVIX", phone: "01XXXXXXXXX", email: "hello@frenvix.com" };
export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

// "Online" = SSLCommerz (bKash, Nagad, Rocket, cards, net banking). It is shown only when the SSLC_* keys are set.
export const PAYMENT_METHODS = [
  { id: "Online", label: "Pay online (bKash, Nagad, Rocket, Card)", online: true },
  { id: "COD", label: "Cash on delivery" },
];
export const taka = (n) => "৳" + Number(n).toLocaleString("en-US");
// Cloudinary images: let Cloudinary resize and compress them
export const cdn = (u, w = 900) => (u && u.includes("res.cloudinary.com") ? u.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${w}/`) : u);
