"use client";

import { useState } from "react";

export default function AdminClient({ initial }: { initial: any[] }) {
  const [bookings, setBookings] = useState(initial);
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState("");

  async function act(id: string, action: "confirm" | "cancel" | "complete") {
    setBusy(id + action);
    const res = await fetch("/api/admin/bookings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) });
    if (res.ok) {
      const { booking } = await res.json();
      setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, ...booking } : b)));
    } else alert("Action failed.");
    setBusy("");
  }

  const shown = bookings.filter((b) => filter === "all" || b.status === filter);

  return (
    <div className="mt-8">
      <div className="flex gap-2">
        {["all", "pending", "confirmed", "cancelled", "completed"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 text-xs tracking-widest uppercase ${filter === s ? "bg-neutral-900 text-white" : "border"}`}>{s}</button>
        ))}
      </div>
      <div className="mt-4 overflow-x-auto border border-neutral-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead><tr className="border-b text-left text-xs tracking-widest text-neutral-500 uppercase">
            <th className="p-3">Guest</th><th className="p-3">Room</th><th className="p-3">Dates</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Actions</th>
          </tr></thead>
          <tbody>
            {shown.map((b) => (
              <tr key={b.id} className="border-b last:border-0">
                <td className="p-3"><b>{b.guestName}</b><br /><span className="text-neutral-500">{b.guestPhone} · {b.guestEmail}</span></td>
                <td className="p-3">{b.room?.name ?? b.roomId}</td>
                <td className="p-3">{String(b.checkIn).slice(0, 10)} → {String(b.checkOut).slice(0, 10)}<br /><span className="text-neutral-500">{b.guestCount} guests</span></td>
                <td className="p-3">₹{Number(b.totalAmount).toLocaleString("en-IN")}</td>
                <td className="p-3"><span className="bg-neutral-100 px-2 py-1 text-xs uppercase">{b.status}</span></td>
                <td className="p-3">
                  <div className="flex gap-2">
                    {b.status === "pending" && <button disabled={!!busy} onClick={() => act(b.id, "confirm")} className="bg-green-800 px-3 py-1.5 text-xs text-white uppercase">Confirm</button>}
                    {(b.status === "pending" || b.status === "confirmed") && <button disabled={!!busy} onClick={() => act(b.id, "cancel")} className="border border-red-800 px-3 py-1.5 text-xs text-red-800 uppercase">Cancel</button>}
                    {b.status === "confirmed" && <button disabled={!!busy} onClick={() => act(b.id, "complete")} className="border px-3 py-1.5 text-xs uppercase">Complete</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <p className="p-6 text-center text-neutral-500">No bookings{filter !== "all" ? ` with status “${filter}”` : " yet"}. New requests appear here and trigger a guest + admin email.</p>}
      </div>
    </div>
  );
}
