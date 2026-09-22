"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export type Slide = { url: string; alt: string; headline: string; sub: string };

export default function Hero({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const next = useCallback(() => setI((v) => (v + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setI((v) => (v - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <section className="relative h-[92vh] min-h-[540px] w-full overflow-hidden bg-black" aria-label="Property photos">
      {slides.map((s, idx) => (
        <div
          key={s.url}
          className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0"}`}
          aria-hidden={idx !== i}
        >
          <Image src={s.url} alt={s.alt} fill priority={idx === 0} className="object-cover" sizes="100vw" />
        </div>
      ))}
      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col items-center justify-center px-5 text-center text-white">
        <p className="font-serif text-xl italic opacity-90 md:text-2xl">“Quiet rooms, honest hospitality.”</p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight font-light md:text-6xl">
          {slides[i].headline}
        </h1>
        <p className="mt-3 text-xs tracking-[0.3em] uppercase opacity-90">{slides[i].sub}</p>
      </div>
      <div className="absolute inset-x-0 bottom-24 flex justify-center gap-2">
        {slides.map((s, idx) => (
          <button
            key={s.url}
            onClick={() => setI(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`h-1.5 w-8 transition-colors ${idx === i ? "bg-white" : "bg-white/40"}`}
          />
        ))}
      </div>
      <button onClick={prev} aria-label="Previous photo" className="absolute top-1/2 left-4 -translate-y-1/2 p-3 text-3xl text-white/80 hover:text-white">‹</button>
      <button onClick={next} aria-label="Next photo" className="absolute top-1/2 right-4 -translate-y-1/2 p-3 text-3xl text-white/80 hover:text-white">›</button>
    </section>
  );
}
