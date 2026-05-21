import {
  getTypeSpecificFields,
  type ListingIntent,
  type PostingCategory,
} from "@/lib/posting-config";
import type { PropertyInput } from "@/lib/validations";

export const MIN_IMAGES_SUBMIT = 1;
export const MIN_IMAGES_RECOMMENDED = 3;

type CriticalRule = {
  keys: string[];
  message: string;
  /** At least one of keys must be filled */
  anyOf?: boolean;
};

const CRITICAL_BY_TYPE: Record<string, CriticalRule[]> = {
  "PG / Co-living": [
    { keys: ["totalBeds"], message: "Add total beds" },
    { keys: ["sharingType"], message: "Add sharing type" },
    { keys: ["genderPreference"], message: "Add gender preference" },
  ],
  Hostel: [
    { keys: ["totalBeds"], message: "Add total beds" },
    { keys: ["sharingType"], message: "Add sharing type" },
  ],
  "Warehouse / Godown": [
    { keys: ["clearHeight"], message: "Add clear height" },
    { keys: ["truckAccess"], message: "Add truck access" },
    { keys: ["roadWidth"], message: "Add road width" },
  ],
  Factory: [
    { keys: ["clearHeight", "shedArea"], message: "Add clear height or shed area", anyOf: true },
    { keys: ["roadWidth"], message: "Add road width" },
  ],
  "Industrial Shed": [
    { keys: ["clearHeight"], message: "Add clear height" },
    { keys: ["roadWidth"], message: "Add road width" },
  ],
  "Residential Project": [
    { keys: ["developer"], message: "Add developer name" },
    { keys: ["reraId"], message: "Add RERA ID" },
    { keys: ["possessionDate"], message: "Add possession timeline" },
  ],
  "Commercial Project": [
    { keys: ["developer"], message: "Add developer name" },
    { keys: ["reraId"], message: "Add RERA ID" },
    { keys: ["possessionDate"], message: "Add possession timeline" },
  ],
  "Residential Plot": [
    { keys: ["roadWidth"], message: "Add road width" },
    { keys: ["plotArea", "length"], message: "Add plot area or dimensions", anyOf: true },
  ],
  "Commercial Land": [
    { keys: ["roadWidth"], message: "Add road width" },
    { keys: ["plotArea"], message: "Add plot area" },
  ],
  "Industrial Plot": [
    { keys: ["roadWidth"], message: "Add road width" },
    { keys: ["plotArea"], message: "Add plot area" },
  ],
  "Agricultural Land": [
    { keys: ["landArea"], message: "Add land area" },
    { keys: ["roadAccess"], message: "Add road access" },
  ],
  "Farm Land": [
    { keys: ["landArea"], message: "Add land area" },
    { keys: ["roadAccess"], message: "Add road access" },
  ],
};

const CRITICAL_BY_INTENT: Partial<Record<ListingIntent, CriticalRule[]>> = {
  PROJECT: [
    { keys: ["developer"], message: "Add developer name" },
    { keys: ["reraId"], message: "Add RERA ID" },
    { keys: ["possessionDate", "projectStatus"], message: "Add possession or project status", anyOf: true },
  ],
};

export const PHOTO_CHECKLIST_BY_TYPE: Record<string, string[]> = {
  Apartment: ["Living room", "Bedroom", "Kitchen", "Building exterior"],
  Villa: ["Front elevation", "Living area", "Bedroom", "Road approach"],
  "Residential Plot": ["Road frontage", "Plot boundary", "Nearby landmark", "Approach path"],
  Shop: ["Shop frontage", "Road view", "Inside space", "Signage area"],
  Showroom: ["Frontage", "Display area", "Road", "Parking"],
  "Warehouse / Godown": ["Entry gate", "Internal height", "Loading dock", "Approach road"],
  Factory: ["Shed exterior", "Internal floor", "Power room", "Road access"],
  "PG / Co-living": ["Room", "Common area", "Kitchen", "Building front"],
  "Office Space": ["Reception", "Work floor", "Lift lobby", "Building"],
};

export const DEFAULT_PHOTO_CHECKLIST = [
  "Front / main view",
  "Interior or layout",
  "Surroundings / road",
  "Extra detail (kitchen, bath, etc.)",
];

