import { applyStructuredLocationToParams, resolveLocationSearch } from "@/lib/location/search";

/** Intent presets — segregated residential / commercial / rent / lease / PG / projects */
export type SearchPresetId =
  | "residential_buy"
  | "residential_rent"
  | "pg"
  | "residential_projects"
  | "commercial_buy"
  | "commercial_lease"
  | "commercial_projects";

/** @deprecated Use SearchPresetId — kept for URL backward compatibility */
export type SearchIntentId = "buy" | "rent" | "commercial";

export type IntentPropertyTypeOption = {
  id: string;
  label: string;
  apiTypes: string[];
  searchQuery?: string;
  plotCategory?: string;
};

export type FilterPillId =
  | "propertyTypes"
  | "budget"
  | "rentBudget"
  | "monthlyRent"
  | "bedrooms"
  | "furnishing"
  | "constructionStatus"
  | "postedBy"
  | "area"
  | "possession"
  | "availableFrom"
  | "lockIn"
  | "developer"
  | "propertyTypeCategory";

export type SearchPresetConfig = {
  id: SearchPresetId;
  menuLabel: string;
  shortLabel: string;
  group: "residential" | "commercial";
  params: Record<string, string>;
  propertyTypes: IntentPropertyTypeOption[];
  filterPills: FilterPillId[];
  crossLinkPreset?: SearchPresetId;
  crossLinkLabel?: string;
  defaultSearchQuery?: string;
};

export const DEFAULT_SEARCH_PRESET: SearchPresetId = "residential_buy";
export const DEFAULT_SEARCH_CITY = "Kolkata";

/** Top-level intents on /properties (synced with search panel + sidebar). */
export const KRRISHJAZZ_TOP_INTENTS: { id: SearchPresetId; label: string }[] = [
  { id: "residential_buy", label: "Buy" },
  { id: "residential_rent", label: "Rent" },
  { id: "pg", label: "PG" },
  { id: "commercial_buy", label: "Commercial" },
  { id: "commercial_lease", label: "Comm. Lease" },
  { id: "residential_projects", label: "Projects" },
];

export const SEARCH_PRESET_GROUPS: {
  label: string;
  group: "residential" | "commercial";
  items: { id: SearchPresetId; label: string }[];
}[] = [
  {
    label: "Residential",
    group: "residential",
    items: [
      { id: "residential_buy", label: "Buy" },
      { id: "residential_rent", label: "Rent" },
      { id: "pg", label: "PG" },
      { id: "residential_projects", label: "Projects" },
    ],
  },
  {
    label: "Commercial",
    group: "commercial",
    items: [
      { id: "commercial_buy", label: "Buy" },
      { id: "commercial_lease", label: "Rent / Lease" },
      { id: "commercial_projects", label: "Projects" },
    ],
  },
];

const RESIDENTIAL_BUY_TYPES: IntentPropertyTypeOption[] = [
  { id: "apartment", label: "Flat / Apartment", apiTypes: ["Apartment"] },
  { id: "builder-floor", label: "Builder Floor", apiTypes: ["Builder Floor"] },
  { id: "house-villa", label: "Independent House / Villa", apiTypes: ["Independent House", "Villa"] },
  { id: "residential-land", label: "Residential Land", apiTypes: ["Residential Plot"] },
  { id: "studio", label: "1 RK / Studio Apartment", apiTypes: ["Studio Apartment"] },
  { id: "farm-house", label: "Farm House", apiTypes: ["Farm House"] },
  { id: "serviced", label: "Serviced Apartment", apiTypes: ["Serviced Apartment"] },
  { id: "other", label: "Other", apiTypes: ["Penthouse", "Row House"] },
];

