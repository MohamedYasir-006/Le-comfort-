import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/Hero";
import AvailabilitySearch from "@/components/AvailabilitySearch";
import RoomCard from "@/components/RoomCard";
import { HERO_SLIDES, PLACEHOLDER_REVIEWS, PLACEHOLDER_ROOMS } from "@/lib/data";
import { NEARBY_STORES, SITE } from "@/lib/site";
import { dbAvailable, prisma } from "@/lib/prisma";

async function getRooms() {
  if (await dbAvailable()) {
    try {
      const rooms = await prisma.room.findMany({
        where: { isActive: true },
        include: { photos: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      });
      if (rooms.length > 0)
        return rooms.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description,
          maxGuests: r.maxGuests,
          bedConfig: r.bedConfig,
          sizeSqft: r.sizeSqft,
          basePricePerNight: r.basePricePerNight,
          weekendPricePerNight: r.weekendPricePerNight,
          amenities: JSON.parse(r.amenities) as string[],
          floorPlanUrl: r.floorPlanUrl,
          isActive: r.isActive,
          photos: r.photos.map((p) => ({ url: p.url, altText: p.altText, category: p.category })),
        }));
    } catch {
      /* fall through to placeholders */
    }
  }
  return PLACEHOLDER_ROOMS;
}

export default async function Home() {
  const rooms = await getRooms();
  return (
    <>
      <Hero slides={HERO_SLIDES} />
      <div className="px-5">
        <AvailabilitySearch />
      </div>

      {/* Intro — editorial, narrow measure */}
      <section className="mx-auto max-w-2xl px-5 pt-20 pb-6 text-center">
        <p className="text-xs tracking-[0.3em] text-neutral-500 uppercase">{SITE.name} · Nagore</p>
        <h2 className="mt-4 font-serif text-3xl leading-snug font-light md:text-4xl">
          A quiet residency stay near the Nagore coast — simple rooms, honest hospitality, space to rest.
        </h2>
        <p className="mt-5 leading-relaxed text-neutral-600">
          Drawing on the calm of coastal Tamil Nadu, {SITE.name} is an easy base for pilgrims, families,
          and slow travellers — minutes from Nagore Dargah, with Velankanni and Nagapattinam a short drive away.
        </p>
      </section>

      {/* 3 photo tiles */}
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
        {[
          { href: "/location", img: HERO_SLIDES[0].url, cap: "Location — Nagore, Nagapattinam" },
          { href: "/rooms", img: rooms[0]?.photos[0]?.url ?? HERO_SLIDES[1].url, cap: "Rooms & Suites" },
          { href: "/gallery", img: HERO_SLIDES[2].url, cap: "Gallery" },
        ].map((t) => (
          <Link key={t.cap} href={t.href} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-200">
              <Image src={t.img} alt={t.cap} fill loading="lazy" sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <p className="pt-3 text-center text-xs tracking-[0.22em] text-neutral-600 uppercase">{t.cap}</p>
          </Link>
        ))}
      </section>

      {/* Rooms */}
      <section className="mx-auto max-w-6xl px-5 py-14" id="rooms">
        <h2 className="text-center font-serif text-4xl font-light">Rooms</h2>
        <p className="mt-2 text-center text-sm tracking-[0.2em] text-neutral-500 uppercase">Photo-led · minimal · honest pricing</p>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {rooms.map((r) => <RoomCard key={r.id} room={r} />)}
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-neutral-200 bg-white" id="amenities">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 text-center md:grid-cols-4">
          {[["500+", "guests hosted"], ["4.8 / 5", "average rating"], ["Free", "parking on-site"], ["WiFi · Room Service", "in every room"]].map(([a, b]) => (
            <div key={b}>
              <p className="font-serif text-3xl font-light">{a}</p>
              <p className="mt-1 text-xs tracking-[0.2em] text-neutral-500 uppercase">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Parking + supermarkets — client must-have */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center font-serif text-4xl font-light">Parking & Nearby Stores</h2>
        <div className="mt-10 grid items-start gap-10 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200">
            <Image src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1600&auto=format&fit=crop" alt="On-site parking at Le Comfort (placeholder photo)" fill loading="lazy" sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-light">Free on-site parking</h3>
            <p className="mt-3 leading-relaxed text-neutral-600">
              Step-in parking for cars and two-wheelers right at the property — no street hunting, no fees.
              The team can guide large vehicles on arrival.
            </p>
            <h4 className="mt-8 text-xs tracking-[0.22em] text-neutral-500 uppercase">Nearby supermarkets & essentials</h4>
            <ul className="mt-3 divide-y divide-neutral-200">
              {NEARBY_STORES.map((s) => (
                <li key={s.name} className="py-3">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-neutral-500">{s.distance} · {s.note}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-neutral-400">Store names & distances are placeholders — owner to confirm.</p>
          </div>
        </div>
      </section>

      {/* Reviews carousel */}
      <section className="bg-white py-16">
        <h2 className="text-center font-serif text-4xl font-light">Guests&apos; impressions</h2>
        <div className="mx-auto mt-8 flex max-w-6xl gap-6 overflow-x-auto px-5 pb-4">
          {PLACEHOLDER_REVIEWS.map((r) => (
            <figure key={r.comment} className="min-w-[280px] flex-1 border border-neutral-200 p-6 text-center">
              <p className="font-serif text-4xl font-light">{r.score}</p>
              <blockquote className="mt-2 text-[15px] text-neutral-700">“{r.comment}”</blockquote>
              <figcaption className="mt-3 text-xs tracking-[0.2em] text-neutral-500 uppercase">— {r.guestName}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-4 text-center"><Link href="/reviews" className="border-b border-neutral-900 pb-0.5 text-xs tracking-[0.2em] uppercase">All reviews</Link></p>
      </section>

      {/* Location teaser */}
      <section className="mx-auto max-w-6xl px-5 py-16 text-center">
        <h2 className="font-serif text-4xl font-light">Finding us</h2>
        <p className="mt-2 text-neutral-600">{SITE.address}</p>
        <div className="mt-8 overflow-hidden">
          <iframe title="Le Comfort map" src={SITE.mapsEmbed} className="h-[380px] w-full border-0" loading="lazy" />
        </div>
        <a href={SITE.mapsUrl} target="_blank" rel="noreferrer" className="mt-6 inline-block bg-neutral-900 px-8 py-3 text-sm tracking-[0.12em] text-white uppercase hover:bg-black">
          Get Directions
        </a>
      </section>
    </>
  );
}
