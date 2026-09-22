import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.redirect(process.env.NEXT_PUBLIC_BASE_URL ?? "/admin/login");
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
