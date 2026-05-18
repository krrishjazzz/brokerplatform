import { PLATFORM_PHONE } from "@/lib/platform";
import { parseJsonArray } from "@/server/json";

export function toListingStatus(status: string) {
  if (status === "PENDING_REVIEW") return "PENDING";
  if (status === "LIVE") return "LIVE";
  if (status === "REJECTED") return "REJECTED";
  return status;
}

export function formatProperty(property: Record<string, unknown>, options: { publicView: boolean }) {
  const status = String(property.status ?? "");
  const listingStatus = ["LIVE", "REJECTED"].includes(status)
    ? toListingStatus(status)
    : String(property.listingStatus || toListingStatus(status));

  const postedBy = property.postedBy as { role?: string } | undefined;

  const formatted = {
    ...property,
    listingStatus,
    publicBrokerName: property.publicBrokerName || "KrrishJazz",
    verified: status === "LIVE" || listingStatus === "LIVE",
    ownerListed: postedBy?.role === "OWNER",
    readyToVisit: status === "LIVE" && ["LIVE", "AVAILABLE"].includes(listingStatus),
    amenities: parseJsonArray(property.amenities as string | null | undefined),
    images: parseJsonArray(property.images as string | null | undefined),
    latestFreshness:
      (property.freshnessHistory as unknown[] | undefined)?.[0] || property.latestFreshness || null,
  };

  if (!options.publicView) return formatted;

  const safeProperty = { ...formatted } as Record<string, unknown>;
  delete safeProperty.postedById;
  delete safeProperty.assignedBrokerId;
  delete safeProperty.assignedBroker;

  return {
    ...safeProperty,
    platformPhone: PLATFORM_PHONE,
    publicBrokerName: "KrrishJazz",
    postedBy: { name: "KrrishJazz", phone: "", role: "VERIFIED", brokerProfile: null },
  };
}
