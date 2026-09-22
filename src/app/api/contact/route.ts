import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email";

const Schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional().default(""),
  message: z.string().min(5).max(2000),
});

export async function POST(req: Request) {
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please fill name, a valid email, and a message." }, { status: 422 });
  const v = parsed.data;
  const to = process.env.ADMIN_EMAIL ?? process.env.SMTP_USER ?? "";
  try {
    if (to) await sendEmail({ to, subject: `Website enquiry — ${v.name}`, html: `<p>From ${v.name} (${v.email}, ${v.phone})</p><p>${v.message.replace(/</g, "&lt;")}</p>` });
    else console.log("[contact:dev-log]", v);
  } catch (e) { console.error(e); }
  return NextResponse.json({ ok: true });
}
