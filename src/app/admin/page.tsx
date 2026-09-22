import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { dbAvailable, prisma } from "@/lib/prisma";
import { inr } from "@/lib/data";
import AdminClient from "./AdminClient";
import ManageTabs from "./ManageTabs";

export default async function AdminPage() {
  const jar = await cookies();
  if (!verifySession(jar.get("lc_admin")?.value)) redirect("/admin/login");

  let bookings: any[] = [];
  let stats = { occupancy30: "—", revenue: "—", pending: 0, total: 0 };
  if (await dbAvailable()) {
    try {
      bookings = await prisma.booking.findMany({
        include: { room: { select: { name: true } } },
        orderBy: { createdAt: "desc" }, take: 200,
      });
      const confirmed = bookings.filter((b) => b.status === "confirmed");
      stats = {
        occupancy30: `${bookings.filter((b) => ["pending", "confirmed"].includes(b.status)).length} holds`,
        revenue: inr(confirmed.reduce((a, b) => a + b.totalAmount, 0)),
        pending: bookings.filter((b) => b.status === "pending").length,
        total: bookings.length,
      };
    } catch { /* preview */ }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pt-28 pb-16">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl font-light">Dashboard</h1>
        <form action="/api/admin/logout" method="post"><button className="border px-4 py-2 text-xs tracking-widest uppercase">Sign out</button></form>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[["Active holds", stats.occupancy30], ["Revenue booked", stats.revenue], ["Pending review", String(stats.pending)], ["Total bookings", String(stats.total)]].map(([k, v]) => (
          <div key={k} className="border border-neutral-200 bg-white p-5"><p className="text-xs tracking-widest text-neutral-500 uppercase">{k}</p><p className="mt-1 font-serif text-3xl">{v}</p></div>
        ))}
      </div>
      <AdminClient initial={bookings} />
      <ManageTabs />
    </div>
  );
}
