import type { ReactNode } from "react";
import { Bath, BedDouble, Maximize } from "lucide-react";
import type { Property } from "./types";

export type BadgeVariant = "default" | "success" | "warning" | "error" | "blue" | "accent";

export function getFreshness(updatedAt?: string) {
  const days = updatedAt ? Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)) : 99;
  if (days < 1) return { label: "Updated today", variant: "success" as const, score: "high" as const };
  if (days < 7) return { label: `${days}d fresh`, variant: "success" as const, score: "high" as const };
  if (days < 21) return { label: `${days}d old`, variant: "warning" as const, score: "medium" as const };
  return { label: "Needs check", variant: "error" as const, score: "low" as const };
}

export function getSmartSpecs(property: Property) {
  const type = property.propertyType.toLowerCase();
  const specs: { label: string; value: string; icon?: ReactNode }[] = [];

  if (/(apartment|villa|house|penthouse|studio|row|floor)/.test(type)) {
    if (property.bedrooms) specs.push({ label: "Beds", value: `${property.bedrooms} BHK`, icon: <BedDouble size={13} /> });
    if (property.bathrooms) specs.push({ label: "Bath", value: `${property.bathrooms}`, icon: <Bath size={13} /> });
    if (property.floor != null) specs.push({ label: "Floor", value: property.totalFloors != null ? `${property.floor}/${property.totalFloors}` : `${property.floor}` });
    if (property.furnishing) specs.push({ label: "Furnishing", value: property.furnishing });
  } else if (/(office|co-working|shop|showroom|mall|restaurant|cafe|sco)/.test(type)) {
    specs.push({ label: "Use", value: property.propertyType });
    if (property.furnishing) specs.push({ label: "Fit-out", value: property.furnishing });
    specs.push({ label: "Power", value: property.amenities.includes("Power Backup") ? "Backup" : "Check" });
    specs.push({ label: "Parking", value: property.amenities.includes("Parking") ? "Yes" : "Ask" });
  } else if (/(warehouse|godown|industrial|factory|shed|storage|logistics)/.test(type)) {
    specs.push({ label: "Use", value: property.propertyType });
    specs.push({ label: "Truck", value: property.amenities.includes("Visitor Parking") ? "Access" : "Ask" });
    specs.push({ label: "Power", value: property.amenities.includes("Power Backup") ? "Backup" : "Check" });
  } else if (/(plot|land|orchard|plantation)/.test(type)) {
    specs.push({ label: "Type", value: property.propertyType });
    specs.push({ label: "Road", value: "Ask" });
    specs.push({ label: "Facing", value: "Ask" });
  } else if (/(pg|co-living|hostel|serviced|guest|hotel|resort)/.test(type)) {
    specs.push({ label: "Use", value: property.propertyType });
    if (property.bedrooms) specs.push({ label: "Rooms", value: `${property.bedrooms}` });
    if (property.furnishing) specs.push({ label: "Setup", value: property.furnishing });
    specs.push({ label: "Food", value: property.amenities.includes("Food Service") ? "Yes" : "Ask" });
  } else {
    if (property.bedrooms) specs.push({ label: "Beds", value: `${property.bedrooms} BHK`, icon: <BedDouble size={13} /> });
    if (property.furnishing) specs.push({ label: "Furnishing", value: property.furnishing });
  }

  specs.unshift({ label: "Area", value: `${Math.round(property.area).toLocaleString()} ${property.areaUnit}`, icon: <Maximize size={13} /> });
  return specs.slice(0, 4);
}

export function badgeVariant(type: string): BadgeVariant {
  switch (type) {
    case "BUY":
      return "blue";
    case "RENT":
      return "success";
    case "RESALE":
      return "warning";
    case "LEASE":
      return "accent";
    default:
      return "default";
  }
}

export function listingLabel(type: string) {
  if (type === "BUY") return "For sale";
  if (type === "RENT") return "For rent";
  if (type === "LEASE") return "Lease";
  return type;
}
