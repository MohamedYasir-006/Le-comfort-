"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Sending…");
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setStatus(res.ok ? "Thank you — we'll reply shortly." : "Could not send. Please call or email us directly.");
    if (res.ok) setForm({ name: "", email: "", phone: "", message: "" });
  }
  const input = "w-full border border-neutral-300 bg-white px-3 py-2.5 text-[15px] outline-none focus:border-black";
  return (
    <div className="pt-28 pb-16">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-2">
        <div>
          <h1 className="font-serif text-5xl font-light">Contact</h1>
          <div className="mt-6 space-y-3 text-lg">
            <a href={SITE.phoneHref} className="block font-semibold hover:underline">{SITE.phone}</a>
            <a href={SITE.emailHref} className="block hover:underline">{SITE.email}</a>
            <a href={SITE.mapsUrl} target="_blank" rel="noreferrer" className="block text-[15px] text-neutral-600">{SITE.address}</a>
          </div>
          <iframe title="Le Comfort map" src={SITE.mapsEmbed} className="mt-6 h-64 w-full border-0" loading="lazy" />
        </div>
        <form onSubmit={submit} className="h-fit border border-neutral-200 bg-white p-6">
          <h2 className="font-serif text-2xl font-light">Send a message</h2>
          <div className="mt-4 grid gap-4">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} aria-label="Name" required />
            <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} aria-label="Email" required type="email" />
            <input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} aria-label="Phone" />
            <textarea placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className={input} aria-label="Message" required />
            <button className="bg-neutral-900 py-3 text-sm tracking-[0.12em] text-white uppercase">Send</button>
            {status && <p className="text-sm text-neutral-600" role="status">{status}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}
