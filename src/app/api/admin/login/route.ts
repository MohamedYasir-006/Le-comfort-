import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, signSession, verifyAdminCredentials } from "@/lib/auth";

export async function POST(req: Request) {
  const ct = req.headers.get("content-type") ?? "";
  let email = "", password = "";
  if (ct.includes("application/json")) {
    const b = await req.json().catch(() => null);
    email = b?.email ?? ""; password = b?.password ?? "";
  } else {
    const form = await req.formData().catch(() => null);
    email = String(form?.get("email") ?? ""); password = String(form?.get("password") ?? "");
  }
  if (!(await verifyAdminCredentials(email, password))) {
    if (ct.includes("application/json")) return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    return NextResponse.redirect(new URL("/admin/login?error=1", req.url));
  }
  const res = ct.includes("application/json")
    ? NextResponse.json({ ok: true })
    : NextResponse.redirect(new URL("/admin", req.url));
  res.cookies.set(ADMIN_COOKIE, signSession(email), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: ADMIN_COOKIE_MAX_AGE });
  return res;
}
