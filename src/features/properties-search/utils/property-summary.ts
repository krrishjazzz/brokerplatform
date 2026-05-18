import { getFreshness } from "@/components/properties/property-display";
import type { Property } from "@/features/properties-search/types";

export function summarizeProperties(properties: Property[]) {
  return {
    freshCount: properties.filter((p) => getFreshness(p.updatedAt).score === "high").length,
    verifiedCount: properties.filter((p) => p.verified).length,
    readyCount: properties.filter((p) => p.readyToVisit).length,
    ownerListedCount: properties.filter((p) => p.ownerListed).length,
  };
}
