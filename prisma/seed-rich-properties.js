const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const PROPERTY_TYPES = {
  RESIDENTIAL: [
    "Apartment",
    "Builder Floor",
    "Independent House",
    "Villa",
    "Penthouse",
    "Studio Apartment",
    "Row House",
    "Residential Plot",
  ],
  COMMERCIAL: [
    "Office Space",
    "Co-working Space",
    "Shop",
    "Showroom",
    "SCO Plot",
    "Commercial Land",
    "Mall Space",
    "Restaurant / Cafe",
  ],
  INDUSTRIAL: [
    "Warehouse / Godown",
    "Factory",
    "Industrial Shed",
    "Industrial Building",
    "Industrial Plot",
    "Cold Storage",
    "Logistics Park",
  ],
  AGRICULTURAL: [
    "Agricultural Land",
    "Farm Land",
    "Farm House",
    "Plantation Land",
    "Orchard",
  ],
  HOSPITALITY: [
    "PG / Co-living",
    "Hostel",
    "Serviced Apartment",
    "Guest House",
    "Hotel / Resort",
  ],
};

const CITIES = [
  { city: "Kolkata", state: "West Bengal", locality: "New Town", pincode: "700156" },
  { city: "Kolkata", state: "West Bengal", locality: "Salt Lake", pincode: "700091" },
  { city: "Mumbai", state: "Maharashtra", locality: "Andheri West", pincode: "400053" },
  { city: "Bengaluru", state: "Karnataka", locality: "Whitefield", pincode: "560066" },
  { city: "Gurugram", state: "Haryana", locality: "Golf Course Road", pincode: "122002" },
];

const IMAGES = {
  RESIDENTIAL: [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
  ],
  COMMERCIAL: [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200",
  ],
  INDUSTRIAL: [
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200",
    "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1200",
  ],
  AGRICULTURAL: [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200",
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200",
  ],
  HOSPITALITY: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
  ],
};

