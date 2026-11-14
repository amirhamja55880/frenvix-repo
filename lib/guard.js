import { NextResponse } from "next/server";
import { getAdmin, sameOrigin } from "@/lib/auth";

// Returns an error response if the request is not from a logged-in admin on our own site, otherwise null.
export async function adminGuard(req) {
  if (!(await getAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}
