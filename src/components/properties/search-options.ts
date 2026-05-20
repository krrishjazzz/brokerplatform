import { BadgeCheck, BellRing, Building2, Eye, Home, Key, ShieldCheck } from "lucide-react";
import { PROPERTY_CATEGORY_OPTIONS } from "@/lib/constants";

/** Primary intent tabs for properties page (matches platform nav). */
export const INTENT_LISTING_TABS = [
  { label: "Buy", value: "BUY", icon: Home },
  { label: "Rent", value: "RENT", icon: Key },
  { label: "Commercial", value: "COMMERCIAL", icon: Building2 },
] as const;

export const LISTING_TABS = [
  { label: "Buy", value: "BUY" },
  { label: "Rent", value: "RENT" },
  { label: "Resale", value: "RESALE" },
  { label: "Lease", value: "LEASE" },
  { label: "Commercial", value: "COMMERCIAL" },
];

export const CATEGORY_OPTIONS = PROPERTY_CATEGORY_OPTIONS.map((category) => ({
  label: category.label,
  value: category.value,
}));

export const TRUST_FILTERS = [
  { label: "Verified", action: "verified", icon: ShieldCheck },
  { label: "Ready to Visit", action: "ready", icon: Eye },
  { label: "Owner Listed", action: "owner", icon: Home },
  { label: "Budget Match", action: "budget", icon: BadgeCheck },
  { label: "Fresh", action: "fresh", icon: BellRing },
];

export const QUICK_FILTERS = [
  { label: "2 BHK", action: "2bhk" },
  { label: "Apartment", action: "apartment" },
  { label: "Office", action: "office" },
  { label: "Warehouse", action: "warehouse" },
];

export function getBrowseIntentLabel(listingType: string, category: string) {
  if (category === "COMMERCIAL") return "Commercial";
  if (listingType === "RENT") return "Rent";
  return "Buy";
}

export function isCommercialIntent(category: string, listingType: string) {
  return category === "COMMERCIAL" || listingType === "COMMERCIAL";
}
