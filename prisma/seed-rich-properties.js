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

const SAMPLE_BROKERS = [
  {
    phone: "+919900000101",
    name: "Raj Malhotra",
    email: "raj@skylinekrrishjazz.test",
    agency: "Skyline Realty Network",
    rera: "WB/RERA/BRK/2026/101",
    experience: 9,
    city: "Kolkata",
    serviceAreas: ["New Town", "Salt Lake", "Rajarhat", "EM Bypass"],
    bio: "Residential rental and resale broker with fast owner confirmation habits.",
  },
  {
    phone: "+919900000102",
    name: "Priya Sen",
    email: "priya@urbannestkrrishjazz.test",
    agency: "UrbanNest Brokers",
    rera: "WB/RERA/BRK/2026/102",
    experience: 7,
    city: "Kolkata",
    serviceAreas: ["Park Street", "Ballygunge", "Salt Lake", "New Town"],
    bio: "Premium apartment and serviced living specialist for relocation clients.",
  },
  {
    phone: "+919900000103",
    name: "Arjun Mehta",
    email: "arjun@eastwestkrrishjazz.test",
    agency: "EastWest Commercial",
    rera: "HR/RERA/BRK/2026/103",
    experience: 11,
    city: "Gurugram",
    serviceAreas: ["Golf Course Road", "Cyber City", "Sohna Road", "Udyog Vihar"],
    bio: "Commercial leasing broker focused on offices, showrooms, and warehouses.",
  },
];

