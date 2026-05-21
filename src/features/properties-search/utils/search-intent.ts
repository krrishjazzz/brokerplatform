import {
  getSearchPreset,
  resolvePresetFromUrl,
  type SearchPresetId,
} from "@/lib/search-intent-config";

export function getInitialPage(value: string | null) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function resolveIntentPreset(
  presetOrIntent: string | null,
  listingType?: string | null,
  category?: string | null
) {
  const presetId = resolvePresetFromUrl(presetOrIntent, presetOrIntent, listingType, category);
  const config = getSearchPreset(presetId);
  return {
    preset: presetId as SearchPresetId,
    listingType: config.params.listingType || "",
    category: config.params.category || "",
    propertyType: "",
  };
}

export function countSearchIntent(filters: {
  preset?: string;
  listingType: string;
  category: string;
  propertyType: string;
  propertyTypes?: string[];
  propertyTypeOptionIds?: string[];
  locality: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  furnishing: string;
  freshOnly: boolean;
  readyToVisitOnly: boolean;
  constructionStatus: string;
  possession: string;
  availableFrom: string;
  query: string;
}) {
  const typeCount =
    (filters.propertyTypes?.length || 0) +
    (filters.propertyTypeOptionIds?.length || 0) +
    (filters.propertyType ? 1 : 0);

  const specificIntentCount = [
    typeCount > 0 ? "types" : "",
    filters.locality,
    filters.city,
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
    filters.furnishing,
    filters.freshOnly,
    filters.readyToVisitOnly,
    filters.constructionStatus,
    filters.possession,
    filters.availableFrom,
    filters.query,
  ].filter(Boolean).length;

  const broadIntentCount = [filters.listingType, filters.category].filter(Boolean).length;
  const hasSearchIntent =
    Boolean(filters.preset) || specificIntentCount > 0 || broadIntentCount >= 2;
  const needsMoreFilters = broadIntentCount > 0 && !hasSearchIntent;

  return { specificIntentCount, broadIntentCount, hasSearchIntent, needsMoreFilters };
}
