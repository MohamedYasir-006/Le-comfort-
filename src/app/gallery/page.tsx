"use client";

import Image from "next/image";
import { useState } from "react";
import { GALLERY_PHOTOS } from "@/lib/data";

const CATS = ["all", "room", "exterior", "parking", "amenity", "gallery"] as const;

export default function GalleryPage() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("all");
  const photos = GALLERY_PHOTOS.filter((p) => cat === "all" || p.category === cat);
  return (
    <div className="pt-28 pb-16">
      <div className="mx-auto max-w-6xl px-5">
        <h1 className="text-center font-serif text-5xl font-light">Gallery</h1>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-4 py-2 text-xs tracking-[0.18em] uppercase ${cat === c ? "bg-neutral-900 text-white" : "border border-neutral-300 text-neutral-600"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {photos.map((p, i) => (
            <div key={p.url + i} className="relative aspect-[4/3] overflow-hidden bg-neutral-200">
              <Image src={p.url} alt={p.altText} fill loading="lazy" sizes="(max-width:768px)100vw,33vw" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
