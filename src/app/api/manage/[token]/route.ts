import { NextResponse } from "next/server";
import { prisma, dbAvailable } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!(await dbAvailable())) return NextResponse.json({ error: "Unavailable." }, { status: 503 });
  const booking = await prisma.booking.findUnique({ where: { manageToken: token } });
  if (!booking) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (booking.status !== "pending" && booking.status !== "confirmed")
    return NextResponse.json({ error: `Already ${booking.status}.` }, { status: 409 });
  await prisma.booking.update({ where: { id: booking.id }, data: { status: "cancelled", cancelledAt: new Date() } });
  return NextResponse.json({ ok: true });
}
