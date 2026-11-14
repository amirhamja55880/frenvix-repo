import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { validateContact } from "@/lib/contactValidate";
import { sendContactEmail, sendContactReceipt } from "@/lib/email";
import { limited, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req) {
  if (limited("contact:" + clientIp(req), 4, 10 * 60 * 1000)) return NextResponse.json({ error: "Too many messages. Please try again in a few minutes." }, { status: 429 });
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (b.website) return NextResponse.json({ ok: true }); // hidden trap field filled in: a bot, pretend it worked
  const { errors, data, ok } = validateContact(b);
  if (!ok) return NextResponse.json({ error: Object.values(errors)[0] }, { status: 400 });
  try {
    await connectDB();
    const doc = await Message.create(data); // saved first, so it is never lost even if the email fails
    const results = await Promise.allSettled([sendContactEmail(doc), sendContactReceipt(doc)]);
    results.forEach((r) => r.status === "rejected" && console.error("Contact email error:", r.reason?.message));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Contact error:", e.message);
    return NextResponse.json({ error: "Could not send your message. Please call us or try again." }, { status: 500 });
  }
}
