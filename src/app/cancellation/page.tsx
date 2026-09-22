import { CANCELLATION_POLICY_SHORT } from "@/lib/site";

export default function CancellationPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-28 pb-16">
      <h1 className="font-serif text-5xl font-light">Cancellation Policy</h1>
      <p className="mt-6 leading-relaxed text-neutral-700">{CANCELLATION_POLICY_SHORT}</p>
      <p className="mt-4 leading-relaxed text-neutral-700">To cancel, use the private manage-booking link emailed to you, or call/email us directly. Refunds (if any offline advance was paid) are processed to the original offline mode within 7 days.</p>
      <p className="mt-4 text-sm text-neutral-500">Placeholder policy text — owner to confirm exact windows and charges.</p>
    </div>
  );
}
