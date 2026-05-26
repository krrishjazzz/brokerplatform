import { Building2, Home, Key } from "lucide-react";
import { PROPERTY_CATEGORY_OPTIONS } from "@/lib/constants";
import { getPresetMenuLabel, resolvePresetFromUrl } from "@/lib/search-intent-config";

/** Primary intent tabs for legacy references. */
export const INTENT_LISTING_TABS = [
  { label: "Buy", value: "BUY", icon: Home },
  { label: "Rent", value: "RENT", icon: Key },
  { label: "Commercial", value: "COMMERCIAL", icon: Building2 },
] as const;

export const QUICK_FILTERS = [
  { label: "2 BHK", action: "2bhk" },
  { label: "Apartment", action: "apartment" },
  { label: "Office", action: "office" },
  { label: "Warehouse", action: "warehouse" },
];

export const CATEGORY_OPTIONS = PROPERTY_CATEGORY_OPTIONS.map((category) => ({
  label: category.label,
  value: category.value,
}));

export const POPULAR_LOCALITY_CHIPS = [
  "New Town",
  "Salt Lake",
  "Rajarhat",
  "Park Street",
  "Ballygunge",
  "EM Bypass",
] as const;

export function getBrowseIntentLabel(
  listingType: string,
  category: string,
  preset?: string | null
) {
  const presetId = resolvePresetFromUrl(preset ?? null, null, listingType, category);
  return getPresetMenuLabel(presetId);
}

export function isCommercialIntent(category: string, listingType: string) {
  return category === "COMMERCIAL" || listingType === "COMMERCIAL";
}
