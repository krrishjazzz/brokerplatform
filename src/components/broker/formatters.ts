import { formatPrice } from "@/lib/utils";
import type {
  BadgeVariant,
  BrokerMatchedProperty,
  BrokerMatchedRequirement,
  BrokerProperty,
  BrokerRequirement,
} from "@/components/broker/types";

export function getBrokerSpecs(property: BrokerProperty) {
  const type = property.propertyType.toLowerCase();
  const specs: { label: string; value: string }[] = [
    { label: "Area", value: `${Math.round(property.area).toLocaleString()} ${property.areaUnit}` },
  ];

  if (/(apartment|villa|house|penthouse|studio|row)/.test(type)) {
    if (property.bedrooms) specs.push({ label: "Beds", value: `${property.bedrooms} BHK` });
    if (property.bathrooms) specs.push({ label: "Bath", value: `${property.bathrooms}` });
    if (property.floor != null) {
      specs.push({
        label: "Floor",
        value: property.totalFloors != null ? `${property.floor}/${property.totalFloors}` : `${property.floor}`,
      });
    }
  } else if (/(office|co-working|shop|showroom)/.test(type)) {
    specs.push({ label: "Use", value: property.propertyType });
    specs.push({ label: "Fit-out", value: property.furnishing || "Ask" });
    specs.push({ label: "Parking", value: property.amenities.includes("Parking") ? "Yes" : "Ask" });
  } else if (/(warehouse|industrial|factory)/.test(type)) {
    specs.push({ label: "Access", value: "Truck Ask" });
    specs.push({ label: "Power", value: property.amenities.includes("Power Backup") ? "Backup" : "Check" });
    specs.push({ label: "Use", value: property.propertyType });
  } else if (/(plot|land)/.test(type)) {
    specs.push({ label: "Plot", value: property.propertyType });
    specs.push({ label: "Road", value: "Ask" });
    specs.push({ label: "Facing", value: "Ask" });
  } else {
    if (property.furnishing) specs.push({ label: "Furnishing", value: property.furnishing });
    specs.push({ label: "Type", value: property.propertyType });
  }

  return specs.slice(0, 4);
}

export function getFreshness(updatedAt: string) {
  const days = Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return { label: "Updated today", variant: "success" as const, isFresh: true };
  if (days < 7) return { label: `${days}d fresh`, variant: "success" as const, isFresh: true };
  if (days < 21) return { label: `${days}d old`, variant: "warning" as const, isFresh: false };
  return { label: "Needs check", variant: "error" as const, isFresh: false };
}

export function getAvailability(property: BrokerProperty) {
  const availability = property.listingStatus || property.status;
  const label = availability === "ON_HOLD" ? "On Hold" : availability.replaceAll("_", " ");
  const variant: BadgeVariant =
    availability === "AVAILABLE" || availability === "LIVE"
      ? "success"
      : availability === "ON_HOLD" || availability === "PENDING"
      ? "warning"
      : "default";
  return { label, variant };
}

export function getListingVariant(type: string): BadgeVariant {
  if (type === "BUY") return "blue";
  if (type === "RENT") return "success";
  if (type === "LEASE") return "accent";
  return "default";
}

export function getAgeSignal(createdAt: string) {
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return { label: "Today", variant: "accent" as const, tone: "text-accent", days };
  if (days < 7) return { label: `${days}d fresh`, variant: "success" as const, tone: "text-success", days };
  if (days < 30) return { label: `${days}d active`, variant: "blue" as const, tone: "text-primary", days };
  return { label: "Aging", variant: "warning" as const, tone: "text-warning", days };
}

export function getBudgetText(requirement: BrokerRequirement) {
  if (requirement.budgetMin && requirement.budgetMax) {
    return `${formatPrice(Number(requirement.budgetMin))} - ${formatPrice(Number(requirement.budgetMax))}`;
  }
  if (requirement.budgetMin) return `Above ${formatPrice(Number(requirement.budgetMin))}`;
  if (requirement.budgetMax) return `Up to ${formatPrice(Number(requirement.budgetMax))}`;
  return "Budget open";
}

export function getRequirementBudget(requirement: BrokerMatchedRequirement) {
  if (requirement.budgetMin && requirement.budgetMax) return `${formatPrice(requirement.budgetMin)} - ${formatPrice(requirement.budgetMax)}`;
  if (requirement.budgetMin) return `From ${formatPrice(requirement.budgetMin)}`;
  if (requirement.budgetMax) return `Up to ${formatPrice(requirement.budgetMax)}`;
  return "Budget open";
}

export function getRequirementFit(property: BrokerProperty, requirement: BrokerMatchedRequirement) {
  let score = 0;
  const cityMatch = property.city.toLowerCase().includes(requirement.city.toLowerCase()) || requirement.city.toLowerCase().includes(property.city.toLowerCase());
  const typeMatch = property.propertyType === requirement.propertyType;
  const budgetMatch = (!requirement.budgetMin || property.price >= requirement.budgetMin) && (!requirement.budgetMax || property.price <= requirement.budgetMax);

  if (cityMatch) score += 35;
  if (typeMatch) score += 35;
  if (budgetMatch) score += 30;

  if (score >= 90) return { score, label: "Strong fit", variant: "success" as const, reasons: [] };
  if (score >= 65) return { score, label: "Good fit", variant: "accent" as const, reasons: [] };
  return { score, label: "Review fit", variant: "warning" as const, reasons: [] };
}

export function getMatchedPropertyBrokerName(property: BrokerMatchedProperty) {
  return property.sourceName || property.sourceLabel || property.assignedBroker?.name || property.postedBy?.name || property.publicBrokerName || "Broker Network Property";
}

export function getMatchedPropertyBrokerId(property: BrokerMatchedProperty) {
  return property.assignedBrokerId || property.postedById || property.postedBy?.id || null;
}

export function getMatchedPropertyBrokerPhone(property: BrokerMatchedProperty) {
  return property.sourcePhone || property.assignedBroker?.phone || property.postedBy?.phone || "";
}

export function getMatchedPropertyFreshness(updatedAt: string) {
  const days = Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return "Today";
  if (days < 7) return `${days}d fresh`;
  if (days < 21) return `${days}d old`;
  return "Needs check";
}

export function getPropertyFit(requirement: BrokerRequirement, property: BrokerMatchedProperty) {
  let score = 0;
  const cityMatch = property.city.toLowerCase().includes(requirement.city.toLowerCase()) || requirement.city.toLowerCase().includes(property.city.toLowerCase());
  const typeMatch = property.propertyType === requirement.propertyType;
  const budgetMatch = (!requirement.budgetMin || property.price >= requirement.budgetMin) && (!requirement.budgetMax || property.price <= requirement.budgetMax);

  if (cityMatch) score += 35;
  if (typeMatch) score += 35;
  if (budgetMatch) score += 30;

  if (score >= 90) return { score, label: "Strong fit", variant: "success" as const, reasons: [] };
  if (score >= 65) return { score, label: "Good fit", variant: "accent" as const, reasons: [] };
  return { score, label: "Review fit", variant: "warning" as const, reasons: [] };
}
