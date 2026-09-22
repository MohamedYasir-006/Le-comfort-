import { notFound } from "next/navigation";
import RoomDetailClient from "./RoomDetailClient";
import { PLACEHOLDER_ROOMS } from "@/lib/data";
import { dbAvailable, prisma } from "@/lib/prisma";

async function getRoom(slug: string) {
  if (await dbAvailable()) {
    try {
      const r = await prisma.room.findUnique({
        where: { slug },
        include: {
          photos: { orderBy: { sortOrder: "asc" } },
          seasonalRates: true,
          reviews: { where: { isApproved: true }, orderBy: { createdAt: "desc" } },
        },
      });
      if (r)
        return {
          id: r.id, name: r.name, slug: r.slug, description: r.description,
          maxGuests: r.maxGuests, bedConfig: r.bedConfig, sizeSqft: r.sizeSqft,
          basePricePerNight: r.basePricePerNight, weekendPricePerNight: r.weekendPricePerNight,
          amenities: JSON.parse(r.amenities) as string[], floorPlanUrl: r.floorPlanUrl,
          isActive: r.isActive,
          photos: r.photos.map((p) => ({ url: p.url, altText: p.altText, category: p.category })),
          seasonalRates: r.seasonalRates.map((s) => ({
            startDate: s.startDate.toISOString(), endDate: s.endDate.toISOString(),
            pricePerNight: s.pricePerNight, minStayNights: s.minStayNights,
          })),
          reviews: r.reviews.map((v) => ({ guestName: v.guestName, rating: v.rating, comment: v.comment })),
        };
    } catch { /* fallback */ }
  }
  const r = PLACEHOLDER_ROOMS.find((x) => x.slug === slug);
  if (!r) return null;
  return { ...r, seasonalRates: [], reviews: [] };
}

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ checkin?: string; checkout?: string; guests?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const room = await getRoom(slug);
  if (!room || (room as { isActive?: boolean }).isActive === false) notFound();
  return <RoomDetailClient room={room} initialCheckin={sp.checkin ?? ""} initialCheckout={sp.checkout ?? ""} initialGuests={sp.guests ?? "2"} />;
}
