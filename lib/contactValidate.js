export const TOPICS = ["Order help", "Product or size question", "Exchange or return", "Other"];

const one = (s, n) => String(s ?? "").replace(/[<>\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, n);

export function validateContact(b) {
  const data = {
    name: one(b?.name, 80), phone: one(b?.phone, 11), email: one(b?.email, 120).toLowerCase(), subject: one(b?.subject, 40),
    orderId: one(b?.orderId, 20).toUpperCase(),
    message: String(b?.message ?? "").replace(/[<>\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, 1000),
  };
  const errors = {};
  if (data.name.length < 2) errors.name = "Enter your name.";
  if (data.phone && !/^01[3-9]\d{8}$/.test(data.phone)) errors.phone = "Enter a valid 11-digit mobile number.";
  if (data.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) errors.email = "Enter a valid email address.";
  if (!data.phone && !data.email) errors.phone = "Give a phone number or an email so we can reply.";
  if (!TOPICS.includes(data.subject)) errors.subject = "Choose a topic.";
  if (data.orderId && !/^FRX-[A-Z0-9]{4,12}$/.test(data.orderId)) errors.orderId = "Order IDs look like FRX-ABC12345.";
  if (data.message.length < 10) errors.message = "Please write at least 10 characters.";
  return { errors, data, ok: Object.keys(errors).length === 0 };
}
