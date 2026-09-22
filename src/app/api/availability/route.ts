import { NextResponse } from "next/server";
import { prisma, dbAvailable } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId") ?? searchParams.get("roomSlug") ?? "";
  const checkin = searchParams.get("checkin") ?? searchParams.get("checkIn") ?? "";
  const checkout = searchParams.get("checkout") ?? searchParams.get("checkOut") ?? "";
  if (!roomId || !checkin || !checkout)
    return NextResponse.json({ available: false, reason: "Missing roomId/checkin/checkout." }, { status: 400 });

  const ci = new Date(checkin);
  const co = new Date(checkout);
  if (isNaN(ci.getTime()) || isNaN(co.getTime()) || co <= ci)
    return NextResponse.json({ available: false, reason: "Invalid date range." }, { status: 400 });

  if (!(await dbAvailable())) {
    // Preview mode without DB: always available, no blocked dates.
    return NextResponse.json({ available: true, blockedDates: [], preview: true });
  }

  // Resolve slug -> id if needed
  let id = roomId;
  const room = (await prisma.room.findFirst({ where: { OR: [{ id: roomId }, { slug: roomId }] } }));
  if (!room) return NextResponse.json({ available: false, reason: "Room not found." }, { status: 404 });
  id = room.id;

  const overlapping = await prisma.booking.findMany({
    where: {
      roomId: id, status: { in: ["pending", "confirmed"] },
      checkIn: { lt: co }, checkOut: { gt: ci },
    },
    select: { checkIn: true, checkOut: true },
  });
  const blocked = await prisma.blockedDate.findMany({
    where: { roomId: id, date: { gte: ci, lt: co } },
    select: { date: true },
  });
  const available = overlapping.length === 0 && blocked.length === 0;
  return NextResponse.json({
    available,
    reason: available ? undefined : "These dates are no longer available for this room.",
    blockedDates: blocked.map((b) => b.date.toISOString().slice(0, 10)),
    overlapping: overlapping.map((o) => ({ checkIn: o.checkIn, checkOut: o.checkOut })),
  });
}
