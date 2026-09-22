import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 pt-36 pb-20 text-center">
      <h1 className="font-serif text-6xl font-light">Not found</h1>
      <p className="mt-4 text-neutral-600">That page doesn&apos;t exist — but a quiet room in Nagore does.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="bg-neutral-900 px-8 py-3 text-sm tracking-widest text-white uppercase">Home</Link>
        <Link href="/rooms" className="border border-neutral-900 px-8 py-3 text-sm tracking-widest uppercase">Rooms</Link>
      </div>
    </div>
  );
}
