import RoomCard from "@/components/RoomCard";
import AvailabilitySearch from "@/components/AvailabilitySearch";
import { PLACEHOLDER_ROOMS } from "@/lib/data";
import { dbAvailable, prisma } from "@/lib/prisma";

async function getRooms() {
  if (await dbAvailable()) {
    try {
      const rooms = await prisma.room.findMany({
        where: { isActive: true },
        include: { photos: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      });
      if (rooms.length)
        return rooms.map((r) => ({
          id: r.id, name: r.name, slug: r.slug, description: r.description,
          maxGuests: r.maxGuests, bedConfig: r.bedConfig, sizeSqft: r.sizeSqft,
          basePricePerNight: r.basePricePerNight, weekendPricePerNight: r.weekendPricePerNight,
          amenities: JSON.parse(r.amenities) as string[], floorPlanUrl: r.floorPlanUrl,
          isActive: r.isActive,
          photos: r.photos.map((p) => ({ url: p.url, altText: p.altText, category: p.category })),
        }));
    } catch { /* fallback */ }
  }
  return PLACEHOLDER_ROOMS;
}

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<{ checkin?: string; checkout?: string; guests?: string }>;
}) {
  const sp = await searchParams;
  const rooms = await getRooms();
  const guests = Number(sp.guests ?? 0);
  const filtered = guests > 0 ? rooms.filter((r) => r.maxGuests >= guests) : rooms;

  return (
    <div className="pt-28">
      <div className="mx-auto max-w-6xl px-5">
        <h1 className="text-center font-serif text-5xl font-light">Rooms</h1>
        <p className="mt-2 text-center text-sm tracking-[0.2em] text-neutral-500 uppercase">
          {sp.checkin && sp.checkout ? `${sp.checkin} → ${sp.checkout}` : "Choose your dates to see totals"}
        </p>
        <div id="search" className="mt-8 scroll-mt-28">
          <AvailabilitySearch compact />
        </div>
        {guests > 0 && (
          <p className="mt-6 text-center text-sm text-neutral-600">
            Showing rooms for {guests} guest{guests > 1 ? "s" : ""} · {filtered.length} of {rooms.length}
          </p>
        )}
        <div className="grid gap-12 py-12 md:grid-cols-3">
          {filtered.map((r) => <RoomCard key={r.id} room={r} checkin={sp.checkin} checkout={sp.checkout} />)}
        </div>
        {filtered.length === 0 && (
          <p className="pb-16 text-center text-neutral-600">
            No rooms fit {guests} guests. Call us — we may arrange extra bedding.
          </p>
        )}
      </div>
    </div>
  );
}