const RESIDENTIAL_RENT_TYPES: IntentPropertyTypeOption[] = [
  { id: "apartment", label: "Flat / Apartment", apiTypes: ["Apartment"] },
  { id: "builder-floor", label: "Builder Floor", apiTypes: ["Builder Floor"] },
  { id: "house-villa", label: "Independent House / Villa", apiTypes: ["Independent House", "Villa"] },
  { id: "studio", label: "1 RK / Studio Apartment", apiTypes: ["Studio Apartment"] },
  { id: "pg-coliving", label: "PG / Co-living", apiTypes: ["PG / Co-living", "Hostel"] },
  { id: "serviced", label: "Serviced Apartment", apiTypes: ["Serviced Apartment"] },
];

const PG_TYPES: IntentPropertyTypeOption[] = [
  { id: "pg", label: "PG", apiTypes: ["PG / Co-living"] },
  { id: "coliving", label: "Co-living", apiTypes: ["PG / Co-living"] },
  { id: "hostel", label: "Hostel", apiTypes: ["Hostel"] },
];

const COMMERCIAL_BUY_TYPES: IntentPropertyTypeOption[] = [
  { id: "office", label: "Office Space", apiTypes: ["Office Space"] },
  { id: "shop-showroom", label: "Shop / Showroom", apiTypes: ["Shop", "Showroom"] },
  { id: "commercial-land", label: "Commercial Land", apiTypes: ["Commercial Land"] },
  { id: "warehouse", label: "Warehouse", apiTypes: ["Warehouse / Godown"] },
  { id: "industrial-building", label: "Industrial Building", apiTypes: ["Industrial Building"] },
  { id: "factory", label: "Factory", apiTypes: ["Factory"] },
  { id: "hotel-resort", label: "Hotel / Resort", apiTypes: ["Hotel / Resort"] },
  { id: "coworking", label: "Co-working Space", apiTypes: ["Co-working Space"] },
];

const COMMERCIAL_LEASE_TYPES: IntentPropertyTypeOption[] = [
  { id: "office", label: "Office Space", apiTypes: ["Office Space"] },
  { id: "shop-showroom", label: "Shop / Showroom", apiTypes: ["Shop", "Showroom"] },
  { id: "warehouse", label: "Warehouse", apiTypes: ["Warehouse / Godown"] },
  { id: "industrial-shed", label: "Industrial Shed", apiTypes: ["Industrial Shed"] },
  { id: "coworking", label: "Co-working Space", apiTypes: ["Co-working Space"] },
  { id: "restaurant", label: "Restaurant / Cafe Space", apiTypes: ["Restaurant / Cafe"] },
];

const PROJECT_TYPES: IntentPropertyTypeOption[] = [
  { id: "residential-project", label: "Residential Projects", apiTypes: [], searchQuery: "residential project" },
  { id: "commercial-project", label: "Commercial Projects", apiTypes: [], searchQuery: "commercial project" },
  { id: "new-launch", label: "New Launch", apiTypes: [], searchQuery: "new launch" },
  { id: "under-construction", label: "Under Construction", apiTypes: [], searchQuery: "under construction" },
  { id: "ready-to-move", label: "Ready to Move", apiTypes: [], searchQuery: "ready to move" },
];

