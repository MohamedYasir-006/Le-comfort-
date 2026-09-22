// Placeholder catalogue used when DATABASE_URL is not configured (local preview)
// and as seed data. Replace with real rooms/prices/photos from the owner.
// Photos use Unsplash source URLs so the UI is photography-led out of the box.

export type RoomDTO = {
  id: string;
  name: string;
  slug: string;
  description: string;
  maxGuests: number;
  bedConfig: string;
  sizeSqft: number | null;
  basePricePerNight: number;
  weekendPricePerNight: number | null;
  amenities: string[];
  floorPlanUrl: string | null;
  isActive: boolean;
  photos: { url: string; altText: string; category: string }[];
};

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

export const PLACEHOLDER_ROOMS: RoomDTO[] = [
  {
    id: "room-standard",
    name: "Standard Room",
    slug: "standard-room",
    description:
      "A clean, comfortable room for couples and solo travellers — a cosy queen bed, attached bath, and easy access to the front desk team. A short walk from Nagore Dargah Shariff.",
    maxGuests: 2,
    bedConfig: "1 Queen Bed",
    sizeSqft: 220, // PLACEHOLDER — owner to confirm
    basePricePerNight: 1999, // PLACEHOLDER price
    weekendPricePerNight: null,
    amenities: ["Free WiFi", "Room Service", "Front Desk Support", "Parking"],
    floorPlanUrl: null,
    isActive: true,
    photos: [
      { url: img("photo-1596394516093-501ba68a0ba6"), altText: "Standard Room — beds", category: "room" },
      { url: img("photo-1618773928121-c32242e63f39"), altText: "Standard Room — detail", category: "room" },
    ],
  },
  {
    id: "room-deluxe",
    name: "Deluxe Room",
    slug: "deluxe-room",
    description:
      "A brighter, roomier stay with a king bed and work corner — ideal for small families and business travellers. Clean, quiet, and minutes from local religious and coastal sights.",
    maxGuests: 3,
    bedConfig: "1 King Bed",
    sizeSqft: 300, // PLACEHOLDER — owner to confirm
    basePricePerNight: 2999, // PLACEHOLDER price
    weekendPricePerNight: 3499,
    amenities: ["Free WiFi", "Air Conditioning", "Room Service", "Front Desk Support", "Parking"],
    floorPlanUrl: null,
    isActive: true,
    photos: [
      { url: img("photo-1611892440504-42a792e24d32"), altText: "Deluxe Room — bed", category: "room" },
      { url: img("photo-1590490360182-c33d57733427"), altText: "Deluxe Room — corner", category: "room" },
      { url: img("photo-1560185127-6ed189bf02f4"), altText: "Deluxe Room — bath", category: "room" },
    ],
  },
  {
    id: "room-executive",
    name: "Executive Room",
    slug: "executive-room",
    description:
      "Our most generous room for families and groups — a king bed plus a single bed, lounge corner, and space to unwind after a day at the Dargah or the coast.",
    maxGuests: 4,
    bedConfig: "1 King + 1 Single Bed",
    sizeSqft: 420, // PLACEHOLDER — owner to confirm
    basePricePerNight: 4499, // PLACEHOLDER price
    weekendPricePerNight: 4999,
    amenities: ["Free WiFi", "Air Conditioning", "Room Service", "Front Desk Support", "Parking"],
    floorPlanUrl: null,
    isActive: true,
    photos: [
      { url: img("photo-1591088398332-8a7791972843"), altText: "Executive Room — bedroom", category: "room" },
      { url: img("photo-1598928506319-c55ded91a20c"), altText: "Executive Room — lounge", category: "room" },
      { url: img("photo-1560185893-a55cbc8c57e8"), altText: "Executive Room — beds", category: "room" },
    ],
  },
];

export const HERO_SLIDES = [
  {
    url: img("photo-1566073771259-6a8506099945", 2000),
    alt: "Le Comfort exterior at dusk",
    headline: "A quiet stay in Nagore",
    sub: "Le Comfort · Nagore, Nagapattinam",
  },
  {
    url: img("photo-1582719508461-905c673771fd", 2000),
    alt: "Bright guest room",
    headline: "Rooms that let you rest",
    sub: "Simple · Clean · Honest",
  },
  {
    url: img("photo-1571896349842-33c89424de2d", 2000),
    alt: "Courtyard and light",
    headline: "Minutes from the coast",
    sub: "Nagore · Velankanni · Nagapattinam",
  },
];

export const GALLERY_PHOTOS = [
  ...HERO_SLIDES.map((s) => ({ url: s.url, altText: s.alt, category: "exterior" as const })),
  ...PLACEHOLDER_ROOMS.flatMap((r) => r.photos),
  {
    url: img("photo-1506521781263-d8422e82f27a"),
    altText: "On-site parking area (placeholder photo)",
    category: "parking" as const,
  },
  {
    url: img("photo-1449965408869-eaa3f722e40d"),
    altText: "Driveway and parking (placeholder photo)",
    category: "parking" as const,
  },
];

export const PLACEHOLDER_REVIEWS = [
  { guestName: "Priya", rating: 5, comment: "Clean rooms, kind staff, easy parking. Perfect base for Velankanni.", score: 10 },
  { guestName: "Arun", rating: 5, comment: "Quiet, comfortable, and close to Nagore Dargah. Value for money.", score: 9 },
  { guestName: "Sara", rating: 4, comment: "Simple and spotless. The team helped with directions and food.", score: 9 },
];

export function inr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}
