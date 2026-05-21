/**
 * Seed LocationDictionary from static Kolkata data.
 * Run: node prisma/seed-locations.js
 * Requires: npx prisma migrate deploy (LocationDictionary table)
 */
const { PrismaClient } = require("@prisma/client");

const ENTRIES = [
  { city: "Kolkata", locality: "Salt Lake", subLocality: "", aliases: ["Bidhannagar", "Bidhan Nagar"], zone: "East Kolkata" },
  { city: "Kolkata", locality: "Salt Lake", subLocality: "Sector V", aliases: ["Sec V"], zone: "East Kolkata" },
  { city: "Kolkata", locality: "New Town", subLocality: "", aliases: ["Newtown", "Rajarhat New Town"], zone: "East Kolkata" },
  { city: "Kolkata", locality: "Rajarhat", subLocality: "", aliases: [], zone: "East Kolkata" },
  { city: "Kolkata", locality: "Ballygunge", subLocality: "", aliases: [], zone: "South Kolkata" },
  { city: "Kolkata", locality: "Park Street", subLocality: "", aliases: ["Camac Street"], zone: "Central Kolkata" },
  { city: "Kolkata", locality: "Behala", subLocality: "", aliases: [], zone: "South Kolkata" },
  { city: "Kolkata", locality: "EM Bypass", subLocality: "", aliases: ["Eastern Metropolitan Bypass"], zone: "East Kolkata" },
  { city: "Howrah", locality: "Howrah", subLocality: "", aliases: [], zone: "Howrah" },
];

async function main() {
  const prisma = new PrismaClient();
  for (const e of ENTRIES) {
    await prisma.locationDictionary.upsert({
      where: {
        city_locality_subLocality: {
          city: e.city,
          locality: e.locality,
          subLocality: e.subLocality || "",
        },
      },
      create: {
        city: e.city,
        locality: e.locality,
        subLocality: e.subLocality || "",
        aliases: JSON.stringify(e.aliases),
        zone: e.zone,
        nearbyLocalityIds: "[]",
      },
      update: {
        aliases: JSON.stringify(e.aliases),
        zone: e.zone,
        isActive: true,
      },
    });
  }
  console.log(`Seeded ${ENTRIES.length} location dictionary rows.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
