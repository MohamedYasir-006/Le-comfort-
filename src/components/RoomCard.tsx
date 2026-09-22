import Image from "next/image";
import Link from "next/link";
import { inr, type RoomDTO } from "@/lib/data";

export default function RoomCard({ room, checkin, checkout }: { room: RoomDTO; checkin?: string; checkout?: string }) {
  const q = checkin && checkout ? `?checkin=${checkin}&checkout=${checkout}` : "";
  return (
    <Link href={`/rooms/${room.slug}${q}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200">
        <Image
          src={room.photos[0]?.url ?? ""}
          alt={room.photos[0]?.altText ?? room.name}
          fill
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="pt-4 text-center">
        <h3 className="font-serif text-2xl font-light text-neutral-900">{room.name}</h3>
        <p className="mt-1 text-sm text-neutral-500">
          {room.bedConfig} · Up to {room.maxGuests} guests
        </p>
        <p className="mt-2 text-[15px] text-neutral-800">
          from <span className="font-semibold">{inr(room.basePricePerNight)}</span> / night
        </p>
        <span className="mt-3 inline-block border-b border-neutral-900 pb-0.5 text-xs tracking-[0.2em] uppercase group-hover:border-[#9a6b2f] group-hover:text-[#9a6b2f]">
          View Details
        </span>
      </div>
    </Link>
  );
}
