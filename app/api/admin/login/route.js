import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import { createSession, COOKIE_NAME, cookieOptions } from "@/lib/auth";
import { limited, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
const DUMMY = bcrypt.hashSync("not-a-real-password", 10); // keeps timing similar when the email is unknown

export async function POST(req) {
  if (limited("login:" + clientIp(req), 8, 10 * 60 * 1000)) return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  const b = await req.json().catch(() => null);
  const email = String(b?.email || "").trim().toLowerCase().slice(0, 120);
  const password = String(b?.password || "").slice(0, 200);
  try {
    await connectDB();
    const admin = await Admin.findOne({ email });
    const ok = await bcrypt.compare(password, admin ? admin.passwordHash : DUMMY);
    if (!admin || !ok) return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, await createSession(admin), cookieOptions);
    return res;
  } catch (e) {
    console.error("Login error:", e.message);
    return NextResponse.json({ error: "Login is not available. Check server settings." }, { status: 500 });
  }
}