const BROKER_SAMPLE_PROPERTIES = [
  {
    brokerPhone: "+919900000101",
    slug: "broker-network-new-town-2bhk-view-apartment",
    title: "2 BHK View Apartment for Rent in New Town",
    description: "Broker-network rental apartment with lift, parking, balcony, and recently confirmed availability.",
    listingType: "RENT",
    category: "RESIDENTIAL",
    propertyType: "Apartment",
    price: 32000,
    area: 1120,
    areaUnit: "sqft",
    bedrooms: 2,
    bathrooms: 2,
    floor: 9,
    totalFloors: 18,
    furnishing: "Semi-Furnished",
    amenities: ["Lift", "Parking", "24x7 Security", "Power Backup", "Balcony"],
    address: "Action Area 1, New Town Main Road",
    locality: "New Town",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700156",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
    ],
    visibilityType: "FULL_VISIBILITY",
    publicBrokerName: "KrrishJazz",
  },
  {
    brokerPhone: "+919900000101",
    slug: "broker-network-salt-lake-independent-house",
    title: "Independent House for Sale in Salt Lake",
    description: "Corner house with wide road access, parking, and redevelopment potential for serious buyer requirements.",
    listingType: "BUY",
    category: "RESIDENTIAL",
    propertyType: "Independent House",
    price: 18500000,
    area: 2400,
    areaUnit: "sqft",
    bedrooms: 4,
    bathrooms: 4,
    floor: 1,
    totalFloors: 2,
    furnishing: "Unfurnished",
    amenities: ["Parking", "Garden", "Water Supply", "Road Access"],
    address: "Sector 2, Salt Lake",
    locality: "Salt Lake",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700091",
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200",
    ],
    visibilityType: "BROKER_NETWORK_ONLY",
    publicBrokerName: "KrrishJazz",
  },
  {
    brokerPhone: "+919900000102",
    slug: "broker-network-ballygunge-premium-3bhk",
    title: "Premium 3 BHK Apartment in Ballygunge",
    description: "Owner flexible on rent for verified family tenant. Good society, clubhouse, lift, and two car parks.",
    listingType: "RENT",
    category: "RESIDENTIAL",
    propertyType: "Apartment",
    price: 78000,
    area: 1850,
    areaUnit: "sqft",
    bedrooms: 3,
    bathrooms: 3,
    floor: 7,
    totalFloors: 14,
    furnishing: "Fully Furnished",
    amenities: ["Lift", "Parking", "Gym", "Clubhouse", "24x7 Security"],
    address: "Ballygunge Circular Road",
    locality: "Ballygunge",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700019",
    images: [
      "https://images.unsplash.com/photo-1615873968403-89e068629265?w=1200",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200",
    ],
    visibilityType: "FULL_VISIBILITY",
    publicBrokerName: "KrrishJazz",
  },
  {
    brokerPhone: "+919900000102",
    slug: "broker-network-park-street-serviced-apartment",
    title: "Serviced Apartment for Lease near Park Street",
    description: "Corporate-ready serviced apartment with housekeeping, Wi-Fi, food service, and flexible lease terms.",
    listingType: "LEASE",
    category: "HOSPITALITY",
    propertyType: "Serviced Apartment",
    price: 95000,
    area: 900,
    areaUnit: "sqft",
    bedrooms: 2,
    bathrooms: 2,
    floor: 5,
    totalFloors: 10,
    furnishing: "Fully Furnished",
    amenities: ["Wi-Fi", "Housekeeping", "Food Service", "Lift", "Power Backup"],
    address: "Middleton Street, Park Street Area",
    locality: "Park Street",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700071",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
      "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=1200",
    ],
    visibilityType: "BROKER_NETWORK_ONLY",
    publicBrokerName: "KrrishJazz",
  },
  {
    brokerPhone: "+919900000103",
    slug: "broker-network-golf-course-road-office",
    title: "Managed Office Space on Golf Course Road",
    description: "Plug-and-play commercial office with conference room, reception, power backup, and metro-side visibility.",
    listingType: "LEASE",
    category: "COMMERCIAL",
    propertyType: "Office Space",
    price: 240000,
    area: 3200,
    areaUnit: "sqft",
    bedrooms: null,
    bathrooms: 2,
    floor: 11,
    totalFloors: 18,
    furnishing: "Fully Furnished",
    amenities: ["Parking", "Lift", "Power Backup", "CCTV", "Fire Safety"],
    address: "Golf Course Road Business Tower",
    locality: "Golf Course Road",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122002",
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200",
    ],
    visibilityType: "FULL_VISIBILITY",
    publicBrokerName: "KrrishJazz",
  },
  {
    brokerPhone: "+919900000103",
    slug: "broker-network-udyog-vihar-warehouse",
    title: "Warehouse / Godown for Lease in Udyog Vihar",
    description: "High-clearance warehouse with truck access, loading bay, three phase power, and security.",
    listingType: "LEASE",
    category: "INDUSTRIAL",
    propertyType: "Warehouse / Godown",
    price: 185000,
    area: 7200,
    areaUnit: "sqft",
    bedrooms: null,
    bathrooms: 2,
    floor: 0,
    totalFloors: 1,
    furnishing: "Unfurnished",
    amenities: ["Truck Access", "Loading Dock", "Three Phase Power", "CCTV", "Fire Safety"],
    address: "Phase 4, Udyog Vihar",
    locality: "Udyog Vihar",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122016",
    images: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200",
      "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1200",
    ],
    visibilityType: "BROKER_NETWORK_ONLY",
    publicBrokerName: "KrrishJazz",
  },
];

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

async function seedSampleBrokers() {
  const brokerProfiles = new Map();

  for (const broker of SAMPLE_BROKERS) {
    const profile = await prisma.profile.upsert({
      where: { phone: broker.phone },
      update: {
        name: broker.name,
        email: broker.email,
        role: "BROKER",
        isActive: true,
      },
      create: {
        phone: broker.phone,
        name: broker.name,
        email: broker.email,
        role: "BROKER",
        isActive: true,
      },
    });

    await prisma.brokerProfile.upsert({
      where: { profileId: profile.id },
      update: {
        rera: broker.rera,
        experience: broker.experience,
        city: broker.city,
        serviceAreas: JSON.stringify(broker.serviceAreas),
        bio: `${broker.agency}. ${broker.bio}`,
        status: "APPROVED",
        responseScore: 86,
        completedCollaborations: 14,
        profileCompletion: 92,
        lastActiveAt: new Date(),
      },
      create: {
        profileId: profile.id,
        rera: broker.rera,
        experience: broker.experience,
        city: broker.city,
        serviceAreas: JSON.stringify(broker.serviceAreas),
        bio: `${broker.agency}. ${broker.bio}`,
        status: "APPROVED",
        responseScore: 86,
        completedCollaborations: 14,
        profileCompletion: 92,
        lastActiveAt: new Date(),
      },
    });

    brokerProfiles.set(broker.phone, profile);
  }

  return brokerProfiles;
}

