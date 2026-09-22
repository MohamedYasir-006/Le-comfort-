import type { MetadataRoute } from "next";

export default function Sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const slugs = ["standard-room", "deluxe-room", "executive-room"];
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/rooms`, changeFrequency: "weekly", priority: 0.9 },
    ...slugs.map((s) => ({ url: `${base}/rooms/${s}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    { url: `${base}/location`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/gallery`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/reviews`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.5 },
  ];
}
