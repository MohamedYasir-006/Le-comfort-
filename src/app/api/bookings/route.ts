import { NextResponse } from "next/server";
import { z } from "zod";
import { createBookingRequest } from "@/lib/bookings";
import { dbAvailable, prisma } from "@/lib/prisma";
import { bookingReceivedEmail, sendEmail, sendSms } from "@/lib/email";
import { SITE } from "@/lib/site";

const Schema = z.object({
  roomSlug: z.string().min(1),
  guestName: z.string().min(2).max(100),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(7).max(20),
  guestCount: z.coerce.number().int().min(1).max(12),
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(1000).optional().default(""),
  agree: z.literal(true, { message: "Please agree to the terms and cancellation policy." }),
});

function ist(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });
}

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? "form")] = issue.message;
    return NextResponse.json({ error: "Please fix the highlighted fields.", fieldErrors }, { status: 422 });
  }
  const v = parsed.data;

  if (!(await dbAvailable())) {
    // Preview mode: simulate a held booking without a database.
    const id = `preview-${Date.now().toString(36)}`;
    return NextResponse.json({
      ok: true, preview: true, id, manageToken: id,
      manageUrl: `/manage/${id}?preview=1`,
      message: "Preview mode — connect DATABASE_URL to hold real dates.",
    });
  }

  const room = await prisma.room.findUnique({ where: { slug: v.roomSlug } });
  if (!room || !room.isActive) return NextResponse.json({ error: "Room is not available." }, { status: 404 });

  try {
    const { booking } = await createBookingRequest({
      roomId: room.id, guestName: v.guestName.trim(), guestEmail: v.guestEmail.trim(),
      guestPhone: v.guestPhone.trim(), guestCount: v.guestCount,
      checkIn: new Date(v.checkin + "T00:00:00Z"), checkOut: new Date(v.checkout + "T00:00:00Z"),
      notes: v.notes?.trim() || undefined,
    });

    // Notify guest + admin (never fail the booking on email errors)
    const ci = ist(v.checkin), co = ist(v.checkout);
    try {
      await sendEmail({ to: booking.guestEmail, subject: `Request received — ${room.name} (${booking.id.slice(-6)})`, html: bookingReceivedEmail(booking.guestName, room.name, ci, co, booking.id) });
      if (process.env.ADMIN_EMAIL)
        await sendEmail({ to: process.env.ADMIN_EMAIL, subject: `New booking request — ${room.name}`, html: `<p>${booking.guestName} (${booking.guestPhone}) requested ${room.name}, ${ci} → ${co}. <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/admin">Open dashboard</a></p>` });
      await sendSms(booking.guestPhone, `Le Comfort: request received for ${room.name}, ${ci}-${co}. We confirm within ${SITE.confirmWithinHours}.`);
    } catch (e) { console.error("[booking-email]", e); }

    return NextResponse.json({ ok: true, id: booking.id, manageToken: booking.manageToken, manageUrl: `/manage/${booking.manageToken}`, totalAmount: booking.totalAmount });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not create booking.";
    const status = /no longer available|blocked|minimum stay|sleeps|after check-in/i.test(msg) ? 409 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
