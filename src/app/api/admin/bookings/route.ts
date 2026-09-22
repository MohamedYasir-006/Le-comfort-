import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySession } from "@/lib/auth";
import { dbAvailable, prisma } from "@/lib/prisma";
import { bookingConfirmedEmail, sendEmail } from "@/lib/email";

async function requireAdmin() {
  const jar = await cookies();
  const email = verifySession(jar.get(ADMIN_COOKIE)?.value);
  return email;
}

// List bookings with filters
export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await dbAvailable())) return NextResponse.json({ bookings: [], preview: true });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const where = status && ["pending", "confirmed", "cancelled", "completed"].includes(status) ? { status: status as "pending" } : {};
  const bookings = await prisma.booking.findMany({
    where, include: { room: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" }, take: 200,
  });
  return NextResponse.json({ bookings });
}

// Confirm / cancel / complete a booking
export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await dbAvailable())) return NextResponse.json({ error: "No database." }, { status: 503 });
  const { id, action } = await req.json().catch(() => ({}));
  if (!id || !["confirm", "cancel", "complete"].includes(action))
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  const status = action === "confirm" ? "confirmed" : action === "cancel" ? "cancelled" : "completed";
  const booking = await prisma.booking.update({
    where: { id },
    data: {
      status,
      confirmedAt: action === "confirm" ? new Date() : undefined,
      cancelledAt: action === "cancel" ? new Date() : undefined,
    },
    include: { room: true },
  });
  try {
    if (action === "confirm") {
      await sendEmail({
        to: booking.guestEmail,
        subject: `Booking confirmed — ${booking.room.name}`,
        html: bookingConfirmedEmail(booking.guestName, booking.room.name, booking.checkIn.toISOString().slice(0, 10), booking.checkOut.toISOString().slice(0, 10)),
      });
    }
  } catch (e) { console.error("[admin-email]", e); }
  return NextResponse.json({ ok: true, booking });
}
