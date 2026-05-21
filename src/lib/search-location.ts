import { resolveLocationSearch, applyStructuredLocationToParams } from "@/lib/location/search";

/** Cities vs localities for homepage / search location pickers. */
export const SEARCH_CITY_OPTIONS = ["Kolkata", "Howrah"] as const;

export const SEARCH_LOCALITY_OPTIONS = [
  "Salt Lake",
  "New Town",
  "Rajarhat",
  "Ballygunge",
  "Park Street",
  "Behala",
  "EM Bypass",
] as const;

export const SEARCH_LOCATION_OPTIONS = [
  ...SEARCH_CITY_OPTIONS,
  ...SEARCH_LOCALITY_OPTIONS,
] as const;

export type SearchLocationOption = (typeof SEARCH_LOCATION_OPTIONS)[number];

export function isSearchCity(location: string) {
  return (SEARCH_CITY_OPTIONS as readonly string[]).includes(location);
}

/** @deprecated Use resolveLocationSearch + applyStructuredLocationToParams */
export function applySearchLocationParams(
  params: URLSearchParams,
  location: string,
  defaultCity = "Kolkata"
) {
  const resolved = resolveLocationSearch({ query: location }, defaultCity);
  applyStructuredLocationToParams(params, resolved);
}
