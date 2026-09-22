import { NextResponse } from "next/server";
import { z } from "zod";
import { dbAvailable, prisma } from "@/lib/prisma";

const Schema = z.object({
  guestName: z.string().min(1).max(60),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(600),
  roomId: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid review." }, { status: 422 });
  if (!(await dbAvailable())) return NextResponse.json({ ok: true, preview: true });
  await prisma.review.create({ data: { ...parsed.data, isApproved: false } });
  return NextResponse.json({ ok: true });
}
