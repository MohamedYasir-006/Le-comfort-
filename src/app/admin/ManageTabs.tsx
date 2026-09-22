"use client";

import { useEffect, useState } from "react";

type Room = {
  id: string; name: string; slug: string; maxGuests: number;
  basePricePerNight: number; weekendPricePerNight: number | null;
  isActive: boolean; amenities: string;
};

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Request failed.");
  return data;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 border border-neutral-200 bg-white p-5">
      <h2 className="font-serif text-2xl font-light">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

const input = "border border-neutral-300 px-2.5 py-1.5 text-sm outline-none focus:border-black";

export default function ManageTabs() {
  const [tab, setTab] = useState<"inventory" | "pricing" | "reviews">("inventory");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState("");
  const [blocked, setBlocked] = useState<any[]>([]);
  const [rates, setRates] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [blockForm, setBlockForm] = useState({ date: "", reason: "maintenance" });
  const [rateForm, setRateForm] = useState({ startDate: "", endDate: "", pricePerNight: "", minStayNights: "" });

  useEffect(() => {
    api("/api/admin/rooms").then((d) => {
      setRooms(d.rooms ?? []);
      if (d.rooms?.length && !roomId) setRoomId(d.rooms[0].id);
    }).catch(() => {});
    api("/api/admin/reviews?filter=pending").then((d) => setReviews(d.reviews ?? [])).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!roomId) return;
    api(`/api/admin/blocked?roomId=${roomId}`).then((d) => setBlocked(d.blocked ?? [])).catch(() => {});
    api(`/api/admin/rates?roomId=${roomId}`).then((d) => setRates(d.rates ?? [])).catch(() => {});
  }, [roomId]);

  async function saveRoom(r: Room, patch: Partial<Room>) {
    try {
      await api("/api/admin/rooms", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id, ...patch }) });
      setRooms((rs) => rs.map((x) => (x.id === r.id ? { ...x, ...patch } : x)));
      setMsg(`Saved ${r.name}.`);
    } catch (e) { setMsg(e instanceof Error ? e.message : "Save failed."); }
  }

  return (
    <div className="mt-10">
      <div className="flex gap-2">
        {(["inventory", "pricing", "reviews"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 text-xs tracking-widest uppercase ${tab === t ? "bg-neutral-900 text-white" : "border"}`}>{t}</button>
        ))}
      </div>
      {msg && <p role="status" className="mt-3 text-sm text-neutral-600">{msg}</p>}

      {tab === "inventory" && (
        <Section title="Inventory — rooms, maintenance, blocked dates">
          <label className="text-sm">Room
            <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className={`ml-2 ${input}`}>
              {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </label>
          <div className="mt-4 space-y-4">
            {rooms.map((r) => (
              <div key={r.id} className="grid gap-2 border-b border-neutral-100 pb-4 text-sm md:grid-cols-[1fr_auto_auto_auto]">
                <span><b>{r.name}</b> <span className="text-neutral-500">/{r.slug} · sleeps {r.maxGuests}</span></span>
                <label>Base ₹<input type="number" defaultValue={r.basePricePerNight} className={`ml-1 w-24 ${input}`} id={`base-${r.id}`} /></label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked={r.isActive} id={`active-${r.id}`} className="h-4 w-4" /> Active
                </label>
                <button
                  onClick={() => {
                    const base = Number((document.getElementById(`base-${r.id}`) as HTMLInputElement)?.value);
                    const active = (document.getElementById(`active-${r.id}`) as HTMLInputElement)?.checked;
                    saveRoom(r, { basePricePerNight: base, isActive: active });
                  }}
                  className="border px-3 py-1 text-xs uppercase">Save</button>
              </div>
            ))}
          </div>
          <h3 className="mt-6 font-medium">Blocked dates {rooms.find((r) => r.id === roomId)?.name && `— ${rooms.find((r) => r.id === roomId)?.name}`}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <input type="date" value={blockForm.date} onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })} className={input} aria-label="Blocked date" />
            <input value={blockForm.reason} onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })} className={input} aria-label="Reason" placeholder="reason" />
            <button onClick={async () => {
              try {
                await api("/api/admin/blocked", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roomId, ...blockForm }) });
                const d = await api(`/api/admin/blocked?roomId=${roomId}`); setBlocked(d.blocked ?? []); setMsg("Date blocked.");
              } catch (e) { setMsg(e instanceof Error ? e.message : "Failed."); }
            }} className="bg-neutral-900 px-4 py-1.5 text-xs text-white uppercase">Block date</button>
          </div>
          <ul className="mt-3 space-y-1 text-sm">
            {blocked.map((b) => (
              <li key={b.id} className="flex justify-between border-b border-neutral-100 py-1">
                <span>{String(b.date).slice(0, 10)} · {b.reason}</span>
                <button onClick={async () => {
                  await api("/api/admin/blocked", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.id }) });
                  setBlocked((bs) => bs.filter((x) => x.id !== b.id));
                }} className="text-xs text-red-800 uppercase">Unblock</button>
              </li>
            ))}
            {blocked.length === 0 && <li className="text-neutral-500">No blocked dates.</li>}
          </ul>
          <p className="mt-3 text-xs text-neutral-500">Tip: toggling a room to inactive hides it from listing; blocking dates keeps it listed but unbookable on those days. Photo upload/reorder lives in Supabase Storage once configured.</p>
        </Section>
      )}

      {tab === "pricing" && (
        <Section title="Pricing — seasonal rate rules">
          <label className="text-sm">Room
            <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className={`ml-2 ${input}`}>
              {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </label>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <input type="date" value={rateForm.startDate} onChange={(e) => setRateForm({ ...rateForm, startDate: e.target.value })} className={input} aria-label="Start" />
            <input type="date" value={rateForm.endDate} onChange={(e) => setRateForm({ ...rateForm, endDate: e.target.value })} className={input} aria-label="End" />
            <input type="number" placeholder="₹/night" value={rateForm.pricePerNight} onChange={(e) => setRateForm({ ...rateForm, pricePerNight: e.target.value })} className={`${input} w-28`} aria-label="Price per night" />
            <input type="number" placeholder="min stay" value={rateForm.minStayNights} onChange={(e) => setRateForm({ ...rateForm, minStayNights: e.target.value })} className={`${input} w-24`} aria-label="Min stay" />
            <button onClick={async () => {
              try {
                await api("/api/admin/rates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roomId, startDate: rateForm.startDate, endDate: rateForm.endDate, pricePerNight: Number(rateForm.pricePerNight), minStayNights: rateForm.minStayNights ? Number(rateForm.minStayNights) : null }) });
                const d = await api(`/api/admin/rates?roomId=${roomId}`); setRates(d.rates ?? []); setMsg("Rate rule added.");
              } catch (e) { setMsg(e instanceof Error ? e.message : "Failed."); }
            }} className="bg-neutral-900 px-4 py-1.5 text-xs text-white uppercase">Add rule</button>
          </div>
          <ul className="mt-3 space-y-1 text-sm">
            {rates.map((r) => (
              <li key={r.id} className="flex justify-between border-b border-neutral-100 py-1">
                <span>{String(r.startDate).slice(0, 10)} → {String(r.endDate).slice(0, 10)} · ₹{r.pricePerNight}{r.minStayNights ? ` · min ${r.minStayNights} nights` : ""}</span>
                <button onClick={async () => {
                  await api("/api/admin/rates", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id }) });
                  setRates((rs) => rs.filter((x) => x.id !== r.id));
                }} className="text-xs text-red-800 uppercase">Delete</button>
              </li>
            ))}
            {rates.length === 0 && <li className="text-neutral-500">No seasonal rules — base/weekend rates apply.</li>}
          </ul>
        </Section>
      )}

      {tab === "reviews" && (
        <Section title="Reviews — approve before they go public">
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-neutral-100 pb-3 text-sm">
                <p><b>{r.guestName}</b> · {r.rating}/5 · {r.room?.name ?? "property"} · <span className="text-neutral-500">{String(r.createdAt).slice(0, 10)}</span></p>
                <p className="mt-1">“{r.comment}”</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={async () => {
                    await api("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id, action: "approve" }) });
                    setReviews((rs) => rs.filter((x) => x.id !== r.id)); setMsg("Review approved.");
                  }} className="bg-green-800 px-3 py-1 text-xs text-white uppercase">Approve</button>
                  <button onClick={async () => {
                    await api("/api/admin/reviews", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id }) });
                    setReviews((rs) => rs.filter((x) => x.id !== r.id)); setMsg("Review deleted.");
                  }} className="border border-red-800 px-3 py-1 text-xs text-red-800 uppercase">Delete</button>
                </div>
              </div>
            ))}
            {reviews.length === 0 && <p className="text-sm text-neutral-500">No pending reviews. Approved reviews show on the homepage carousel, room pages, and /reviews.</p>}
          </div>
        </Section>
      )}
    </div>
  );
}
