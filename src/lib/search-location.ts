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

/** Map a picked location into API query params (city vs locality). */
export function applySearchLocationParams(
  params: URLSearchParams,
  location: string,
  defaultCity = "Kolkata"
) {
  const trimmed = location.trim();
  if (!trimmed) return;

  if (isSearchCity(trimmed)) {
    params.set("city", trimmed);
    return;
  }

  params.set("locality", trimmed);
  if (!params.get("city")) {
    params.set("city", defaultCity);
  }
}
