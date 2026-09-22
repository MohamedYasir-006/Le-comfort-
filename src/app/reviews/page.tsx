import { PLACEHOLDER_REVIEWS } from "@/lib/data";
import { dbAvailable, prisma } from "@/lib/prisma";
import ReviewForm from "./ReviewForm";

export default async function ReviewsPage() {
  let reviews = PLACEHOLDER_REVIEWS.map((r) => ({ guestName: r.guestName, rating: r.rating, comment: r.comment }));
  if (await dbAvailable()) {
    try {
      const db = await prisma.review.findMany({ where: { isApproved: true }, orderBy: { createdAt: "desc" }, take: 50 });
      if (db.length) reviews = db.map((r) => ({ guestName: r.guestName, rating: r.rating, comment: r.comment }));
    } catch { /* fallback */ }
  }
  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : "—";
  return (
    <div className="mx-auto max-w-3xl px-5 pt-28 pb-16">
      <h1 className="text-center font-serif text-5xl font-light">Reviews</h1>
      <p className="mt-2 text-center text-neutral-500">Average {avg} / 5 · {reviews.length} approved reviews</p>
      <div className="mt-8 space-y-4">
        {reviews.map((r, i) => (
          <figure key={i} className="border border-neutral-200 bg-white p-6 text-center">
            <p className="font-serif text-3xl font-light">{r.rating} / 5</p>
            <blockquote className="mt-2">“{r.comment}”</blockquote>
            <figcaption className="mt-2 text-xs tracking-widest text-neutral-500 uppercase">— {r.guestName}</figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-12 border-t border-neutral-200 pt-8">
        <h2 className="font-serif text-3xl font-light">Stayed with us? Leave a review</h2>
        <ReviewForm />
      </div>
    </div>
  );
}
