export function getInitialPage(value: string | null) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function resolveIntentPreset(intent: string | null) {
  if (intent === "buy") return { listingType: "BUY", category: "" };
  if (intent === "rent") return { listingType: "RENT", category: "" };
  if (intent === "commercial") return { listingType: "", category: "COMMERCIAL" };
  if (intent === "land") return { listingType: "", category: "", propertyType: "Residential Plot" };
  return { listingType: "", category: "" };
}

export function countSearchIntent(filters: {
  listingType: string;
  category: string;
  propertyType: string;
  locality: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  furnishing: string;
  freshOnly: boolean;
  verifiedOnly: boolean;
  readyToVisitOnly: boolean;
  ownerListedOnly: boolean;
  budgetMatchOnly: boolean;
  availability: string;
  query: string;
}) {
  const specificIntentCount = [
    filters.propertyType,
    filters.locality,
    filters.city,
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
    filters.furnishing,
    filters.freshOnly,
    filters.verifiedOnly,
    filters.readyToVisitOnly,
    filters.ownerListedOnly,
    filters.budgetMatchOnly,
    filters.availability,
    filters.query,
  ].filter(Boolean).length;

  const broadIntentCount = [filters.listingType, filters.category].filter(Boolean).length;
  const hasSearchIntent = specificIntentCount > 0 || broadIntentCount >= 2;
  const needsMoreFilters = broadIntentCount > 0 && !hasSearchIntent;

  return { specificIntentCount, broadIntentCount, hasSearchIntent, needsMoreFilters };
}

export function isBudgetMatched(
  price: number,
  minPrice: string,
  maxPrice: string
) {
  const min = minPrice ? Number(minPrice) : null;
  const max = maxPrice ? Number(maxPrice) : null;
  if (min != null && price < min) return false;
  if (max != null && price > max) return false;
  return min != null || max != null;
}