async function seedBrokerNetworkProperties(brokerProfiles) {
  let count = 0;

  for (const sample of BROKER_SAMPLE_PROPERTIES) {
    const broker = brokerProfiles.get(sample.brokerPhone);
    if (!broker) continue;

    const property = await prisma.property.upsert({
      where: { slug: sample.slug },
      update: {
        title: sample.title,
        description: sample.description,
        listingType: sample.listingType,
        category: sample.category,
        propertyType: sample.propertyType,
        price: sample.price,
        priceNegotiable: true,
        area: sample.area,
        areaUnit: sample.areaUnit,
        bedrooms: sample.bedrooms,
        bathrooms: sample.bathrooms,
        floor: sample.floor,
        totalFloors: sample.totalFloors,
        ageYears: 2,
        furnishing: sample.furnishing,
        amenities: JSON.stringify(sample.amenities),
        address: sample.address,
        locality: sample.locality,
        city: sample.city,
        state: sample.state,
        pincode: sample.pincode,
        images: JSON.stringify(sample.images),
        coverImage: sample.images[0],
        visibilityType: sample.visibilityType,
        listingStatus: "AVAILABLE",
        publicBrokerName: sample.publicBrokerName,
        status: "LIVE",
        postedById: broker.id,
        assignedBrokerId: broker.id,
      },
      create: {
        title: sample.title,
        slug: sample.slug,
        description: sample.description,
        listingType: sample.listingType,
        category: sample.category,
        propertyType: sample.propertyType,
        price: sample.price,
        priceNegotiable: true,
        area: sample.area,
        areaUnit: sample.areaUnit,
        bedrooms: sample.bedrooms,
        bathrooms: sample.bathrooms,
        floor: sample.floor,
        totalFloors: sample.totalFloors,
        ageYears: 2,
        furnishing: sample.furnishing,
        amenities: JSON.stringify(sample.amenities),
        address: sample.address,
        locality: sample.locality,
        city: sample.city,
        state: sample.state,
        pincode: sample.pincode,
        images: JSON.stringify(sample.images),
        coverImage: sample.images[0],
        visibilityType: sample.visibilityType,
        listingStatus: "AVAILABLE",
        publicBrokerName: sample.publicBrokerName,
        status: "LIVE",
        postedById: broker.id,
        assignedBrokerId: broker.id,
      },
    });

    await prisma.listingFreshness.deleteMany({
      where: {
        propertyId: property.id,
        note: "Seeded broker network listing with direct broker contact",
      },
    });

    await prisma.listingFreshness.create({
      data: {
        propertyId: property.id,
        confirmedById: broker.id,
        availabilityStatus: "AVAILABLE",
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        note: "Seeded broker network listing with direct broker contact",
      },
    });

    count += 1;
  }

  return count;
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
            visibilityType: "FULL_VISIBILITY",
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
            visibilityType: "FULL_VISIBILITY",
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

  const brokers = await seedSampleBrokers();
  const brokerPropertyCount = await seedBrokerNetworkProperties(brokers);

  console.log(`Seeded or updated ${count} sample owner properties across all property types.`);
  console.log(`Seeded or updated ${brokers.size} approved brokers and ${brokerPropertyCount} broker network properties.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
