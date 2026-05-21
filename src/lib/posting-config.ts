/**
 * 99acres-style posting: Intent -> Category -> Property Type -> Dynamic fields
 */

export type ListingIntent = "SELL" | "RENT" | "LEASE" | "PG" | "PROJECT";

export type PostingCategory =
  | "RESIDENTIAL"
  | "COMMERCIAL"
  | "INDUSTRIAL"
  | "AGRICULTURAL"
  | "HOSPITALITY";

export type TypeFieldType = "text" | "number" | "select" | "textarea";

export type TypeFieldDef = {
  key: string;
  label: string;
  type: TypeFieldType;
  options?: string[];
  placeholder?: string;
};

/** Primary row on step 1 (owner posting). */
export const PRIMARY_POSTING_CHOICES: {
  id: "SELL" | "RENT_LEASE" | "PG";
  label: string;
  hint: string;
}[] = [
  { id: "SELL", label: "Sell", hint: "Owner selling outright" },
  { id: "RENT_LEASE", label: "Rent / Lease", hint: "Monthly rent; commercial/industrial becomes lease" },
  { id: "PG", label: "PG / Co-living", hint: "Beds, sharing, food and rules" },
];

export const POSTING_INTENTS: { id: ListingIntent; label: string; hint: string }[] = [
  { id: "SELL", label: "Sell", hint: "Owner selling outright" },
  { id: "RENT", label: "Rent", hint: "Monthly rental" },
  { id: "LEASE", label: "Lease", hint: "Commercial / long-term lease" },
  { id: "PG", label: "PG / Co-living", hint: "Beds, sharing, food & rules" },
];

export const POSTING_CATEGORIES: {
  value: PostingCategory;
  label: string;
  hint: string;
}[] = [
  { value: "RESIDENTIAL", label: "Residential", hint: "Flats, houses, villas, plots" },
  { value: "COMMERCIAL", label: "Commercial", hint: "Office, shop, showroom, land" },
  { value: "INDUSTRIAL", label: "Industrial", hint: "Warehouse, factory, shed, plot" },
  { value: "AGRICULTURAL", label: "Land / Agriculture", hint: "Farm land, farm house, orchard" },
  { value: "HOSPITALITY", label: "Hospitality", hint: "PG, hostel, serviced stay, hotel" },
];

/** Types allowed per intent + category (99acres-style). */
export const PROPERTY_TYPES_BY_INTENT: Record<
  ListingIntent,
  Partial<Record<PostingCategory, string[]>>
> = {
  SELL: {
    RESIDENTIAL: [
      "Apartment",
      "Builder Floor",
      "Independent House",
      "Villa",
      "Duplex",
      "Bungalow",
      "Residential Floor",
      "Penthouse",
      "Studio Apartment",
      "Row House",
      "Servant Room / Room",
      "Residential Plot",
    ],
    COMMERCIAL: [
      "Office Space",
      "Shop",
      "Showroom",
      "Co-working Space",
      "Business Center",
      "Clinic Space",
      "School / Institute Space",
      "Bank / ATM Space",
      "Commercial Land",
      "Mixed-use Land",
      "Mall Space",
      "Restaurant / Cafe",
    ],
    INDUSTRIAL: [
      "Warehouse / Godown",
      "RCC Warehouse",
      "Factory",
      "Manufacturing Unit",
      "Industrial Shed",
      "Industrial Plot",
      "Open Yard",
      "Cold Storage",
      "Logistics Park",
    ],
    AGRICULTURAL: [
      "Agricultural Land",
      "Farm Land",
      "Farm House",
      "Plantation Land",
      "Orchard",
      "Institutional Land",
    ],
    HOSPITALITY: [
      "Serviced Apartment",
      "Guest House",
      "Hotel / Resort",
      "Banquet Hall",
      "Resort Land",
      "Lodge",
    ],
  },
  RENT: {
    RESIDENTIAL: [
      "Apartment",
      "Builder Floor",
      "Independent House",
      "Villa",
      "Duplex",
      "Bungalow",
      "Residential Floor",
      "Penthouse",
      "Studio Apartment",
      "Row House",
      "Servant Room / Room",
    ],
    COMMERCIAL: [
      "Office Space",
      "Shop",
      "Showroom",
      "Co-working Space",
      "Business Center",
      "Clinic Space",
      "Restaurant / Cafe",
    ],
    INDUSTRIAL: ["Warehouse / Godown", "RCC Warehouse", "Industrial Shed", "Open Yard"],
    HOSPITALITY: ["Serviced Apartment", "Guest House"],
  },
  LEASE: {
    COMMERCIAL: [
      "Office Space",
      "Shop",
      "Showroom",
      "Co-working Space",
      "Business Center",
      "Commercial Land",
      "Mixed-use Land",
      "Mall Space",
      "Restaurant / Cafe",
    ],
    INDUSTRIAL: [
      "Warehouse / Godown",
      "RCC Warehouse",
      "Factory",
      "Manufacturing Unit",
      "Industrial Shed",
      "Industrial Building",
      "Industrial Plot",
      "Open Yard",
      "Logistics Park",
    ],
  },
  PG: {
    HOSPITALITY: ["PG / Co-living", "Hostel"],
  },
  PROJECT: {
    RESIDENTIAL: ["Residential Project"],
    COMMERCIAL: ["Commercial Project"],
  },
};

