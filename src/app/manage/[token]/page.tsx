import { notFound } from "next/navigation";
import Link from "next/link";
import { dbAvailable, prisma } from "@/lib/prisma";
import { inr } from "@/lib/data";
import CancelButton from "./CancelButton";

export default async function ManagePage({
  params, searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ fresh?: string; room?: string; checkin?: string; checkout?: string; preview?: string }>;
}) {
  const { token } = await params;
  const sp = await searchParams;

  if (sp.preview) {
    return (
      <div className="mx-auto max-w-2xl px-5 pt-32 pb-20 text-center">
        <h1 className="font-serif text-4xl font-light">Request received (preview)</h1>
        <p className="mt-4 text-neutral-600">Connect <code>DATABASE_URL</code> to hold real dates and email confirmations. Your form validation and pricing flow work end-to-end.</p>
        <Link href="/" className="mt-8 inline-block bg-neutral-900 px-8 py-3 text-sm tracking-widest text-white uppercase">Back home</Link>
      </div>
    );
  }

  if (!(await dbAvailable())) notFound();
  const booking = await prisma.booking.findUnique({ where: { manageToken: token }, include: { room: true } });
  if (!booking) notFound();
  const fresh = sp.fresh === "1";

  return (
    <div className="mx-auto max-w-2xl px-5 pt-32 pb-20">
      <p className="text-center text-xs tracking-[0.3em] text-neutral-500 uppercase">
        {fresh ? "Request received" : "Manage booking"}
      </p>
      <h1 className="mt-2 text-center font-serif text-4xl font-light">
        {booking.status === "confirmed" ? "Booking confirmed ✓" : booking.status === "pending" ? "Request pending" : `Booking ${booking.status}`}
      </h1>
      {fresh && booking.status === "pending" && (
        <p className="mt-4 border border-neutral-300 bg-white p-4 text-center text-sm leading-relaxed">
          Thank you, {booking.guestName}. Your dates are held provisionally — we&apos;ll confirm availability
          and send offline payment details within 12 hours. A confirmation email is on its way to {booking.guestEmail}.
        </p>
      )}
      <dl className="mt-8 border border-neutral-200 bg-white p-6 text-[15px]">
        {[["Room", booking.room.name], ["Booking ID", booking.id], ["Guest", `${booking.guestName} · ${booking.guestPhone}`],
          ["Check-in", booking.checkIn.toISOString().slice(0, 10)], ["Check-out", booking.checkOut.toISOString().slice(0, 10)],
          ["Guests", String(booking.guestCount)], ["Total (pay offline)", inr(booking.totalAmount)], ["Status", booking.status]].map(([k, v]) => (
          <div key={k} className="flex justify-between border-b border-neutral-100 py-2 last:border-0"><dt className="text-neutral-500">{k}</dt><dd className="font-medium">{v}</dd></div>
        ))}
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={() => window.print()} className="border border-neutral-900 px-6 py-2.5 text-sm tracking-widest uppercase">Email / Print</button>
        {(booking.status === "pending" || booking.status === "confirmed") && <CancelButton token={token} />}
      </div>
      <p className="mt-6 text-sm text-neutral-500">No account needed — this private link manages your booking. Questions? Call the property directly.</p>
    </div>
  );
}
