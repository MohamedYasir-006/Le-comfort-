import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="bg-[#1c1a17] text-neutral-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold tracking-[0.18em] text-white uppercase">{SITE.name}</p>
          <p className="mt-1 text-xs tracking-[0.22em] text-neutral-400 uppercase">{SITE.tagline}</p>
          <div className="mt-6 space-y-2 text-[15px]">
            <a href={SITE.mapsUrl} target="_blank" rel="noreferrer" className="block hover:text-white">
              {SITE.address}
            </a>
            <a href={SITE.phoneHref} className="block text-lg text-white hover:underline">
              {SITE.phone}
            </a>
            <a href={SITE.emailHref} className="block hover:text-white">
              {SITE.email}
            </a>
          </div>
        </div>
        <div>
          <p className="text-xs tracking-[0.22em] text-neutral-400 uppercase">Explore</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[15px]">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/rooms" className="hover:text-white">Rooms</Link>
            <Link href="/location" className="hover:text-white">Location</Link>
            <Link href="/gallery" className="hover:text-white">Gallery</Link>
            <Link href="/reviews" className="hover:text-white">Reviews</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
          <div className="mt-6 flex gap-4 text-sm">
            <a href="#" aria-label="Instagram" className="hover:text-white">Instagram</a>
            <a href="#" aria-label="Facebook" className="hover:text-white">Facebook</a>
            <a href={SITE.whatsapp} aria-label="WhatsApp" className="hover:text-white">WhatsApp</a>
          </div>
        </div>
        <div>
          <p className="text-xs tracking-[0.22em] text-neutral-400 uppercase">Good to know</p>
          <div className="mt-4 space-y-2 text-sm text-neutral-400">
            <Link href="/terms" className="block hover:text-white">Terms of Service</Link>
            <Link href="/cancellation" className="block hover:text-white">Cancellation Policy</Link>
            <Link href="/privacy" className="block hover:text-white">Privacy Policy</Link>
            <p className="pt-3 leading-relaxed">
              Request-to-book only — no online payment. Pay offline on arrival (cash / UPI) or via a manual
              link our team sends after confirmation.
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-5 py-5 text-xs text-neutral-500 sm:flex-row">
          <span>© {new Date().getFullYear()} {SITE.name}, Nagore. All rights reserved.</span>
          <span>Check-in {SITE.checkInTime} · Check-out {SITE.checkOutTime}</span>
        </div>
      </div>
    </footer>
  );
}