export function getPostingCategoriesForIntent(intent: ListingIntent): typeof POSTING_CATEGORIES {
  const allowed = PROPERTY_TYPES_BY_INTENT[intent];
  if (!allowed) return [];
  if (intent === "PG") {
    return POSTING_CATEGORIES.filter((c) => c.value === "HOSPITALITY");
  }
  return POSTING_CATEGORIES.filter((c) => allowed[c.value]?.length);
}

export function getPropertyTypesForPosting(
  intent: ListingIntent,
  category: PostingCategory
): string[] {
  return PROPERTY_TYPES_BY_INTENT[intent]?.[category] ?? [];
}

export function getIntentLabel(intent: ListingIntent): string {
  return POSTING_INTENTS.find((i) => i.id === intent)?.label ?? intent;
}

/** Map UI intent -> API listingType (+ flags in typeSpecificDetails). */
export function normalizeListingForApi(payload: {
  listingIntent: ListingIntent;
  category: PostingCategory;
  propertyType: string;
  typeSpecificDetails?: Record<string, unknown>;
}) {
  const details: Record<string, unknown> = {
    ...(payload.typeSpecificDetails ?? {}),
    listingIntent: payload.listingIntent,
  };

  let listingType: "BUY" | "RENT" | "LEASE";
  let category = payload.category;

  switch (payload.listingIntent) {
    case "SELL":
      listingType = "BUY";
      break;
    case "RENT":
      listingType = "RENT";
      break;
    case "LEASE":
      listingType = "LEASE";
      break;
    case "PG":
      listingType = "RENT";
      category = "HOSPITALITY";
      details.isPgListing = true;
      break;
    case "PROJECT":
      listingType = "BUY";
      details.isProject = true;
      break;
    default:
      listingType = "BUY";
  }

  return { listingType, category, typeSpecificDetails: details };
}

export type PriceFieldConfig = {
  primaryLabel: string;
  primaryKey: "price";
  showDeposit: boolean;
  depositLabel?: string;
  showRentPerBed?: boolean;
  showCam?: boolean;
  showLockIn?: boolean;
};

export function getPriceFieldsForIntent(intent: ListingIntent): PriceFieldConfig {
  switch (intent) {
    case "SELL":
      return { primaryLabel: "Expected price (Rs)", primaryKey: "price", showDeposit: false };
    case "RENT":
      return {
        primaryLabel: "Monthly rent (Rs)",
        primaryKey: "price",
        showDeposit: true,
        depositLabel: "Security deposit (Rs)",
        showLockIn: true,
      };
    case "LEASE":
      return {
        primaryLabel: "Lease rent (Rs / month)",
        primaryKey: "price",
        showDeposit: true,
        depositLabel: "Security deposit (Rs)",
        showCam: true,
        showLockIn: true,
      };
    case "PG":
      return {
        primaryLabel: "Rent per bed (Rs / month)",
        primaryKey: "price",
        showDeposit: true,
        depositLabel: "Deposit per bed (Rs)",
        showRentPerBed: true,
      };
    case "PROJECT":
      return { primaryLabel: "Starting price (Rs)", primaryKey: "price", showDeposit: false };
    default:
      return { primaryLabel: "Price (Rs)", primaryKey: "price", showDeposit: false };
  }
}

// --- Dynamic field definitions by property type ---

const f = (
  key: string,
  label: string,
  type: TypeFieldType = "text",
  options?: string[],
  placeholder?: string
): TypeFieldDef => ({ key, label, type, options, placeholder });

