import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const COOKIE_NAME = "frx_admin";
export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

const key = () => {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32)
    throw new Error("AUTH_SECRET is missing or shorter than 32 characters");
  return new TextEncoder().encode(s);
};

export const createSession = (admin) =>
  new SignJWT({ email: admin.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(admin._id))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key());

export async function getAdmin() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return (await jwtVerify(token, key())).payload;
  } catch {
    return null;
  }
}

// Blocks requests coming from other websites (extra CSRF protection)
export const sameOrigin = (req) => {
  const o = req.headers.get("origin");
  return !o || new URL(o).host === req.headers.get("host");
};
