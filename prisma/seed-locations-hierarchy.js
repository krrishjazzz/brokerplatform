/**
 * Seed hierarchical Location table (Kolkata focus).
 * Run: npx prisma migrate deploy && node prisma/seed-locations-hierarchy.js
 */
const { PrismaClient } = require("@prisma/client");

function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function upsertLocation(prisma, data) {
  const parentId = data.parentId ?? null;
  const slug = data.slug || slugify(data.name);
  const payload = {
    name: data.name,
    slug,
    type: data.type,
    parentId,
    cityId: data.cityId ?? null,
    state: data.state ?? "",
    country: data.country ?? "India",
    aliases: JSON.stringify(data.aliases ?? []),
    nearbyIds: JSON.stringify(data.nearbyIds ?? []),
    priority: data.priority ?? 0,
    latitude: data.lat ?? null,
    longitude: data.lng ?? null,
    isActive: true,
  };

  const existing = await prisma.location.findFirst({
    where: { slug, parentId },
  });

  if (existing) {
    return prisma.location.update({
      where: { id: existing.id },
      data: {
        name: payload.name,
        aliases: payload.aliases,
        nearbyIds: payload.nearbyIds,
        priority: payload.priority,
        isActive: true,
      },
    });
  }

  return prisma.location.create({ data: payload });
}

async function main() {
  const prisma = new PrismaClient();

  const india = await upsertLocation(prisma, {
    name: "India",
    type: "country",
    state: "",
    country: "India",
  });

  const wb = await upsertLocation(prisma, {
    name: "West Bengal",
    type: "state",
    parentId: india.id,
    state: "West Bengal",
    country: "India",
  });

  const kolkata = await upsertLocation(prisma, {
    name: "Kolkata",
    type: "city",
    parentId: wb.id,
    state: "West Bengal",
    country: "India",
    aliases: ["Calcutta"],
    priority: 100,
  });
  await prisma.location.update({
    where: { id: kolkata.id },
    data: { cityId: kolkata.id },
  });

  const zones = [
    { name: "East Kolkata", slug: "east-kolkata" },
    { name: "South Kolkata", slug: "south-kolkata" },
    { name: "Central Kolkata", slug: "central-kolkata" },
    { name: "North Kolkata", slug: "north-kolkata" },
  ];
  const zoneIds = {};
  for (const z of zones) {
    const row = await upsertLocation(prisma, {
      name: z.name,
      slug: z.slug,
      type: "zone",
      parentId: kolkata.id,
      cityId: kolkata.id,
      state: "West Bengal",
    });
    zoneIds[z.slug] = row.id;
  }

  const localities = [
    {
      name: "Salt Lake",
      zone: "east-kolkata",
      aliases: ["Saltlake", "Bidhannagar", "Bidhan Nagar"],
      priority: 90,
      nearby: [],
    },
    {
      name: "New Town",
      zone: "east-kolkata",
      aliases: ["Newtown", "Rajarhat New Town"],
      priority: 88,
    },
    {
      name: "Rajarhat",
      zone: "east-kolkata",
      aliases: [],
      priority: 85,
    },
    {
      name: "EM Bypass",
      zone: "east-kolkata",
      aliases: ["Eastern Metropolitan Bypass", "EM Bypass Kolkata"],
      priority: 70,
    },
    {
      name: "Ballygunge",
      zone: "south-kolkata",
      aliases: ["Ballygunj", "Ballygunge Place"],
      priority: 82,
    },
    {
      name: "Garia",
      zone: "south-kolkata",
      aliases: [],
      priority: 75,
    },
    {
      name: "Jadavpur",
      zone: "south-kolkata",
      aliases: [],
      priority: 72,
    },
    {
      name: "Tollygunge",
      zone: "south-kolkata",
      aliases: ["Tollygunj"],
      priority: 70,
    },
    {
      name: "Behala",
      zone: "south-kolkata",
      aliases: [],
      priority: 68,
    },
    {
      name: "Park Street",
      zone: "central-kolkata",
      aliases: ["Camac Street"],
      priority: 80,
    },
  ];

  const localityIds = {};
  for (const loc of localities) {
    const row = await upsertLocation(prisma, {
      name: loc.name,
      type: "locality",
      parentId: zoneIds[loc.zone],
      cityId: kolkata.id,
      state: "West Bengal",
      aliases: loc.aliases ?? [],
      priority: loc.priority ?? 0,
    });
    localityIds[slugify(loc.name)] = row.id;
  }

  await upsertLocation(prisma, {
    name: "Sector V",
    type: "sublocality",
    parentId: localityIds["salt-lake"],
    cityId: kolkata.id,
    state: "West Bengal",
    aliases: ["Sec V", "Salt Lake Sector 5", "Sector 5"],
    priority: 75,
  });

  const saltLakeId = localityIds["salt-lake"];
  const newTownId = localityIds["new-town"];
  const rajarhatId = localityIds["rajarhat"];
  if (saltLakeId && newTownId && rajarhatId) {
    await prisma.location.update({
      where: { id: saltLakeId },
      data: { nearbyIds: JSON.stringify([newTownId, rajarhatId]) },
    });
    await prisma.location.update({
      where: { id: newTownId },
      data: { nearbyIds: JSON.stringify([saltLakeId, rajarhatId]) },
    });
  }

  const howrah = await upsertLocation(prisma, {
    name: "Howrah",
    type: "city",
    parentId: wb.id,
    state: "West Bengal",
    priority: 50,
  });
  await prisma.location.update({
    where: { id: howrah.id },
    data: { cityId: howrah.id },
  });

  await upsertLocation(prisma, {
    name: "Howrah",
    type: "locality",
    parentId: howrah.id,
    cityId: howrah.id,
    state: "West Bengal",
    priority: 50,
  });

  const count = await prisma.location.count();
  console.log(`Seeded ${count} locations in hierarchy.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
