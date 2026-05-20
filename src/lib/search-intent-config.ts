import { applySearchLocationParams } from "@/lib/search-location";

export type SearchIntentId = "buy" | "rent" | "commercial";

export type IntentPropertyTypeOption = {
  id: string;
  label: string;
  apiTypes: string[];
  searchQuery?: string;
  plotCategory?: string;
};

export const SEARCH_INTENT_TABS: {
  id: SearchIntentId;
  label: string;
  params: Record<string, string>;
}[] = [
  { id: "buy", label: "Buy", params: { listingType: "BUY", category: "RESIDENTIAL" } },
  { id: "rent", label: "Rent", params: { listingType: "RENT", category: "RESIDENTIAL" } },
  { id: "commercial", label: "Commercial", params: { category: "COMMERCIAL" } },
];

export const INTENT_PROPERTY_TYPES: Record<SearchIntentId, IntentPropertyTypeOption[]> = {
  buy: [
    { id: "any", label: "Any", apiTypes: [] },
    { id: "apartment", label: "Flat / Apartment", apiTypes: ["Apartment"] },
    { id: "builder-floor", label: "Builder Floor", apiTypes: ["Builder Floor"] },
    { id: "house-villa", label: "House / Villa", apiTypes: ["Independent House", "Villa"] },
    { id: "plot", label: "Residential Plot", apiTypes: ["Residential Plot"] },
    { id: "studio", label: "1 RK / Studio", apiTypes: ["Studio Apartment"] },
    { id: "farm-house", label: "Farm House", apiTypes: ["Farm House"] },
    { id: "projects", label: "Projects", apiTypes: [], searchQuery: "project" },
  ],
  rent: [
    { id: "any", label: "Any", apiTypes: [] },
    { id: "apartment", label: "Flat / Apartment", apiTypes: ["Apartment"] },
    { id: "builder-floor", label: "Builder Floor", apiTypes: ["Builder Floor"] },
    { id: "house-villa", label: "House / Villa", apiTypes: ["Independent House", "Villa"] },
    { id: "pg", label: "PG / Co-living", apiTypes: ["PG / Co-living"] },
    { id: "serviced", label: "Serviced Apartment", apiTypes: ["Serviced Apartment"] },
    { id: "studio", label: "Studio / 1 RK", apiTypes: ["Studio Apartment"] },
    { id: "rooms", label: "Rooms", apiTypes: ["PG / Co-living", "Hostel"] },
  ],
  commercial: [
    { id: "any", label: "Any", apiTypes: [] },
    { id: "office", label: "Office Space", apiTypes: ["Office Space"] },
    { id: "coworking", label: "Co-working", apiTypes: ["Co-working Space"] },
    { id: "shop", label: "Shop", apiTypes: ["Shop"] },
    { id: "showroom", label: "Showroom", apiTypes: ["Showroom"] },
    { id: "warehouse", label: "Warehouse", apiTypes: ["Warehouse / Godown"] },
    { id: "commercial-land", label: "Commercial Land", apiTypes: ["Commercial Land"] },
    { id: "projects", label: "Projects", apiTypes: [], searchQuery: "project" },
  ],
};

export const BUDGET_OPTIONS_BY_INTENT: Record<
  SearchIntentId,
  { label: string; value: string }[]
> = {
  buy: [
    { label: "Any", value: "" },
    { label: "Under 50L", value: "5000000" },
    { label: "Under 1Cr", value: "10000000" },
    { label: "Under 2Cr", value: "20000000" },
    { label: "Under 5Cr", value: "50000000" },
  ],
  rent: [
    { label: "Any", value: "" },
    { label: "Under 25K / month", value: "25000" },
    { label: "Under 50K / month", value: "50000" },
    { label: "Under 1L / month", value: "100000" },
  ],
  commercial: [
    { label: "Any", value: "" },
    { label: "Under 50K / month", value: "50000" },
    { label: "Under 1L / month", value: "100000" },
    { label: "Under 1Cr", value: "10000000" },
    { label: "Under 5Cr", value: "50000000" },
  ],
};

export const BHK_OPTIONS = [
  { label: "Any", value: "" },
  { label: "1 BHK", value: "1" },
  { label: "2 BHK", value: "2" },
  { label: "3 BHK", value: "3" },
  { label: "4 BHK", value: "4" },
  { label: "5+ BHK", value: "5" },
];

export const FURNISHING_OPTIONS = [
  { label: "Any", value: "" },
  { label: "Furnished", value: "Furnished" },
  { label: "Semi-Furnished", value: "Semi-Furnished" },
  { label: "Unfurnished", value: "Unfurnished" },
];

export type HomeSearchFilters = {
  intent: SearchIntentId;
  location: string;
  query: string;
  propertyTypeId: string;
  budget: string;
  bedrooms: string;
  furnishing: string;
};

export function buildSearchParams(
  filters: HomeSearchFilters,
  overrides: Record<string, string> = {}
): URLSearchParams {
  const tab = SEARCH_INTENT_TABS.find((t) => t.id === filters.intent) ?? SEARCH_INTENT_TABS[0];
  const params = new URLSearchParams();

  Object.entries(tab.params).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  applySearchLocationParams(params, filters.location);
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.budget) params.set("maxPrice", filters.budget);
  if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
  if (filters.furnishing) params.set("furnishing", filters.furnishing);

  const typeOption = INTENT_PROPERTY_TYPES[filters.intent].find((o) => o.id === filters.propertyTypeId);
  if (typeOption && typeOption.id !== "any") {
    if (typeOption.apiTypes.length > 0) {
      typeOption.apiTypes.forEach((t) => params.append("propertyType", t));
    }
    if (typeOption.searchQuery && !filters.query.trim()) {
      params.set("q", typeOption.searchQuery);
    }
    if (typeOption.plotCategory) {
      params.set("category", typeOption.plotCategory);
    }
  }

  Object.entries(overrides).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  return params;
}

export function getIntentTabParams(intent: SearchIntentId) {
  return SEARCH_INTENT_TABS.find((t) => t.id === intent)?.params ?? {};
}