export const SEARCH_PRESETS: Record<SearchPresetId, SearchPresetConfig> = {
  residential_buy: {
    id: "residential_buy",
    menuLabel: "Buy",
    shortLabel: "Buy",
    group: "residential",
    params: { listingType: "BUY", category: "RESIDENTIAL" },
    propertyTypes: RESIDENTIAL_BUY_TYPES,
    filterPills: ["propertyTypes", "budget", "bedrooms", "constructionStatus"],
    crossLinkPreset: "commercial_buy",
    crossLinkLabel: "Looking for commercial properties?",
  },
  residential_rent: {
    id: "residential_rent",
    menuLabel: "Rent",
    shortLabel: "Rent",
    group: "residential",
    params: { listingType: "RENT", category: "RESIDENTIAL" },
    propertyTypes: RESIDENTIAL_RENT_TYPES,
    filterPills: ["propertyTypes", "rentBudget", "bedrooms", "furnishing", "availableFrom"],
    crossLinkPreset: "commercial_lease",
    crossLinkLabel: "Looking for commercial lease?",
  },
  pg: {
    id: "pg",
    menuLabel: "PG",
    shortLabel: "PG",
    group: "residential",
    params: { listingType: "RENT", category: "RESIDENTIAL" },
    propertyTypes: PG_TYPES,
    filterPills: ["propertyTypes", "rentBudget", "furnishing", "availableFrom"],
  },
  residential_projects: {
    id: "residential_projects",
    menuLabel: "Projects",
    shortLabel: "Projects",
    group: "residential",
    params: { listingType: "BUY", category: "RESIDENTIAL" },
    propertyTypes: PROJECT_TYPES,
    filterPills: ["propertyTypeCategory", "budget", "possession", "constructionStatus"],
    defaultSearchQuery: "project",
  },
  commercial_buy: {
    id: "commercial_buy",
    menuLabel: "Buy",
    shortLabel: "Commercial Buy",
    group: "commercial",
    params: { listingType: "BUY", category: "COMMERCIAL" },
    propertyTypes: COMMERCIAL_BUY_TYPES,
    filterPills: ["propertyTypes", "budget", "possession"],
    crossLinkPreset: "residential_buy",
    crossLinkLabel: "Looking for residential properties?",
  },
  commercial_lease: {
    id: "commercial_lease",
    menuLabel: "Rent / Lease",
    shortLabel: "Commercial Rent",
    group: "commercial",
    params: { listingType: "LEASE", category: "COMMERCIAL" },
    propertyTypes: COMMERCIAL_LEASE_TYPES,
    filterPills: ["propertyTypes", "monthlyRent", "furnishing", "availableFrom"],
    crossLinkPreset: "residential_rent",
    crossLinkLabel: "Looking for residential rent?",
  },
  commercial_projects: {
    id: "commercial_projects",
    menuLabel: "Projects",
    shortLabel: "Commercial Projects",
    group: "commercial",
    params: { listingType: "BUY", category: "COMMERCIAL" },
    propertyTypes: PROJECT_TYPES.filter((t) => t.id !== "residential-project"),
    filterPills: ["propertyTypeCategory", "budget", "possession", "constructionStatus"],
    defaultSearchQuery: "commercial project",
  },
};

/** @deprecated — use SEARCH_PRESET_GROUPS */
export const SEARCH_INTENT_TABS: {
  id: SearchIntentId;
  label: string;
  params: Record<string, string>;
}[] = [
  { id: "buy", label: "Buy", params: SEARCH_PRESETS.residential_buy.params },
  { id: "rent", label: "Rent", params: SEARCH_PRESETS.residential_rent.params },
  { id: "commercial", label: "Commercial", params: SEARCH_PRESETS.commercial_buy.params },
];

export const BUDGET_OPTIONS_BUY = [
  { label: "Any", value: "" },
  { label: "Under 50L", value: "5000000" },
  { label: "Under 1Cr", value: "10000000" },
  { label: "Under 2Cr", value: "20000000" },
  { label: "Under 5Cr", value: "50000000" },
];

export const BUDGET_OPTIONS_RENT = [
  { label: "Any", value: "" },
  { label: "Under 15K / month", value: "15000" },
  { label: "Under 25K / month", value: "25000" },
  { label: "Under 50K / month", value: "50000" },
  { label: "Under 1L / month", value: "100000" },
];

export const BUDGET_OPTIONS_COMMERCIAL_BUY = [
  { label: "Any", value: "" },
  { label: "Under 50L", value: "5000000" },
  { label: "Under 1Cr", value: "10000000" },
  { label: "Under 5Cr", value: "50000000" },
];

export const BUDGET_OPTIONS_COMMERCIAL_LEASE = [
  { label: "Any", value: "" },
  { label: "Under 50K / month", value: "50000" },
  { label: "Under 1L / month", value: "100000" },
  { label: "Under 2L / month", value: "200000" },
];