const RES_BUILT: TypeFieldDef[] = [
  f("bhk", "BHK", "select", ["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"]),
  f("bathrooms", "Bathrooms", "number"),
  f("balconies", "Balconies", "number"),
  f("carpetArea", "Carpet area", "number", undefined, "sq ft"),
  f("builtUpArea", "Built-up area", "number", undefined, "sq ft"),
  f("superBuiltUpArea", "Super built-up area", "number", undefined, "sq ft"),
  f("floor", "Floor", "number"),
  f("totalFloors", "Total floors", "number"),
  f("facing", "Facing", "select", ["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"]),
  f("parking", "Parking", "select", ["None", "1 Covered", "1 Open", "2+", "Stilt"]),
  f("ownershipType", "Ownership", "select", ["Freehold", "Leasehold", "Co-operative", "POA"]),
  f("maintenance", "Maintenance (Rs/month)", "number"),
  f("possession", "Possession", "select", ["Ready to move", "Under construction", "Within 3 months", "Within 6 months"]),
  f("societyOrProject", "Society / project name"),
];

const RES_PLOT: TypeFieldDef[] = [
  f("plotArea", "Plot area", "number", undefined, "sq ft or unit below"),
  f("length", "Length", "number", undefined, "ft"),
  f("breadth", "Breadth", "number", undefined, "ft"),
  f("roadWidth", "Road width", "number", undefined, "ft"),
  f("facing", "Facing", "select", ["East", "West", "North", "South"]),
  f("boundaryWall", "Boundary wall", "select", ["Yes", "No", "Partial"]),
  f("cornerPlot", "Corner plot", "select", ["Yes", "No"]),
  f("gatedSociety", "Gated society", "select", ["Yes", "No"]),
  f("conversionStatus", "Conversion status"),
  f("waterElectricity", "Water / electricity", "select", ["Available", "Nearby", "Not available"]),
];

const VILLA_FIELDS: TypeFieldDef[] = [
  ...RES_BUILT,
  f("plotArea", "Plot area", "number", undefined, "sq ft"),
  f("gardenLawn", "Garden / lawn", "select", ["Yes", "No"]),
  f("terrace", "Terrace", "select", ["Private", "Shared", "None"]),
  f("roadWidth", "Road width", "number", undefined, "ft"),
  f("renovationStatus", "Renovation status", "select", ["New", "Well maintained", "Needs renovation"]),
];

const OFFICE_FIELDS: TypeFieldDef[] = [
  f("carpetArea", "Carpet area", "number", undefined, "sq ft"),
  f("builtUpArea", "Built-up area", "number", undefined, "sq ft"),
  f("seats", "Seats", "number"),
  f("cabins", "Cabins", "number"),
  f("conferenceRooms", "Conference rooms", "number"),
  f("pantry", "Pantry", "select", ["Yes", "No", "Shared"]),
  f("washrooms", "Washrooms", "number"),
  f("floor", "Floor", "number"),
  f("totalFloors", "Total floors", "number"),
  f("fitOut", "Fit-out", "select", ["Bare shell", "Warm shell", "Furnished", "Plug-and-play"]),
  f("powerBackup", "Power backup", "select", ["Full", "Partial", "None", "DG"]),
  f("parking", "Parking", "text"),
  f("lift", "Lift", "select", ["Yes", "No"]),
  f("suitableFor", "Suitable for", "text", undefined, "e.g. IT, CA, clinic"),
  f("camMaintenance", "CAM / maintenance (Rs/sq ft)", "number"),
];

const SHOP_FIELDS: TypeFieldDef[] = [
  f("carpetArea", "Carpet area", "number", undefined, "sq ft"),
  f("frontage", "Frontage", "number", undefined, "ft"),
  f("ceilingHeight", "Ceiling height", "number", undefined, "ft"),
  f("floor", "Floor", "number"),
  f("roadWidth", "Road width", "number", undefined, "ft"),
  f("mainRoadVisibility", "Main road visibility", "select", ["High", "Medium", "Low"]),
  f("footfall", "Footfall", "select", ["High", "Medium", "Low"]),
  f("signagePermission", "Signage permission", "select", ["Yes", "No"]),
  f("suitableFor", "Suitable for", "text"),
];

