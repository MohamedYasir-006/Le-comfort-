import Image from "next/image";
import { NEARBY_STORES, SITE } from "@/lib/site";

export default function LocationPage() {
  return (
    <div className="pt-28 pb-16">
      <div className="mx-auto max-w-6xl px-5">
        <h1 className="text-center font-serif text-5xl font-light">Location</h1>
        <p className="mt-2 text-center text-neutral-600">{SITE.address}</p>
        <div className="mt-8 overflow-hidden">
          <iframe title="Le Comfort map" src={SITE.mapsEmbed} className="h-[420px] w-full border-0" loading="lazy" />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href={SITE.mapsUrl} target="_blank" rel="noreferrer" className="bg-neutral-900 px-8 py-3 text-sm tracking-[0.12em] text-white uppercase">Get Directions</a>
          <a href={SITE.phoneHref} className="border border-neutral-900 px-8 py-3 text-sm tracking-[0.12em] uppercase">Call {SITE.phone}</a>
        </div>
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl font-light">Getting here</h2>
            <ul className="mt-4 space-y-3 text-[15px] text-neutral-700">
              <li><b>Nagore Dargah Shariff</b> — close by on Meen Kadai Line, an easy walk from our door.</li>
              <li><b>Velankanni Basilica</b> — ≈ 20 min drive (placeholder, owner to confirm).</li>
              <li><b>Nagapattinam Junction</b> — ≈ 15 min drive; Trichy Airport ≈ 3 hrs (placeholders).</li>
            </ul>
            <p className="mt-3 text-xs text-neutral-400">Distances are placeholders — owner to confirm real timings.</p>
          </div>
          <div>
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200">
              <Image src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1600&auto=format&fit=crop" alt="Parking and approach road (placeholder)" fill loading="lazy" sizes="50vw" className="object-cover" />
            </div>
            <h3 className="mt-4 font-serif text-2xl font-light">Parking & stores</h3>
            <p className="mt-2 text-[15px] text-neutral-600">Free on-site parking for cars and two-wheelers.</p>
            <ul className="mt-3 divide-y divide-neutral-200">
              {NEARBY_STORES.map((s) => (
                <li key={s.name} className="py-2 text-sm"><b>{s.name}</b> — {s.distance}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
