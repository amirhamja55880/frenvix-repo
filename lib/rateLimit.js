// Simple in-memory limiter. On Vercel each serverless instance has its own memory,
// so this is best-effort protection. Upgrade to Upstash Redis later for strict limits.
const hits = new Map();
export function limited(key, max, windowMs) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > max;
}
export const clientIp = (req) =>
  (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