const WAREHOUSE_FIELDS: TypeFieldDef[] = [
  f("builtUpArea", "Built-up area", "number", undefined, "sq ft"),
  f("plotArea", "Plot area", "number", undefined, "sq ft"),
  f("clearHeight", "Clear height", "number", undefined, "ft"),
  f("dockCount", "Dock count", "number"),
  f("truckAccess", "Truck access", "select", ["20 ft", "40 ft", "Trailer", "Limited"]),
  f("roadWidth", "Road width", "number", undefined, "ft"),
  f("flooringType", "Flooring", "select", ["RCC", "Industrial", "Other"]),
  f("powerLoad", "Power load", "text", undefined, "e.g. 60 KVA"),
  f("fireNoc", "Fire NOC", "select", ["Yes", "No", "In process"]),
];

const FACTORY_FIELDS: TypeFieldDef[] = [
  f("plotArea", "Plot area", "number", undefined, "sq ft"),
  f("shedArea", "Shed / built-up area", "number", undefined, "sq ft"),
  f("clearHeight", "Clear height", "number", undefined, "ft"),
  f("powerSanctionedLoad", "Power sanctioned load", "text"),
  f("crane", "Crane", "select", ["Yes", "No"]),
  f("entryGateWidth", "Entry gate width", "number", undefined, "ft"),
  f("pollutionCategory", "Pollution category", "text"),
  f("fireNoc", "Fire NOC", "select", ["Yes", "No", "In process"]),
];

const AGRI_FIELDS: TypeFieldDef[] = [
  f("landArea", "Land area", "number"),
  f("landUnit", "Unit", "select", ["acre", "bigha", "katha", "sq ft"]),
  f("soilType", "Soil type", "text"),
  f("waterSource", "Water source", "select", ["Borewell", "Canal", "Rain-fed", "Multiple"]),
  f("roadAccess", "Road access", "select", ["Pucca", "Kuchcha", "Highway nearby"]),
  f("fencing", "Fencing", "select", ["Yes", "No", "Partial"]),
  f("conversionPossibility", "Conversion possibility", "text"),
];

const PG_FIELDS: TypeFieldDef[] = [
  f("totalBeds", "Total beds", "number"),
  f("availableBeds", "Available beds", "number"),
  f("sharingType", "Sharing", "select", ["Single", "Double", "Triple", "4+ sharing"]),
  f("foodIncluded", "Food included", "select", ["Yes", "No", "Optional"]),
  f("acType", "AC / Non-AC", "select", ["AC", "Non-AC", "Both"]),
  f("genderPreference", "Gender", "select", ["Boys", "Girls", "Co-ed"]),
  f("lockIn", "Lock-in", "text"),
  f("noticePeriod", "Notice period", "text"),
  f("wifi", "Wi-Fi", "select", ["Included", "Extra", "No"]),
];

const PROJECT_FIELDS: TypeFieldDef[] = [
  f("developer", "Developer name"),
  f("reraId", "RERA ID"),
  f("projectStatus", "Project status", "select", ["New launch", "Under construction", "Ready to move"]),
  f("possessionDate", "Possession date", "text"),
  f("totalTowers", "Total towers", "number"),
  f("totalUnits", "Total units", "number"),
  f("configurations", "Configurations", "textarea", undefined, "e.g. 2/3/4 BHK sizes"),
  f("constructionStatus", "Construction status", "select", ["Pre-launch", "Under construction", "Ready"]),
];

