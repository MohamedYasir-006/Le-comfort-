import { prisma } from "./prisma";
import { priceForStay } from "./pricing";

export async function getRoomPricing(roomId: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { seasonalRates: true },
  });
  if (!room) return null;
  return {
    room,
    seasonal: room.seasonalRates.map((s) => ({
      startDate: s.startDate, endDate: s.endDate,
      pricePerNight: s.pricePerNight, minStayNights: s.minStayNights,
    })),
  };
}

// Race-safe availability check inside a transaction.
// A date is unavailable if in any pending/confirmed booking [checkIn, checkOut)
// or a BlockedDate. Callers should run createBooking in the same transaction.
export async function checkAvailabilityTx(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0] extends never ? never : any,
  roomId: string, checkIn: Date, checkOut: Date,
): Promise<{ available: boolean; reason?: string }> {
  const overlapping = await tx.booking.findFirst({
    where: {
      roomId,
      status: { in: ["pending", "confirmed"] },
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
  });
  if (overlapping) return { available: false, reason: "These dates are no longer available for this room." };
  const blocked = await tx.blockedDate.findFirst({
    where: { roomId, date: { gte: checkIn, lt: checkOut } },
  });
  if (blocked) return { available: false, reason: "These dates are blocked for maintenance." };
  return { available: true };
}

export async function createBookingRequest(input: {
  roomId: string; guestName: string; guestEmail: string; guestPhone: string;
  guestCount: number; checkIn: Date; checkOut: Date; notes?: string; source?: "direct" | "phone" | "walk_in";
}) {
  return prisma.$transaction(async (tx) => {
    const room = await tx.room.findUnique({
      where: { id: input.roomId }, include: { seasonalRates: true },
    });
    if (!room || !room.isActive) throw new Error("Room is not available.");
    if (input.guestCount > room.maxGuests) throw new Error(`This room sleeps up to ${room.maxGuests} guests.`);
    const avail = await checkAvailabilityTx(tx, input.roomId, input.checkIn, input.checkOut);
    if (!avail.available) throw new Error(avail.reason ?? "Dates unavailable.");
    const breakdown = priceForStay({
      checkIn: input.checkIn, checkOut: input.checkOut,
      base: room.basePricePerNight, weekend: room.weekendPricePerNight,
      seasonal: room.seasonalRates.map((s) => ({ startDate: s.startDate, endDate: s.endDate, pricePerNight: s.pricePerNight })),
    });
    if (breakdown.nights <= 0) throw new Error("Check-out must be after check-in.");
    // Enforce seasonal min-stay
    for (const s of room.seasonalRates) {
      if (s.minStayNights && input.checkIn <= s.endDate && input.checkOut > s.startDate && breakdown.nights < s.minStayNights)
        throw new Error(`This rate requires a minimum stay of ${s.minStayNights} nights.`);
    }
    const booking = await tx.booking.create({
      data: {
        roomId: input.roomId, guestName: input.guestName, guestEmail: input.guestEmail,
        guestPhone: input.guestPhone, guestCount: input.guestCount,
        checkIn: input.checkIn, checkOut: input.checkOut,
        status: "pending", totalAmount: breakdown.total,
        notes: input.notes, source: input.source ?? "direct",
      },
    });
    return { booking, total: breakdown.total, nights: breakdown.nights };
  });
}
