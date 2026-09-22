import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySession } from "@/lib/auth";
import { dbAvailable, prisma } from "@/lib/prisma";

async function requireAdmin() {
  const jar = await cookies();
  return verifySession(jar.get(ADMIN_COOKIE)?.value);
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await dbAvailable())) return NextResponse.json({ reviews: [], preview: true });
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter"); // pending | all
  const reviews = await prisma.review.findMany({
    where: filter === "pending" ? { isApproved: false } : {},
    include: { room: { select: { name: true } } },
    orderBy: { createdAt: "desc" }, take: 200,
  });
  return NextResponse.json({ reviews });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await dbAvailable())) return NextResponse.json({ error: "No database." }, { status: 503 });
  const { id, action } = await req.json().catch(() => ({}));
  if (!id || !["approve", "unapprove"].includes(action))
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  const review = await prisma.review.update({ where: { id }, data: { isApproved: action === "approve" } });
  return NextResponse.json({ ok: true, review });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await dbAvailable())) return NextResponse.json({ error: "No database." }, { status: 503 });
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
