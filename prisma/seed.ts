import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PLACEHOLDER_ROOMS, PLACEHOLDER_REVIEWS } from "../src/lib/data";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Le Comfort…");
  for (const [idx, r] of PLACEHOLDER_ROOMS.entries()) {
    const room = await prisma.room.upsert({
      where: { slug: r.slug },
      update: {},
      create: {
        name: r.name, slug: r.slug, description: r.description,
        maxGuests: r.maxGuests, bedConfig: r.bedConfig, sizeSqft: r.sizeSqft,
        basePricePerNight: r.basePricePerNight, weekendPricePerNight: r.weekendPricePerNight,
        amenities: JSON.stringify(r.amenities), floorPlanUrl: r.floorPlanUrl, sortOrder: idx,
      },
    });
    for (const [pIdx, p] of r.photos.entries()) {
      await prisma.photo.create({
        data: { roomId: room.id, url: p.url, altText: p.altText, sortOrder: pIdx, category: "room" },
      });
    }
  }
  // Property-wide parking photos
  await prisma.photo.createMany({
    data: [
      { url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1600&auto=format&fit=crop", altText: "On-site parking", sortOrder: 0, category: "parking" },
      { url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1600&auto=format&fit=crop", altText: "Driveway", sortOrder: 1, category: "parking" },
    ],
  });
  for (const rev of PLACEHOLDER_REVIEWS) {
    await prisma.review.create({ data: { guestName: rev.guestName, rating: rev.rating, comment: rev.comment, isApproved: true } });
  }
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@lecomfort.in";
  const adminPass = process.env.ADMIN_PASSWORD ?? "admin123";
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash: await bcrypt.hash(adminPass, 10) },
  });
  console.log(`Done. Admin: ${adminEmail}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
