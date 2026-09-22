"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-5 pt-36 pb-20 text-center">
      <h1 className="font-serif text-5xl font-light">Something went wrong</h1>
      <p className="mt-4 text-sm text-neutral-500">{error.message || "Please try again."}</p>
      <button onClick={reset} className="mt-8 bg-neutral-900 px-8 py-3 text-sm tracking-widest text-white uppercase">
        Try again
      </button>
    </div>
  );
}