/** @deprecated */
export const BUDGET_OPTIONS_BY_INTENT: Record<SearchIntentId, { label: string; value: string }[]> = {
  buy: BUDGET_OPTIONS_BUY,
  rent: BUDGET_OPTIONS_RENT,
  commercial: BUDGET_OPTIONS_COMMERCIAL_BUY,
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

export const CONSTRUCTION_STATUS_OPTIONS = [
  { label: "Any", value: "" },
  { label: "New Launch", value: "NEW_LAUNCH" },
  { label: "Under Construction", value: "UNDER_CONSTRUCTION" },
  { label: "Ready to Move", value: "READY_TO_MOVE" },
];

export const POSSESSION_OPTIONS = [
  { label: "Any", value: "" },
  { label: "Immediate", value: "IMMEDIATE" },
  { label: "Within 6 months", value: "WITHIN_6_MONTHS" },
  { label: "Within 1 year", value: "WITHIN_1_YEAR" },
  { label: "After 1 year", value: "AFTER_1_YEAR" },
];

export const POSTED_BY_OPTIONS = [
  { label: "Any", value: "" },
  { label: "Owner", value: "owner" },
  { label: "Broker", value: "broker" },
];

export const AVAILABLE_FROM_OPTIONS = [
  { label: "Any", value: "" },
  { label: "Immediately", value: "IMMEDIATE" },
  { label: "Within 15 days", value: "WITHIN_15_DAYS" },
  { label: "Within 1 month", value: "WITHIN_1_MONTH" },
];

export const AREA_OPTIONS = [
  { label: "Any", value: "" },
  { label: "Under 500 sq.ft", value: "500" },
  { label: "500 - 1000 sq.ft", value: "1000" },
  { label: "1000 - 2500 sq.ft", value: "2500" },
  { label: "2500+ sq.ft", value: "2500_plus" },
];

export const LOCK_IN_OPTIONS = [
  { label: "Any", value: "" },
  { label: "No lock-in", value: "NONE" },
  { label: "6 months", value: "6" },
  { label: "12 months", value: "12" },
  { label: "24+ months", value: "24" },
];

export const PROJECT_CATEGORY_OPTIONS = [
  { label: "Any", value: "" },
  { label: "Residential", value: "residential" },
  { label: "Commercial", value: "commercial" },
];

export const FILTER_PILL_LABELS: Record<FilterPillId, string> = {
  propertyTypes: "Property Types",
  budget: "Budget",
  rentBudget: "Rent Budget",
  monthlyRent: "Monthly Rent",
  bedrooms: "Bedroom",
  furnishing: "Furnishing",
  constructionStatus: "Construction Status",
  postedBy: "Posted By",
  area: "Area",
  possession: "Possession",
  availableFrom: "Available From",
  lockIn: "Lock-in",
  developer: "Developer",
  propertyTypeCategory: "Property Type",
};

export type IntentSearchFilters = {
  preset: SearchPresetId;
  city: string;
  query: string;
  /** Set when user picks a grouped location suggestion. */
  locationSuggestionId?: string;
  /** Multi-locality search (e.g. Salt Lake + New Town). */
  locationIds?: string[];
  propertyTypeIds: string[];
  budget: string;
  bedrooms: string;
  furnishing: string;
  constructionStatus: string;
  possession: string;
  availableFrom: string;
  area: string;
  lockIn: string;
  projectCategory: string;
};

export type HomeSearchFilters = {
  intent: SearchIntentId;
  location: string;
  query: string;
  propertyTypeId: string;
  budget: string;
  bedrooms: string;
  furnishing: string;
};

export function getSearchPreset(id: SearchPresetId | string | null | undefined): SearchPresetConfig {
  if (id && id in SEARCH_PRESETS) {
    return SEARCH_PRESETS[id as SearchPresetId];
  }
  return SEARCH_PRESETS[DEFAULT_SEARCH_PRESET];
}

export function getBudgetLabelForPreset(preset: SearchPresetId): string {
  const config = getSearchPreset(preset);
  if (config.filterPills.includes("monthlyRent") || config.filterPills.includes("rentBudget")) {
    return "Monthly Rent";
  }
  return "Budget";
}

export function resolvePresetFromUrl(
  preset: string | null,
  legacyIntent: string | null,
  listingType?: string | null,
  category?: string | null
): SearchPresetId {
  if (preset && preset in SEARCH_PRESETS) return preset as SearchPresetId;

  if (legacyIntent === "rent") return "residential_rent";
  if (legacyIntent === "commercial") return "commercial_buy";
  if (legacyIntent === "buy") return "residential_buy";

  if (category === "COMMERCIAL") {
    if (listingType === "LEASE") return "commercial_lease";
    if (listingType === "BUY") return "commercial_buy";
    return "commercial_buy";
  }
  if (listingType === "RENT") return "residential_rent";
  if (listingType === "BUY") return "residential_buy";

  return DEFAULT_SEARCH_PRESET;
}

export function legacyIntentFromPreset(preset: SearchPresetId): SearchIntentId {
  if (preset.startsWith("commercial")) return "commercial";
  if (preset === "residential_rent" || preset === "pg") return "rent";
  return "buy";
}

/** @deprecated */
export const INTENT_PROPERTY_TYPES: Record<SearchIntentId, IntentPropertyTypeOption[]> = {
  buy: SEARCH_PRESETS.residential_buy.propertyTypes,
  rent: SEARCH_PRESETS.residential_rent.propertyTypes,
  commercial: SEARCH_PRESETS.commercial_buy.propertyTypes,
};

export function getBudgetOptionsForPreset(preset: SearchPresetId) {
  const config = getSearchPreset(preset);
  if (config.filterPills.includes("monthlyRent") || config.filterPills.includes("rentBudget")) {
    return preset === "commercial_lease" ? BUDGET_OPTIONS_COMMERCIAL_LEASE : BUDGET_OPTIONS_RENT;
  }
  if (config.group === "commercial" && config.params.listingType === "BUY") {
    return BUDGET_OPTIONS_COMMERCIAL_BUY;
  }
  return BUDGET_OPTIONS_BUY;
}

function appendPropertyTypes(
  params: URLSearchParams,
  preset: SearchPresetConfig,
  propertyTypeIds: string[]
) {
  const apiTypes = new Set<string>();
  let searchQuery: string | undefined;

  for (const typeId of propertyTypeIds) {
    const option = preset.propertyTypes.find((o) => o.id === typeId);
    if (!option) continue;
    option.apiTypes.forEach((t) => apiTypes.add(t));
    if (option.searchQuery) searchQuery = option.searchQuery;
  }

  apiTypes.forEach((t) => params.append("propertyType", t));
  propertyTypeIds.forEach((id) => {
    const option = preset.propertyTypes.find((o) => o.id === id);
    if (option && option.apiTypes.length === 0) {
      params.append("pto", id);
    }
  });
  return searchQuery;
}

export function buildIntentSearchParams(
  filters: IntentSearchFilters,
  overrides: Record<string, string> = {}
): URLSearchParams {
  const preset = getSearchPreset(filters.preset);
  const params = new URLSearchParams();

  params.set("preset", preset.id);
  Object.entries(preset.params).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const city = filters.city.trim() || DEFAULT_SEARCH_CITY;
  params.set("city", city);

  if (filters.locationIds?.length) {
    filters.locationIds.forEach((id) => params.append("locationId", id));
  } else {
    const locationQuery = filters.query.trim();
    if (locationQuery || filters.locationSuggestionId) {
      const resolved = resolveLocationSearch(
        { query: locationQuery, suggestionId: filters.locationSuggestionId },
        city
      );
      applyStructuredLocationToParams(params, resolved);
    }
  }

  const typeSearchQuery = appendPropertyTypes(params, preset, filters.propertyTypeIds);
  const effectiveQuery = typeSearchQuery || preset.defaultSearchQuery;
  if (effectiveQuery) params.set("q", effectiveQuery);

  if (filters.budget) params.set("maxPrice", filters.budget);
  if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
  if (filters.furnishing) params.set("furnishing", filters.furnishing);

  if (filters.constructionStatus) params.set("constructionStatus", filters.constructionStatus);
  if (filters.possession) params.set("possession", filters.possession);
  if (filters.availableFrom) params.set("availableFrom", filters.availableFrom);

  if (filters.constructionStatus === "READY_TO_MOVE") {
    params.set("readyToVisit", "true");
  }

  if (filters.projectCategory === "residential") {
    params.set("category", "RESIDENTIAL");
  } else if (filters.projectCategory === "commercial") {
    params.set("category", "COMMERCIAL");
  }

  Object.entries(overrides).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  return params;
}

/** @deprecated — use buildIntentSearchParams */
export function buildSearchParams(
  filters: HomeSearchFilters,
  overrides: Record<string, string> = {}
): URLSearchParams {
  const preset: SearchPresetId =
    filters.intent === "commercial"
      ? "commercial_buy"
      : filters.intent === "rent"
        ? "residential_rent"
        : "residential_buy";
  const propertyTypeIds =
    filters.propertyTypeId && filters.propertyTypeId !== "any" ? [filters.propertyTypeId] : [];

  return buildIntentSearchParams(
    {
      preset,
      city: filters.location,
      query: filters.query,
      propertyTypeIds,
      budget: filters.budget,
      bedrooms: filters.bedrooms,
      furnishing: filters.furnishing,
      constructionStatus: "",
      possession: "",
      availableFrom: "",
      area: "",
      lockIn: "",
      projectCategory: "",
    },
    overrides
  );
}

export function getIntentTabParams(intent: SearchIntentId) {
  return SEARCH_INTENT_TABS.find((t) => t.id === intent)?.params ?? {};
}

export function parseIntentSearchFromUrl(searchParams: URLSearchParams): IntentSearchFilters {
  const preset = resolvePresetFromUrl(
    searchParams.get("preset"),
    searchParams.get("intent"),
    searchParams.get("listingType"),
    searchParams.get("category")
  );
  const config = getSearchPreset(preset);

  const ptoFromUrl = searchParams.getAll("pto").filter(Boolean);
  const propertyTypeIds: string[] = [...ptoFromUrl];
  const apiTypesFromUrl = searchParams.getAll("propertyType").filter(Boolean);
  if (apiTypesFromUrl.length > 0) {
    for (const option of config.propertyTypes) {
      if (option.apiTypes.some((t) => apiTypesFromUrl.includes(t))) {
        if (!propertyTypeIds.includes(option.id)) propertyTypeIds.push(option.id);
      }
    }
  }

  return {
    preset,
    city: searchParams.get("city") || searchParams.get("locality") || DEFAULT_SEARCH_CITY,
    query:
      searchParams.get("q") ||
      searchParams.get("locality") ||
      searchParams.get("project") ||
      searchParams.get("landmark") ||
      "",
    locationSuggestionId: undefined,
    locationIds: searchParams.getAll("locationId").filter(Boolean),
    propertyTypeIds,
    budget: searchParams.get("maxPrice") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    furnishing: searchParams.get("furnishing") || "",
    constructionStatus:
      searchParams.get("constructionStatus") || searchParams.get("availability") || "",
    possession: searchParams.get("possession") || searchParams.get("listingStatus") || "",
    availableFrom: searchParams.get("availableFrom") || "",
    area: "",
    lockIn: "",
    projectCategory: "",
  };
}

/** Label shown on the intent dropdown trigger (99acres-style). */
export function getPresetMenuLabel(presetId: SearchPresetId): string {
  const config = getSearchPreset(presetId);
  if (config.group === "commercial") {
    return `Commercial - ${config.menuLabel}`;
  }
  return config.menuLabel;
}

/** Short context line under the search bar when preset changes. */
export function getPresetContextLine(presetId: SearchPresetId): string {
  const config = getSearchPreset(presetId);
  if (config.group === "commercial") {
    return `Searching commercial properties - ${config.menuLabel}`;
  }
  if (presetId === "pg") return "Searching PG & co-living";
  if (presetId.includes("projects")) return "Searching new & ongoing projects";
  return `Searching residential properties - ${config.menuLabel}`;
}
