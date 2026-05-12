import { BadgeCheck, BellRing, Eye, Home, ShieldCheck } from "lucide-react";
import { PROPERTY_CATEGORY_OPTIONS } from "@/lib/constants";

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
  { label: "Fresh", action: "fresh", icon: BellRing },
  { label: "Ready to Visit", action: "ready", icon: Eye },
  { label: "Owner Listed", action: "owner", icon: Home },
  { label: "Budget Match", action: "budget", icon: BadgeCheck },
];

export const QUICK_FILTERS = [
  { label: "Office", action: "office" },
  { label: "2 BHK", action: "2bhk" },
  { label: "Warehouse", action: "warehouse" },
];
