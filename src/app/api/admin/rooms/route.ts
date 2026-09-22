import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE, verifySession } from "@/lib/auth";
import { dbAvailable, prisma } from "@/lib/prisma";

async function requireAdmin() {
  const jar = await cookies();
  return verifySession(jar.get(ADMIN_COOKIE)?.value);
}

const PatchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(120).optional(),
  description: z.string().min(5).max(4000).optional(),
  maxGuests: z.coerce.number().int().min(1).max(20).optional(),
  bedConfig: z.string().max(120).optional(),
  sizeSqft: z.coerce.number().int().min(0).nullable().optional(),
  basePricePerNight: z.coerce.number().int().min(0).optional(),
  weekendPricePerNight: z.coerce.number().int().min(0).nullable().optional(),
  amenities: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await dbAvailable())) return NextResponse.json({ rooms: [], preview: true });
  const rooms = await prisma.room.findMany({
    include: { photos: { orderBy: { sortOrder: "asc" } }, _count: { select: { bookings: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ rooms });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await dbAvailable())) return NextResponse.json({ error: "No database." }, { status: 503 });
  const parsed = PatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid fields." }, { status: 422 });
  const { id, amenities, ...rest } = parsed.data;
  const room = await prisma.room.update({
    where: { id },
    data: { ...rest, ...(amenities ? { amenities: JSON.stringify(amenities) } : {}) },
  });
  return NextResponse.json({ ok: true, room });
}