export const TYPE_SPECIFIC_FIELDS: Record<string, TypeFieldDef[]> = {
  Apartment: RES_BUILT,
  "Builder Floor": RES_BUILT,
  "Independent House": VILLA_FIELDS,
  Villa: VILLA_FIELDS,
  Duplex: VILLA_FIELDS,
  Bungalow: VILLA_FIELDS,
  "Residential Floor": RES_BUILT,
  Penthouse: RES_BUILT,
  "Studio Apartment": RES_BUILT,
  "Row House": VILLA_FIELDS,
  "Servant Room / Room": [
    f("roomSize", "Room size", "number", undefined, "sq ft"),
    f("attachedBath", "Attached bath", "select", ["Yes", "No"]),
    f("furnishing", "Furnishing", "select", ["Furnished", "Semi-furnished", "Unfurnished"]),
    f("floor", "Floor", "number"),
  ],
  "Residential Plot": RES_PLOT,
  "Office Space": OFFICE_FIELDS,
  "Co-working Space": OFFICE_FIELDS,
  "Business Center": OFFICE_FIELDS,
  "Clinic Space": [
    ...OFFICE_FIELDS.slice(0, 6),
    f("suitableFor", "Suitable for", "text", undefined, "e.g. dental, diagnostic"),
  ],
  "School / Institute Space": OFFICE_FIELDS,
  "Bank / ATM Space": SHOP_FIELDS,
  Shop: SHOP_FIELDS,
  Showroom: SHOP_FIELDS,
  "Restaurant / Cafe": [
    f("carpetArea", "Carpet area", "number", undefined, "sq ft"),
    f("seatingCapacity", "Seating capacity", "number"),
    f("kitchenSetup", "Kitchen setup", "select", ["Fully equipped", "Partial", "Shell"]),
    f("exhaust", "Exhaust", "select", ["Yes", "No"]),
    f("gasLine", "Gas line", "select", ["Yes", "No"]),
    f("frontage", "Frontage", "number", undefined, "ft"),
    f("powerLoad", "Power load", "text"),
  ],
  "Commercial Land": RES_PLOT,
  "Mixed-use Land": RES_PLOT,
  "Institutional Land": AGRI_FIELDS,
  "Warehouse / Godown": WAREHOUSE_FIELDS,
  "RCC Warehouse": WAREHOUSE_FIELDS,
  Factory: FACTORY_FIELDS,
  "Manufacturing Unit": FACTORY_FIELDS,
  "Industrial Shed": FACTORY_FIELDS,
  "Industrial Plot": RES_PLOT,
  "Open Yard": [
    f("plotArea", "Plot area", "number", undefined, "sq ft"),
    f("roadWidth", "Road width", "number", undefined, "ft"),
    f("fencing", "Fencing", "select", ["Yes", "No", "Partial"]),
    f("powerAvailable", "Power", "select", ["Yes", "No", "Nearby"]),
  ],
  "Cold Storage": WAREHOUSE_FIELDS,
  "Logistics Park": WAREHOUSE_FIELDS,
  "Agricultural Land": AGRI_FIELDS,
  "Farm Land": AGRI_FIELDS,
  "Farm House": [
    f("landArea", "Land area", "number"),
    f("builtUpArea", "Built-up area", "number", undefined, "sq ft"),
    f("rooms", "Rooms", "number"),
    f("bathrooms", "Bathrooms", "number"),
    f("pool", "Pool", "select", ["Yes", "No"]),
    f("borewell", "Borewell", "select", ["Yes", "No"]),
    f("roadAccess", "Road access", "text"),
  ],
  "PG / Co-living": PG_FIELDS,
  Hostel: PG_FIELDS,
  "Serviced Apartment": [
    f("rooms", "Rooms", "number"),
    f("minimumStay", "Minimum stay", "text"),
    f("housekeeping", "Housekeeping", "select", ["Daily", "Weekly", "On request"]),
    f("billsIncluded", "Bills included", "select", ["Yes", "Partial", "No"]),
  ],
  "Guest House": PG_FIELDS,
  "Hotel / Resort": [
    f("keys", "Number of keys", "number"),
    f("occupancy", "Occupancy %", "number"),
    f("fnb", "Restaurant / F&B", "select", ["Yes", "No"]),
    f("licenseStatus", "License status", "text"),
  ],
  "Banquet Hall": [
    f("builtUpArea", "Built-up area", "number", undefined, "sq ft"),
    f("seatingCapacity", "Seating capacity", "number"),
    f("parking", "Parking", "text"),
    f("kitchenSetup", "Kitchen", "select", ["In-house", "Outsourced", "None"]),
  ],
  "Resort Land": RES_PLOT,
  Lodge: PG_FIELDS,
  "Residential Project": PROJECT_FIELDS,
  "Commercial Project": PROJECT_FIELDS,
};

export function getTypeSpecificFields(propertyType: string): TypeFieldDef[] {
  return TYPE_SPECIFIC_FIELDS[propertyType] ?? [];
}

/** Legacy core fields visibility in details step */
export function shouldShowResidentialCore(propertyType: string, category: string): boolean {
  const plotTypes = new Set([
    "Residential Plot",
    "Commercial Land",
    "Industrial Plot",
    "Agricultural Land",
    "Farm Land",
    "Plantation Land",
    "Orchard",
  ]);
  if (plotTypes.has(propertyType)) return false;
  return category === "RESIDENTIAL" || ["Apartment", "Builder Floor", "Villa", "Independent House"].includes(propertyType);
}

export function shouldShowFurnishingField(propertyType: string, category: string): boolean {
  if (category === "COMMERCIAL") return true;
  return shouldShowResidentialCore(propertyType, category);
}
