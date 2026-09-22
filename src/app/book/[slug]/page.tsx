import { notFound } from "next/navigation";
import BookForm from "./BookForm";
import { PLACEHOLDER_ROOMS } from "@/lib/data";
import { dbAvailable, prisma } from "@/lib/prisma";

async function getRoom(slug: string) {
  if (await dbAvailable()) {
    try {
      const r = await prisma.room.findUnique({ where: { slug } });
      if (r) return { name: r.name, slug: r.slug, base: r.basePricePerNight, weekend: r.weekendPricePerNight, maxGuests: r.maxGuests };
    } catch { /* fallback */ }
  }
  const r = PLACEHOLDER_ROOMS.find((x) => x.slug === slug);
  if (!r) return null;
  return { name: r.name, slug: r.slug, base: r.basePricePerNight, weekend: r.weekendPricePerNight, maxGuests: r.maxGuests };
}

export default async function BookPage({
  params, searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ checkin?: string; checkout?: string; guests?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const room = await getRoom(slug);
  if (!room) notFound();
  return (
    <div className="mx-auto max-w-6xl px-5 pt-28 pb-16">
      <p className="text-center text-xs tracking-[0.3em] text-neutral-500 uppercase">Request to book · no online payment</p>
      <h1 className="mt-2 text-center font-serif text-5xl font-light">{room.name}</h1>
      <div className="mt-10">
        <BookForm roomSlug={room.slug} roomName={room.name} base={room.base} weekend={room.weekend} maxGuests={room.maxGuests}
          initial={{ checkin: sp.checkin ?? "", checkout: sp.checkout ?? "", guests: sp.guests ?? "2" }} />
      </div>
    </div>
  );
}
