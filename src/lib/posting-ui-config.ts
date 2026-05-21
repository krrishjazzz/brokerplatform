import type { PostingCategory } from "@/lib/posting-config";
import { getTypeSpecificFields } from "@/lib/posting-config";

/** Compact category chips on step 1 (not large cards). */
export const OWNER_CATEGORY_CHIPS: { value: PostingCategory; label: string }[] = [
  { value: "RESIDENTIAL", label: "Residential" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "INDUSTRIAL", label: "Industrial" },
  { value: "AGRICULTURAL", label: "Land / Agriculture" },
];

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  Apartment: "Flat / Apartment",
  "Studio Apartment": "Studio",
  "Builder Floor": "Builder Floor",
  "Independent House": "Independent House / Villa",
  Villa: "Villa",
  Duplex: "Duplex",
  Bungalow: "Bungalow",
  "Residential Plot": "Plot / Land",
  "Office Space": "Office",
  Shop: "Retail / Shop",
  Showroom: "Showroom",
  "Co-working Space": "Co-working",
  "Warehouse / Godown": "Warehouse",
  "PG / Co-living": "PG / Co-living",
  Hostel: "Hostel",
  Factory: "Factory",
  "Commercial Land": "Commercial Land",
  "Agricultural Land": "Farm / Agri Land",
};

/** Preferred chip order per category (values are internal propertyType). */
const POPULAR_BY_CATEGORY: Partial<Record<PostingCategory, string[]>> = {
  RESIDENTIAL: [
    "Apartment",
    "Independent House",
    "Villa",
    "Builder Floor",
    "Residential Plot",
    "Studio Apartment",
    "Duplex",
  ],
  COMMERCIAL: ["Office Space", "Shop", "Showroom", "Co-working Space", "Commercial Land", "Restaurant / Cafe"],
  INDUSTRIAL: ["Warehouse / Godown", "Industrial Shed", "Factory", "Industrial Plot", "Open Yard"],
  AGRICULTURAL: ["Agricultural Land", "Farm Land", "Farm House"],
  HOSPITALITY: ["PG / Co-living", "Hostel", "Serviced Apartment"],
};

const POPULAR_COUNT = 7;

export type PropertyTypeChip = { label: string; value: string };

export function getPropertyTypeChips(
  propertyTypes: string[],
  category?: PostingCategory
): { popular: PropertyTypeChip[]; more: PropertyTypeChip[] } {
  const toChip = (value: string): PropertyTypeChip => ({
    value,
    label: PROPERTY_TYPE_LABELS[value] ?? value,
  });

  const preferred = category ? POPULAR_BY_CATEGORY[category] ?? [] : [];
  const sorted = [...propertyTypes].sort((a, b) => {
    const ai = preferred.indexOf(a);
    const bi = preferred.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const chips = sorted.map(toChip);
  return {
    popular: chips.slice(0, POPULAR_COUNT),
    more: chips.slice(POPULAR_COUNT),
  };
}

/** Must-fill dynamic field keys per property type; rest go under Advanced. */
export const TYPE_FIELD_PRIORITY: Record<string, { primary: string[]; advanced: string[] }> = {
  Apartment: {
    primary: ["bhk", "bathrooms", "carpetArea", "builtUpArea", "floor"],
    advanced: [
      "balconies",
      "superBuiltUpArea",
      "totalFloors",
      "facing",
      "parking",
      "ownershipType",
      "maintenance",
      "possession",
      "societyOrProject",
    ],
  },
  "Builder Floor": {
    primary: ["bhk", "bathrooms", "carpetArea", "builtUpArea", "floor"],
    advanced: ["balconies", "totalFloors", "facing", "parking", "ownershipType", "maintenance", "possession"],
  },
  "Studio Apartment": {
    primary: ["bhk", "bathrooms", "carpetArea", "floor"],
    advanced: ["facing", "parking", "furnishing", "maintenance", "possession"],
  },
  Villa: {
    primary: ["bhk", "bathrooms", "builtUpArea", "plotArea", "floor"],
    advanced: ["gardenLawn", "terrace", "roadWidth", "facing", "parking", "renovationStatus"],
  },
  "Independent House": {
    primary: ["bhk", "bathrooms", "builtUpArea", "plotArea", "floor"],
    advanced: ["gardenLawn", "terrace", "roadWidth", "facing", "parking"],
  },
  "Warehouse / Godown": {
    primary: ["builtUpArea", "clearHeight", "truckAccess", "roadWidth", "powerLoad"],
    advanced: ["plotArea", "dockCount", "flooringType", "fireNoc"],
  },
  "RCC Warehouse": {
    primary: ["builtUpArea", "clearHeight", "truckAccess", "roadWidth", "powerLoad"],
    advanced: ["plotArea", "dockCount", "flooringType", "fireNoc"],
  },
  Factory: {
    primary: ["shedArea", "clearHeight", "roadWidth", "powerSanctionedLoad"],
    advanced: ["plotArea", "crane", "entryGateWidth", "pollutionCategory", "fireNoc"],
  },
  "PG / Co-living": {
    primary: ["totalBeds", "availableBeds", "sharingType", "genderPreference", "foodIncluded"],
    advanced: ["acType", "lockIn", "noticePeriod", "wifi"],
  },
  Hostel: {
    primary: ["totalBeds", "sharingType", "genderPreference", "foodIncluded"],
    advanced: ["acType", "lockIn", "noticePeriod", "wifi"],
  },
  "Office Space": {
    primary: ["carpetArea", "builtUpArea", "seats", "floor", "fitOut"],
    advanced: ["cabins", "pantry", "powerBackup", "parking", "lift", "camMaintenance"],
  },
  Shop: {
    primary: ["carpetArea", "frontage", "roadWidth", "floor"],
    advanced: ["ceilingHeight", "mainRoadVisibility", "footfall", "signagePermission", "suitableFor"],
  },
  "Residential Plot": {
    primary: ["plotArea", "roadWidth", "facing", "length", "breadth"],
    advanced: ["boundaryWall", "cornerPlot", "gatedSociety", "conversionStatus", "waterElectricity"],
  },
};

export function splitTypeFields(propertyType: string) {
  const all = getTypeSpecificFields(propertyType);
  const priority = TYPE_FIELD_PRIORITY[propertyType];
  if (!priority) {
    const primary = all.slice(0, 5);
    const advanced = all.slice(5);
    return { primary, advanced };
  }
  const primarySet = new Set(priority.primary);
  const advancedSet = new Set(priority.advanced);
  const primary = priority.primary
    .map((key) => all.find((f) => f.key === key))
    .filter(Boolean) as typeof all;
  const advanced = [
    ...priority.advanced.map((key) => all.find((f) => f.key === key)).filter(Boolean),
    ...all.filter((f) => !primarySet.has(f.key) && !advancedSet.has(f.key)),
  ] as typeof all;
  return { primary, advanced };
}
