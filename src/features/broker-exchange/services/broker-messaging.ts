import { formatPrice } from "@/lib/utils";
import type { BrokerProperty } from "@/features/broker-exchange/types";

export function openPhone(phone: string) {
  if (!phone || phone.includes("XXXX")) return false;
  window.open(`tel:${phone}`, "_self");
  return true;
}

export function openWhatsApp(phone: string, message: string) {
  if (!phone || phone.includes("XXXX")) return false;
  window.open(`https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(message)}`, "_blank");
  return true;
}

export function buildPropertyWhatsAppMessage(property: BrokerProperty) {
  return [
    "KrrishJazz Broker Network",
    property.title,
    `Location: ${property.city}`,
    `Type: ${property.propertyType}`,
    `Price: ${formatPrice(property.price)}`,
    `Area: ${Math.round(property.area).toLocaleString()} ${property.areaUnit}`,
    `Availability: ${(property.listingStatus || property.status).replaceAll("_", " ")}`,
    `Matches: ${property.matchingRequirementsCount} requirement(s)`,
    "",
    "Please confirm availability, brokerage terms, and site visit possibility.",
  ].join("\n");
}

export function buildPropertyShareText(property: BrokerProperty) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return [
    `${property.title} - ${formatPrice(property.price)}`,
    `${property.propertyType} in ${property.city}`,
    `${Math.round(property.area).toLocaleString()} ${property.areaUnit}`,
    `Availability: ${(property.listingStatus || property.status).replaceAll("_", " ")}`,
    `Matches: ${property.matchingRequirementsCount} requirement(s)`,
    `${origin}/properties/${property.slug}`,
  ].join("\n");
}
