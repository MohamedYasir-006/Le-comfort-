export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-32 pb-20" aria-busy="true" aria-label="Loading">
      <div className="mx-auto h-8 w-48 animate-pulse bg-neutral-200" />
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <div className="aspect-[4/3] animate-pulse bg-neutral-200" />
            <div className="mx-auto mt-4 h-5 w-2/3 animate-pulse bg-neutral-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
