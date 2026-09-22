"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { inr } from "@/lib/data";
import { priceForStay } from "@/lib/pricing";
import { CANCELLATION_POLICY_SHORT, SITE } from "@/lib/site";

type Room = {
  id: string; name: string; slug: string; description: string;
  maxGuests: number; bedConfig: string; sizeSqft: number | null;
  basePricePerNight: number; weekendPricePerNight: number | null;
  amenities: string[]; floorPlanUrl: string | null;
  photos: { url: string; altText: string }[];
  seasonalRates: { startDate: string; endDate: string; pricePerNight: number }[];
  reviews: { guestName: string; rating: number; comment: string }[];
};

export default function RoomDetailClient({
  room, initialCheckin, initialCheckout, initialGuests,
}: {
  room: Room; initialCheckin: string; initialCheckout: string; initialGuests: string;
}) {
  const [photo, setPhoto] = useState(0);
  const [checkin, setCheckin] = useState(initialCheckin);
  const [checkout, setCheckout] = useState(initialCheckout);
  const [guests, setGuests] = useState(initialGuests);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [unavailableMsg, setUnavailableMsg] = useState("");

  const breakdown = useMemo(() => {
    if (!checkin || !checkout) return null;
    const ci = new Date(checkin);
    const co = new Date(checkout);
    if (isNaN(ci.getTime()) || isNaN(co.getTime()) || co <= ci) return null;
    return priceForStay({
      checkIn: ci, checkOut: co,
      base: room.basePricePerNight, weekend: room.weekendPricePerNight,
      seasonal: room.seasonalRates.map((s) => ({ startDate: new Date(s.startDate), endDate: new Date(s.endDate), pricePerNight: s.pricePerNight })),
    });
  }, [checkin, checkout, room]);

  // Debounced availability check
  useEffect(() => {
    if (!checkin || !checkout) { setAvailable(null); return; }
    setChecking(true);
    const t = setTimeout(async () => {
      try {
        const q = new URLSearchParams({ roomId: room.id, checkin, checkout });
        const res = await fetch(`/api/availability?${q}`);
        const data = await res.json();
        setAvailable(data.available);
        setBlocked(data.blockedDates ?? []);
        setUnavailableMsg(data.available ? "" : (data.reason ?? "These dates are no longer available for this room."));
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [checkin, checkout, room.id]);

  const bookHref = `/book/${room.slug}?checkin=${checkin}&checkout=${checkout}&guests=${guests}`;

  return (
    <div className="pt-24">
      <div className="mx-auto max-w-6xl px-5">
        <p className="text-center text-xs tracking-[0.3em] text-neutral-500 uppercase">Le Comfort · Nagore</p>
        <h1 className="mt-2 text-center font-serif text-5xl font-light">{room.name}</h1>
        <p className="mt-2 text-center text-neutral-500">{room.bedConfig} · Up to {room.maxGuests} guests{room.sizeSqft ? ` · ${room.sizeSqft} sq ft` : ""}</p>

        {/* Gallery */}
        <div className="mt-8">
          <div className="relative aspect-[16/9] overflow-hidden bg-neutral-200">
            <Image src={room.photos[photo]?.url ?? ""} alt={room.photos[photo]?.altText ?? room.name} fill priority sizes="100vw" className="object-cover" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {room.photos.map((p, i) => (
              <button key={p.url + i} onClick={() => setPhoto(i)} className={`relative aspect-[4/3] overflow-hidden ${i === photo ? "ring-2 ring-[#9a6b2f]" : ""}`}>
                <Image src={p.url} alt={p.altText} fill loading="lazy" sizes="33vw" className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-12 py-12 md:grid-cols-[1fr_360px]">
          <div>
            <p className="max-w-2xl leading-relaxed text-neutral-700">{room.description}</p>
            <h2 className="mt-10 text-xs tracking-[0.25em] text-neutral-500 uppercase">Amenities</h2>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-[15px]">
              {room.amenities.map((a) => <li key={a} className="border-b border-neutral-200 py-2">· {a}</li>)}
            </ul>
            {room.reviews.length > 0 && (
              <>
                <h2 className="mt-10 text-xs tracking-[0.25em] text-neutral-500 uppercase">Guest reviews</h2>
                <div className="mt-4 space-y-4">
                  {room.reviews.map((r, i) => (
                    <figure key={i} className="border border-neutral-200 p-5">
                      <p className="font-serif text-2xl">{r.rating} / 5</p>
                      <blockquote className="mt-1 text-[15px]">“{r.comment}”</blockquote>
                      <figcaption className="mt-2 text-xs tracking-widest text-neutral-500 uppercase">— {r.guestName}</figcaption>
                    </figure>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Booking panel */}
          <aside className="h-fit border border-neutral-200 bg-white p-6 md:sticky md:top-24">
            <p className="font-serif text-3xl font-light">{inr(room.basePricePerNight)} <span className="text-sm text-neutral-500">/ night</span></p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[11px] tracking-widest text-neutral-500 uppercase">Check-in</span>
                <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} className="mt-1 w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black" />
              </label>
              <label className="block">
                <span className="text-[11px] tracking-widest text-neutral-500 uppercase">Check-out</span>
                <input type="date" value={checkout} min={checkin} onChange={(e) => setCheckout(e.target.value)} className="mt-1 w-full border border-neutral-300 px-3 py-2 outline-none focus:border-black" />
              </label>
            </div>
            <label className="mt-3 block">
              <span className="text-[11px] tracking-widest text-neutral-500 uppercase">Guests</span>
              <select value={guests} onChange={(e) => setGuests(e.target.value)} className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 outline-none">
                {Array.from({ length: room.maxGuests }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>)}
              </select>
            </label>

            {breakdown && breakdown.nights > 0 && (
              <div className="mt-4 border-t border-neutral-200 pt-4 text-sm">
                {breakdown.nightly.map((n) => (
                  <div key={n.date} className="flex justify-between py-0.5 text-neutral-600">
                    <span>{n.date}{n.seasonal ? " · seasonal" : n.isWeekend ? " · weekend" : ""}</span>
                    <span>{inr(n.price)}</span>
                  </div>
                ))}
                <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2 font-semibold">
                  <span>Total ({breakdown.nights} night{breakdown.nights > 1 ? "s" : ""})</span>
                  <span>{inr(breakdown.total)}</span>
                </div>
              </div>
            )}

            <div className="mt-3 min-h-6 text-sm" aria-live="polite">
              {checking && <span className="text-neutral-500">Checking availability…</span>}
              {!checking && available === false && <span className="text-red-700">{unavailableMsg}</span>}
              {!checking && available === true && <span className="text-green-700">Available for these dates ✓</span>}
            </div>

            <Link href={bookHref}
              className={`mt-3 block py-3 text-center text-sm tracking-[0.12em] uppercase transition-colors ${available === false ? "pointer-events-none bg-neutral-300 text-neutral-500" : "bg-[#9a6b2f] text-white hover:bg-[#7d5623]"}`}>
              Request to Book
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-neutral-500">{CANCELLATION_POLICY_SHORT}</p>
            <p className="mt-2 text-xs text-neutral-500">Prefer to call? <a className="underline" href={SITE.phoneHref}>{SITE.phone}</a></p>
          </aside>
        </div>
      </div>

      {/* Sticky mobile book bar */}
      <div className="sticky bottom-0 border-t border-neutral-200 bg-white/95 p-3 backdrop-blur md:hidden">
        <Link href={bookHref} className="block bg-[#9a6b2f] py-3 text-center text-sm tracking-widest text-white uppercase">
          Request to Book{breakdown && breakdown.total > 0 ? ` · ${inr(breakdown.total)}` : ""}
        </Link>
      </div>
    </div>
  );
}
