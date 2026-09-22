"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { inr } from "@/lib/data";
import { priceForStay } from "@/lib/pricing";
import { CANCELLATION_POLICY_SHORT } from "@/lib/site";

export default function BookForm({ roomSlug, roomName, base, weekend, maxGuests, initial }: {
  roomSlug: string; roomName: string; base: number; weekend: number | null; maxGuests: number;
  initial: { checkin: string; checkout: string; guests: string };
}) {
  const router = useRouter();
  const [checkin, setCheckin] = useState(initial.checkin);
  const [checkout, setCheckout] = useState(initial.checkout);
  const [guests, setGuests] = useState(Number(initial.guests) || 2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const breakdown = useMemo(() => {
    if (!checkin || !checkout) return null;
    const ci = new Date(checkin), co = new Date(checkout);
    if (isNaN(ci.getTime()) || isNaN(co.getTime()) || co <= ci) return null;
    return priceForStay({ checkIn: ci, checkOut: co, base, weekend });
  }, [checkin, checkout, base, weekend]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!checkin) e.checkin = "Choose a check-in date.";
    if (!checkout) e.checkout = "Choose a check-out date.";
    if (checkin && checkout && new Date(checkout) <= new Date(checkin)) e.checkout = "Check-out must be after check-in.";
    if (name.trim().length < 2) e.guestName = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.guestEmail = "Enter a valid email.";
    if (phone.replace(/\D/g, "").length < 7) e.guestPhone = "Enter a valid phone number.";
    if (guests < 1 || guests > maxGuests) e.guestCount = `This room sleeps up to ${maxGuests}.`;
    if (!agree) e.agree = "Please agree to the terms and cancellation policy.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomSlug, guestName: name, guestEmail: email, guestPhone: phone, guestCount: guests, checkin, checkout, notes, agree }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setServerError(data.error ?? "Could not submit your request. Please try again or call us.");
        return;
      }
      router.push(data.manageUrl + `?fresh=1&room=${encodeURIComponent(roomName)}&checkin=${checkin}&checkout=${checkout}`);
    } catch {
      setServerError("Network error. Please try again or call us.");
    } finally {
      setSubmitting(false);
    }
  }

  const input = "w-full border border-neutral-300 bg-white px-3 py-2.5 text-[15px] outline-none focus:border-black";
  const err = "mt-1 text-sm text-red-700";

  return (
    <form onSubmit={submit} noValidate className="grid gap-10 md:grid-cols-[1fr_360px]">
      <div>
        <h2 className="font-serif text-2xl font-light">1 · Dates & guests</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block">Check-in
            <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} className={`mt-1 ${input}`} aria-label="Check-in" />
            {errors.checkin && <p className={err}>{errors.checkin}</p>}
          </label>
          <label className="block">Check-out
            <input type="date" value={checkout} min={checkin} onChange={(e) => setCheckout(e.target.value)} className={`mt-1 ${input}`} aria-label="Check-out" />
            {errors.checkout && <p className={err}>{errors.checkout}</p>}
          </label>
          <label className="block">Guests
            <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className={`mt-1 ${input}`} aria-label="Guests">
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            {errors.guestCount && <p className={err}>{errors.guestCount}</p>}
          </label>
        </div>

        <h2 className="mt-10 font-serif text-2xl font-light">2 · Your details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">Full name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Meera Krishnan" className={`mt-1 ${input}`} autoComplete="name" />
            {errors.guestName && <p className={err}>{errors.guestName}</p>}
          </label>
          <label className="block">Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" className={`mt-1 ${input}`} autoComplete="tel" inputMode="tel" />
            {errors.guestPhone && <p className={err}>{errors.guestPhone}</p>}
          </label>
          <label className="block sm:col-span-2">Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={`mt-1 ${input}`} autoComplete="email" inputMode="email" />
            {errors.guestEmail && <p className={err}>{errors.guestEmail}</p>}
          </label>
          <label className="block sm:col-span-2">Notes / special requests (optional)
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Early check-in, extra mattress, …" className={`mt-1 ${input}`} />
          </label>
        </div>

        <h2 className="mt-10 font-serif text-2xl font-light">3 · Review & submit</h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">{CANCELLATION_POLICY_SHORT}</p>
        <label className="mt-4 flex items-start gap-3 text-sm">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4" />
          <span>I agree to the terms and cancellation policy. I understand this is a <b>booking request</b> — my dates are held provisionally and the team will confirm within 12 hours with offline payment details. No online payment is taken.</span>
        </label>
        {errors.agree && <p className={err}>{errors.agree}</p>}
        {serverError && <p role="alert" className="mt-4 border border-red-300 bg-red-50 p-3 text-sm text-red-800">{serverError}</p>}
        <button disabled={submitting} className="mt-6 bg-[#9a6b2f] px-10 py-3.5 text-sm tracking-[0.12em] text-white uppercase hover:bg-[#7d5623] disabled:opacity-60">
          {submitting ? "Submitting…" : "Submit Booking Request"}
        </button>
      </div>

      <aside className="h-fit border border-neutral-200 bg-white p-6 md:sticky md:top-24">
        <p className="font-serif text-2xl font-light">{roomName}</p>
        {breakdown ? (
          <div className="mt-4 text-sm">
            {breakdown.nightly.map((n) => (
              <div key={n.date} className="flex justify-between py-0.5 text-neutral-600"><span>{n.date}</span><span>{inr(n.price)}</span></div>
            ))}
            <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2 font-semibold">
              <span>Total · {breakdown.nights} night{breakdown.nights > 1 ? "s" : ""}</span><span>{inr(breakdown.total)}</span>
            </div>
            <p className="mt-2 text-xs text-neutral-500">Payable offline after confirmation — nothing is charged now.</p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">Choose dates to see the live price breakdown.</p>
        )}
      </aside>
    </form>
  );
}