const CATEGORY_AMENITIES = {
  RESIDENTIAL: ["Parking", "Lift", "24x7 Security", "Power Backup", "Gym", "Garden", "Balcony"],
  COMMERCIAL: ["Parking", "Lift", "Power Backup", "24x7 Security", "CCTV", "Fire Safety", "Visitor Parking"],
  INDUSTRIAL: ["Power Backup", "24x7 Security", "CCTV", "Fire Safety", "Loading Dock", "Truck Access", "Three Phase Power"],
  AGRICULTURAL: ["Water Supply", "Borewell", "Fencing", "Road Access", "Electricity"],
  HOSPITALITY: ["Parking", "24x7 Security", "Power Backup", "CCTV", "Wi-Fi", "Food Service", "Housekeeping"],
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function isLand(type) {
  return /(plot|land|orchard|plantation)/i.test(type);
}

function isResidential(type) {
  return /(apartment|floor|house|villa|penthouse|studio|row)/i.test(type);
}

function isHospitality(type) {
  return /(pg|hostel|serviced|guest|hotel|resort)/i.test(type);
}

function listingTypeFor(category, index) {
  if (category === "COMMERCIAL") return index % 2 === 0 ? "LEASE" : "COMMERCIAL";
  if (category === "INDUSTRIAL") return index % 2 === 0 ? "LEASE" : "BUY";
  if (category === "HOSPITALITY") return index % 2 === 0 ? "RENT" : "LEASE";
  if (category === "AGRICULTURAL") return "BUY";
  return index % 3 === 0 ? "RENT" : index % 3 === 1 ? "BUY" : "RESALE";
}

function priceFor(category, type, index) {
  if (category === "RESIDENTIAL") return listingTypeFor(category, index) === "RENT" ? 18000 + index * 9000 : 4200000 + index * 1850000;
  if (category === "COMMERCIAL") return isLand(type) ? 12500000 + index * 3500000 : 45000 + index * 38000;
  if (category === "INDUSTRIAL") return isLand(type) ? 18000000 + index * 5000000 : 85000 + index * 65000;
  if (category === "AGRICULTURAL") return 2200000 + index * 1800000;
  return type.includes("Hotel") ? 25000000 + index * 8000000 : 12000 + index * 12000;
}

function areaFor(category, type, index) {
  if (isLand(type) || category === "AGRICULTURAL") return 0.5 + index * 0.75;
  if (category === "INDUSTRIAL") return 3500 + index * 2200;
  if (category === "COMMERCIAL") return 350 + index * 450;
  if (category === "HOSPITALITY") return 450 + index * 650;
  return 650 + index * 300;
}

function areaUnitFor(category, type) {
  if (isLand(type) || category === "AGRICULTURAL") return "acre";
  return "sqft";
}

function bedroomsFor(type, index) {
  if (isResidential(type)) return Math.min(5, Math.max(1, index + 1));
  if (isHospitality(type)) return type.includes("Hotel") || type.includes("Guest") ? 8 + index * 3 : 1 + index;
  return null;
}

async function main() {
  const owner = await prisma.profile.upsert({
    where: { phone: "+919900000001" },
    update: { name: "KrrishJazz Sample Owner", role: "OWNER", isActive: true },
    create: {
      phone: "+919900000001",
      name: "KrrishJazz Sample Owner",
      email: "samples@krrishjazz.com",
      role: "OWNER",
    },
  });

  let count = 0;

  for (const [category, types] of Object.entries(PROPERTY_TYPES)) {
    for (const type of types) {
      for (let index = 0; index < 5; index += 1) {
        const place = CITIES[index % CITIES.length];
        const listingType = listingTypeFor(category, index);
        const title = `${type} ${listingType === "RENT" || listingType === "LEASE" ? "for Lease" : "for Sale"} in ${place.locality}`;
        const slug = `sample-${slugify(category)}-${slugify(type)}-${index + 1}`;
        const images = IMAGES[category];
        const rooms = bedroomsFor(type, index);

        const property = await prisma.property.upsert({
          where: { slug },
          update: {
            title,
            description: `Premium sample ${type.toLowerCase()} in ${place.locality}, ${place.city}. Includes portal-style details for search, filters, upload testing, and category-specific property cards.`,
            listingType,
            category,
            propertyType: type,
            price: priceFor(category, type, index),
            priceNegotiable: index % 2 === 0,
            area: areaFor(category, type, index),
            areaUnit: areaUnitFor(category, type),
            bedrooms: rooms,
            bathrooms: rooms ? Math.max(1, Math.min(rooms, 6)) : null,
            floor: isLand(type) ? null : index + 1,
            totalFloors: isLand(type) ? null : index + 6,
            ageYears: index,
            furnishing: isLand(type) ? null : index % 3 === 0 ? "Fully Furnished" : index % 3 === 1 ? "Semi-Furnished" : "Unfurnished",
            amenities: JSON.stringify(CATEGORY_AMENITIES[category]),
            address: `${12 + index}, ${place.locality} Main Road`,
            locality: place.locality,
            city: place.city,
            state: place.state,
            pincode: place.pincode,
            images: JSON.stringify(images),
            coverImage: images[0],
            visibilityType: "PUBLIC_TO_CUSTOMERS",
            listingStatus: "AVAILABLE",
            publicBrokerName: "KrrishJazz Verified",
            status: "LIVE",
            postedById: owner.id,
          },
          create: {
            title,
            slug,
            description: `Premium sample ${type.toLowerCase()} in ${place.locality}, ${place.city}. Includes portal-style details for search, filters, upload testing, and category-specific property cards.`,
            listingType,
            category,
            propertyType: type,
            price: priceFor(category, type, index),
            priceNegotiable: index % 2 === 0,
            area: areaFor(category, type, index),
            areaUnit: areaUnitFor(category, type),
            bedrooms: rooms,
            bathrooms: rooms ? Math.max(1, Math.min(rooms, 6)) : null,
            floor: isLand(type) ? null : index + 1,
            totalFloors: isLand(type) ? null : index + 6,
            ageYears: index,
            furnishing: isLand(type) ? null : index % 3 === 0 ? "Fully Furnished" : index % 3 === 1 ? "Semi-Furnished" : "Unfurnished",
            amenities: JSON.stringify(CATEGORY_AMENITIES[category]),
            address: `${12 + index}, ${place.locality} Main Road`,
            locality: place.locality,
            city: place.city,
            state: place.state,
            pincode: place.pincode,
            images: JSON.stringify(images),
            coverImage: images[0],
            visibilityType: "PUBLIC_TO_CUSTOMERS",
            listingStatus: "AVAILABLE",
            publicBrokerName: "KrrishJazz Verified",
            status: "LIVE",
            postedById: owner.id,
          },
        });

        await prisma.listingFreshness.deleteMany({
          where: {
            propertyId: property.id,
            note: "Seeded sample listing for portal-style inventory breadth",
          },
        });

        await prisma.listingFreshness.create({
          data: {
            propertyId: property.id,
            confirmedById: owner.id,
            availabilityStatus: "AVAILABLE",
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            note: "Seeded sample listing for portal-style inventory breadth",
          },
        });

        count += 1;
      }
    }
  }

  console.log(`Seeded or updated ${count} sample properties across all property types.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
