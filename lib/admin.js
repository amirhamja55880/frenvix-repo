export const STATUSES = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];
export const fmtDate = (d) =>
  new Date(d).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  });
// Start of "today" in Bangladesh time (UTC+6), as a Date
export const bdStartOfToday = () => {
  const bd = new Date(Date.now() + 6 * 3600e3);
  bd.setUTCHours(0, 0, 0, 0);
  return new Date(bd.getTime() - 6 * 3600e3);
};
export const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
