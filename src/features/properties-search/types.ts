export type { Pagination, Property, PropertySaveTarget } from "@/components/properties/types";

export type SavedSearchFilters = {
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
  readyToVisitOnly: boolean;
  constructionStatus: string;
  possession: string;
  availableFrom: string;
  sort: string;
  query: string;
};

export type SavedSearch = {
  id: string;
  label: string;
  filters: SavedSearchFilters;
  savedAt: number;
};

export type PropertiesSearchFilters = SavedSearchFilters & {
  page: number;
};
