// Products, categories and settings now live in MongoDB (see lib/data.js).
export const SITE = { name: "FRENVIX", phone: "01XXXXXXXXX", email: "hello@frenvix.com" };
export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

// manual = customer sends money to our bKash/Nagad/Rocket number and types the Transaction ID (numbers are set in Admin > Settings).
// online = SSLCommerz card/net banking, shown only when the SSLC_* keys are set.
export const PAYMENT_METHODS = [
  { id: "COD", label: "Cash on delivery" },
  { id: "bKash", label: "bKash (send money)", manual: true },
  { id: "Nagad", label: "Nagad (send money)", manual: true },
  { id: "Rocket", label: "Rocket (send money)", manual: true },
  { id: "Online", label: "Pay online (card, net banking)", online: true },
];
export const taka = (n) => "৳" + Number(n).toLocaleString("en-US");
// Cloudinary images: let Cloudinary resize and compress them
export const cdn = (u, w = 900) => (u && u.includes("res.cloudinary.com") ? u.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${w}/`) : u);
