"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV, SITE } from "@/lib/site";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#faf8f4]/95 shadow-[0_1px_0_rgba(0,0,0,0.08)] backdrop-blur" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="leading-tight">
          <span
            className={`block text-xl font-semibold tracking-[0.18em] uppercase ${
              scrolled ? "text-neutral-900" : "text-white"
            }`}
          >
            {SITE.name}
          </span>
          <span
            className={`block text-[10px] tracking-[0.22em] uppercase ${
              scrolled ? "text-neutral-500" : "text-white/80"
            }`}
          >
            Nagore · Nagapattinam
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {NAV.map((n) => (
            <Link
              key={n.href + n.label}
              href={n.href}
              className={`text-[13px] tracking-[0.14em] uppercase transition-colors ${
                scrolled ? "text-neutral-700 hover:text-black" : "text-white/90 hover:text-white"
              }`}
            >
              {n.label}
            </Link>
          ))}
          <span className={`hidden items-center gap-3 lg:flex ${scrolled ? "text-neutral-600" : "text-white/85"}`}>
            <a href={SITE.mapsUrl} target="_blank" rel="noreferrer" aria-label="Directions" className="hover:opacity-70">⌖</a>
            <a href={SITE.phoneHref} aria-label="Call" className="hover:opacity-70">✆</a>
            <a href={SITE.emailHref} aria-label="Email" className="hover:opacity-70">✉</a>
          </span>
          <Link
            href="/rooms?checkin=&checkout=&guests=2#search"
            className="bg-[#9a6b2f] px-5 py-2.5 text-[13px] font-medium tracking-[0.12em] text-white uppercase transition-colors hover:bg-[#7d5623]"
          >
            Check Availability
          </Link>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <Link
            href="/rooms"
            className="bg-[#9a6b2f] px-4 py-2 text-xs font-medium tracking-wider text-white uppercase"
          >
            Book
          </Link>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className={`text-2xl leading-none ${scrolled ? "text-neutral-900" : "text-white"}`}
          >
            ≡
          </button>
        </div>
      </div>

      {open && (
        <nav className="bg-[#faf8f4] px-5 pt-2 pb-6 md:hidden" aria-label="Mobile">
          {NAV.map((n) => (
            <Link
              key={n.href + n.label}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block border-b border-neutral-200 py-3 text-sm tracking-[0.14em] text-neutral-800 uppercase"
            >
              {n.label}
            </Link>
          ))}
          <div className="flex gap-5 pt-4 text-sm text-neutral-600">
            <a href={SITE.phoneHref}>{SITE.phone}</a>
            <a href={SITE.emailHref}>{SITE.email}</a>
          </div>
        </nav>
      )}
    </header>
  );
}
