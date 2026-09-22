"use client";

import { useState } from "react";

export default function ReviewForm() {
  const [form, setForm] = useState({ guestName: "", rating: "5", comment: "" });
  const [status, setStatus] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Sending…");
    const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, rating: Number(form.rating) }) });
    setStatus(res.ok ? "Thank you — your review is awaiting moderation." : "Could not submit. Please try again.");
    if (res.ok) setForm({ guestName: "", rating: "5", comment: "" });
  }
  const input = "w-full border border-neutral-300 bg-white px-3 py-2.5 text-[15px] outline-none focus:border-black";
  return (
    <form onSubmit={submit} className="mt-4 grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input placeholder="First name" value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} className={input} aria-label="First name" required />
        <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className={input} aria-label="Rating">
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} / 5</option>)}
        </select>
      </div>
      <textarea placeholder="Short review" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} rows={4} className={input} aria-label="Review" required minLength={5} maxLength={600} />
      <button className="bg-neutral-900 py-3 text-sm tracking-[0.12em] text-white uppercase">Submit review</button>
      {status && <p role="status" className="text-sm text-neutral-600">{status}</p>}
    </form>
  );
}