export function getPhotoChecklistForType(propertyType: string): string[] {
  return PHOTO_CHECKLIST_BY_TYPE[propertyType] ?? DEFAULT_PHOTO_CHECKLIST;
}

function isFilled(details: Record<string, string>, key: string): boolean {
  const v = details[key]?.trim();
  return Boolean(v && v.length > 0);
}

function rulePasses(rule: CriticalRule, details: Record<string, string>): boolean {
  if (rule.anyOf) {
    return rule.keys.some((k) => isFilled(details, k));
  }
  return rule.keys.every((k) => isFilled(details, k));
}

export function validateTypeSpecificCriticalFields(
  propertyType: string,
  listingIntent: ListingIntent,
  typeDetails: Record<string, string>
): string[] {
  const errors: string[] = [];
  const rules = [
    ...(CRITICAL_BY_TYPE[propertyType] ?? []),
    ...(CRITICAL_BY_INTENT[listingIntent] ?? []),
  ];

  for (const rule of rules) {
    if (!rulePasses(rule, typeDetails)) {
      errors.push(rule.message);
    }
  }

  return errors;
}

export function validatePostingPayload(
  data: PropertyInput,
  typeDetails: Record<string, string>,
  imageCount: number
): { ok: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const critical = validateTypeSpecificCriticalFields(
    data.propertyType,
    data.listingIntent,
    typeDetails
  );
  if (critical.length > 0) {
    errors.typeSpecificDetails = critical.join(". ");
  }

  if (imageCount < MIN_IMAGES_SUBMIT) {
    errors.images = `Add at least ${MIN_IMAGES_SUBMIT} photo`;
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

/** Resolve Rent/Lease chip to stored intent using category. */
export function resolveRentLeaseIntent(category: PostingCategory): ListingIntent {
  if (category === "COMMERCIAL" || category === "INDUSTRIAL") return "LEASE";
  return "RENT";
}

export type PrimaryPostingChoice = "SELL" | "RENT_LEASE" | "PG";

export function primaryChoiceToIntent(
  choice: PrimaryPostingChoice,
  category?: PostingCategory
): ListingIntent {
  if (choice === "SELL") return "SELL";
  if (choice === "PG") return "PG";
  if (category) return resolveRentLeaseIntent(category);
  return "RENT";
}

export function intentToPrimaryChoice(intent?: ListingIntent | string): PrimaryPostingChoice | null {
  if (intent === "SELL") return "SELL";
  if (intent === "PG") return "PG";
  if (intent === "RENT" || intent === "LEASE") return "RENT_LEASE";
  return null;
}

const REVIEW_PRIORITY_BY_TYPE: Record<string, string[]> = {
  "Warehouse / Godown": ["clearHeight", "truckAccess", "roadWidth", "powerLoad"],
  "RCC Warehouse": ["clearHeight", "truckAccess", "roadWidth", "powerLoad"],
  Factory: ["clearHeight", "shedArea", "powerSanctionedLoad", "roadWidth"],
  "Manufacturing Unit": ["clearHeight", "shedArea", "powerSanctionedLoad"],
  "PG / Co-living": ["totalBeds", "sharingType", "genderPreference", "foodIncluded"],
  Hostel: ["totalBeds", "sharingType", "genderPreference"],
  "Residential Project": ["developer", "reraId", "possessionDate", "configurations"],
  "Residential Plot": ["plotArea", "roadWidth", "facing", "boundaryWall"],
  Shop: ["carpetArea", "frontage", "roadWidth", "suitableFor"],
};

export function getTypeDetailsReviewLines(
  propertyType: string,
  details: Record<string, string>
): { label: string; value: string }[] {
  const fields = getTypeSpecificFields(propertyType);
  const priority = REVIEW_PRIORITY_BY_TYPE[propertyType];
  const keys = priority ?? fields.slice(0, 8).map((f) => f.key);

  return keys
    .map((key) => {
      const value = details[key]?.trim();
      if (!value) return null;
      const def = fields.find((f) => f.key === key);
      const unit =
        def?.placeholder && def.type === "number" ? ` ${def.placeholder}` : "";
      return { label: def?.label ?? key, value: `${value}${unit}` };
    })
    .filter((row): row is { label: string; value: string } => row !== null);
}
