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
  if (!(await dbAvailable())) return NextResponse.json({ blocked: [], preview: true });
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  const blocked = await prisma.blockedDate.findMany({
    where: roomId ? { roomId } : {},
    include: { room: { select: { name: true } } },
    orderBy: { date: "asc" }, take: 500,
  });
  return NextResponse.json({ blocked });
}

const PostSchema = z.object({
  roomId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(200).optional().default("manually blocked"),
});

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await dbAvailable())) return NextResponse.json({ error: "No database." }, { status: 503 });
  const parsed = PostSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid fields." }, { status: 422 });
  const entry = await prisma.blockedDate.upsert({
    where: { roomId_date: { roomId: parsed.data.roomId, date: new Date(parsed.data.date + "T00:00:00Z") } },
    update: { reason: parsed.data.reason },
    create: { roomId: parsed.data.roomId, date: new Date(parsed.data.date + "T00:00:00Z"), reason: parsed.data.reason },
  });
  return NextResponse.json({ ok: true, entry });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await dbAvailable())) return NextResponse.json({ error: "No database." }, { status: 503 });
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  await prisma.blockedDate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
