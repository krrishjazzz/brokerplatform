import type { SavedSearchFilters } from "@/features/properties-search/types";

export const SAVED_SEARCH_STORAGE_KEY = "krrishjazz:saved-searches:v1";

export function buildSearchLabel(filters: SavedSearchFilters) {
  const parts: string[] = [];
  if (filters.bedrooms) parts.push(`${filters.bedrooms} BHK`);
  if (filters.propertyType) parts.push(filters.propertyType);
  else if (filters.category) parts.push(filters.category);
  if (filters.locality) parts.push(`in ${filters.locality}`);
  else if (filters.city) parts.push(`in ${filters.city}`);
  else if (filters.query) parts.push(filters.query);
  if (filters.listingType) parts.push(`(${filters.listingType})`);
  return parts.join(" ").trim();
}
