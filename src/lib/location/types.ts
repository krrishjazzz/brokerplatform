export type LocationLayer =
  | "city"
  | "locality"
  | "sub_locality"
  | "project"
  | "landmark";

export type LocationSuggestionType = "locality" | "sub_locality" | "project" | "landmark";

export type StructuredLocation = {
  city: string;
  locality?: string;
  subLocality?: string;
  projectOrSociety?: string;
  landmark?: string;
};

export type LocationDictionaryEntry = {
  id: string;
  city: string;
  locality: string;
  subLocality?: string;
  aliases: string[];
  zone?: string;
  lat?: number;
  lng?: number;
  nearbyLocalityIds?: string[];
  isActive?: boolean;
};

export type LocationSuggestion = {
  id: string;
  type: LocationSuggestionType;
  label: string;
  subtitle: string;
  city: string;
  locality: string;
  subLocality?: string;
  projectOrSociety?: string;
  landmark?: string;
  searchTerms: string[];
};

export type LocationSuggestionGroups = {
  localities: LocationSuggestion[];
  subLocalities: LocationSuggestion[];
  projects: LocationSuggestion[];
  landmarks: LocationSuggestion[];
};

export type ResolvedLocationSearch = StructuredLocation & {
  /** Extra locality names to match (aliases + nearby). */
  matchLocalities: string[];
  freeText?: string;
};
