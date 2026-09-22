// Central site content — edit these placeholders with real client content.
// Nothing here is invented silently: values marked PLACEHOLDER need owner input.

export const SITE = {
  name: "Le Comfort",
  tagline: "COASTAL TAMIL NADU HOSPITALITY, QUIETLY DONE", // PLACEHOLDER tagline — owner to confirm
  description:
    "Le Comfort is a quiet residency stay in Nagore, Nagapattinam — simple rooms, honest hospitality, and easy access to the coast and town.",
  address: "46A, Manora South, Nellukadai Street, Meen Kadai Line, Nagore - 611002",
  landmark: "Close to the Nagore Dargah Shariff",
  mapsUrl: "https://maps.app.goo.gl/5SzK6NYViVGuojfH6",
  mapsEmbed:
    "https://www.google.com/maps?q=Manora+South,+Nellukadai+Street,+Nagore+611002&output=embed",
  phone: "+91 90904 94923",
  phoneHref: "tel:+919090494923",
  email: "info@hotellecomfort.com",
  emailHref: "mailto:info@hotellecomfort.com",
  whatsapp: "https://wa.me/919090494923",
  checkInTime: "12:00 PM",
  checkOutTime: "11:00 AM",
  confirmWithinHours: "12 hours",
  accent: "#9a6b2f", // restrained brass accent against neutral palette
} as const;

export const NAV = [
  { label: "Home", href: "/" },
  { label: "Rooms", href: "/rooms" },
  { label: "Amenities", href: "/#amenities" },
  { label: "Location", href: "/location" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
] as const;

// PLACEHOLDER — owner to provide real supermarket names/distances
export const NEARBY_STORES = [
  { name: "Nearby supermarket (name TBD)", distance: "≈ 5 min walk", note: "Daily essentials & snacks" },
  { name: "Nagore bazaar shops", distance: "≈ 5 min drive", note: "Groceries, pharmacy, ATMs" },
  { name: "Nagapattinam town market", distance: "≈ 15 min drive", note: "Larger stores & restaurants" },
] as const;

export const CANCELLATION_POLICY_SHORT =
  "Free cancellation up to 48 hours before check-in. Within 48 hours, one night may be charged on arrival. No online payment is taken — payment is collected offline (cash / UPI on arrival or via a manual link our team sends after confirmation).";
