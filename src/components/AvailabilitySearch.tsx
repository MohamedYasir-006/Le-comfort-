"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AvailabilitySearch({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  // Computed after mount so server/prerendered HTML and the first client
  // render agree (a stale baked-in date caused hydration mismatches).
  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
  }, []);
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState("2");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams({ checkin, checkout, guests });
    router.push(`/rooms?${q.toString()}#search`);
  }

  return (
    <form
      onSubmit={submit}
      className={`mx-auto grid w-full max-w-4xl gap-3 bg-white p-4 shadow-[0_8px_40px_rgba(0,0,0,0.18)] md:grid-cols-[1fr_1fr_1fr_auto] ${
        compact ? "" : "-mt-10 relative z-10"
      }`}
    >
      <label className="block">
        <span className="text-[11px] tracking-[0.2em] text-neutral-500 uppercase">Check-in</span>
        <input type="date" required min={today || undefined} value={checkin} onChange={(e) => setCheckin(e.target.value)}
          suppressHydrationWarning
          className="mt-1 w-full border border-neutral-300 px-3 py-2.5 text-[15px] outline-none focus:border-black" />
      </label>
      <label className="block">
        <span className="text-[11px] tracking-[0.2em] text-neutral-500 uppercase">Check-out</span>
        <input type="date" required min={checkin || today || undefined} value={checkout} onChange={(e) => setCheckout(e.target.value)}
          suppressHydrationWarning
          className="mt-1 w-full border border-neutral-300 px-3 py-2.5 text-[15px] outline-none focus:border-black" />
      </label>
      <label className="block">
        <span className="text-[11px] tracking-[0.2em] text-neutral-500 uppercase">Guests</span>
        <select value={guests} onChange={(e) => setGuests(e.target.value)}
          className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2.5 text-[15px] outline-none focus:border-black">
          {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>)}
        </select>
      </label>
      <button type="submit" className="bg-[#9a6b2f] px-8 py-2.5 text-sm font-medium tracking-[0.12em] text-white uppercase self-end hover:bg-[#7d5623]">
        Check Availability
      </button>
    </form>
  );
}
