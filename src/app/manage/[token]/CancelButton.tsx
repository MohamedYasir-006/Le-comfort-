"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelButton({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function cancel() {
    if (!confirm("Cancel this booking request?")) return;
    setBusy(true);
    const res = await fetch(`/api/manage/${token}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert("Could not cancel. Please call us.");
    setBusy(false);
  }
  return (
    <button onClick={cancel} disabled={busy} className="border border-red-800 px-6 py-2.5 text-sm tracking-widest text-red-800 uppercase disabled:opacity-50">
      {busy ? "Cancelling…" : "Cancel request"}
    </button>
  );
}
