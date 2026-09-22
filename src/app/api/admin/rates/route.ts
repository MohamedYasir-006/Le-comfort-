import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE, verifySession } from "@/lib/auth";
import { dbAvailable, prisma } from "@/lib/prisma";

async function requireAdmin() {
  const jar = await cookies();
  return verifySession(jar.get(ADMIN_COOKIE)?.value);
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await dbAvailable())) return NextResponse.json({ rates: [], preview: true });
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  const rates = await prisma.seasonalRate.findMany({
    where: roomId ? { roomId } : {},
    include: { room: { select: { name: true } } },
    orderBy: { startDate: "asc" }, take: 200,
  });
  return NextResponse.json({ rates });
}

const PostSchema = z.object({
  roomId: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pricePerNight: z.coerce.number().int().min(0),
  minStayNights: z.coerce.number().int().min(1).nullable().optional(),
});

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await dbAvailable())) return NextResponse.json({ error: "No database." }, { status: 503 });
  const parsed = PostSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid fields." }, { status: 422 });
  const v = parsed.data;
  if (new Date(v.endDate) < new Date(v.startDate))
    return NextResponse.json({ error: "End date must be after start date." }, { status: 422 });
  const rate = await prisma.seasonalRate.create({
    data: {
      roomId: v.roomId,
      startDate: new Date(v.startDate + "T00:00:00Z"),
      endDate: new Date(v.endDate + "T00:00:00Z"),
      pricePerNight: v.pricePerNight,
      minStayNights: v.minStayNights ?? null,
    },
  });
  return NextResponse.json({ ok: true, rate });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await dbAvailable())) return NextResponse.json({ error: "No database." }, { status: 503 });
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  await prisma.seasonalRate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
