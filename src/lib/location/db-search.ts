import {
  LOCATION_DICTIONARY,
  getDictionaryEntry,
  LANDMARK_SUGGESTIONS,
  PROJECT_SUGGESTIONS,
} from "@/lib/location/dictionary";
import { textMatchesLocationQuery } from "@/lib/location/normalize";
import {
  loadLocationCache,
  recordToSuggestion,
  type LocationRecord,
} from "@/lib/location/repository";
import type {
  LocationSuggestion,
  LocationSuggestionGroups,
  ResolvedLocationSearch,
  StructuredLocation,
} from "@/lib/location/types";

function staticEntryToSuggestion(entry: (typeof LOCATION_DICTIONARY)[0]): LocationSuggestion | null {
  if (entry.subLocality) {
    return {
      id: entry.id,
      type: "sub_locality",
      label: entry.subLocality,
      subtitle: `${entry.subLocality}, ${entry.locality}, ${entry.city}`,
      city: entry.city,
      locality: entry.locality,
      subLocality: entry.subLocality,
      searchTerms: [entry.subLocality, entry.locality, ...entry.aliases],
    };
  }
  return {
    id: entry.id,
    type: "locality",
    label: entry.locality,
    subtitle: `${entry.locality}, ${entry.city}`,
    city: entry.city,
    locality: entry.locality,
    searchTerms: [entry.locality, ...entry.aliases],
  };
}

function suggestFromStatic(query: string, city: string, limitPerGroup: number): LocationSuggestionGroups {
  const localities: LocationSuggestion[] = [];
  const subLocalities: LocationSuggestion[] = [];
  const projects: LocationSuggestion[] = [];
  const landmarks: LocationSuggestion[] = [];

  for (const entry of LOCATION_DICTIONARY) {
    if (entry.city !== city || entry.isActive === false) continue;
    const terms = [entry.locality, entry.subLocality || "", ...entry.aliases].filter(Boolean);
    if (!textMatchesLocationQuery(terms, query)) continue;

    if (!entry.subLocality && localities.length < limitPerGroup) {
      const s = staticEntryToSuggestion(entry);
      if (s) localities.push(s);
    }
    if (entry.subLocality && subLocalities.length < limitPerGroup) {
      const s = staticEntryToSuggestion(entry);
      if (s) subLocalities.push(s);
    }
  }

  for (const p of PROJECT_SUGGESTIONS) {
    if (p.city !== city) continue;
    if (!textMatchesLocationQuery([p.label, ...(p.searchTerms || [])], query)) continue;
    if (projects.length >= limitPerGroup) break;
    projects.push({ ...p, type: "project" });
  }

  for (const l of LANDMARK_SUGGESTIONS) {
    if ("city" in l && l.city !== city) continue;
    if (!("label" in l)) continue;
    if (!textMatchesLocationQuery([l.label, ...(l.searchTerms || [])], query)) continue;
    if (landmarks.length >= limitPerGroup) break;
    landmarks.push({ ...l, type: "landmark" });
  }

  return { localities, subLocalities, projects, landmarks };
}

function suggestFromDb(
  cache: NonNullable<Awaited<ReturnType<typeof loadLocationCache>>>,
  query: string,
  city: string,
  limitPerGroup: number
): LocationSuggestionGroups {
  const localities: LocationSuggestion[] = [];
  const subLocalities: LocationSuggestion[] = [];
  const projects: LocationSuggestion[] = [];
  const landmarks: LocationSuggestion[] = [];

  const cityKey = city.trim().toLowerCase();
  const pool =
    cache.byCityName.get(cityKey) ||
    cache.byCityName.get(cityKey.replace(/\s+/g, "-")) ||
    Array.from(cache.byId.values()).filter((r) => r.cityName.toLowerCase() === cityKey);

  if (!query.trim() && pool.length > 0) {
    localities.push({
      id: `city-all-${cache.cities.find((c) => c.name.toLowerCase() === cityKey)?.id || cityKey}`,
      type: "locality",
      label: `Search in entire ${city}`,
      subtitle: `All localities in ${city}`,
      city,
      locality: "",
      searchTerms: [city],
    });
  }

  for (const record of pool) {
    if (!textMatchesLocationQuery(record.searchTerms, query)) continue;
    const suggestion = recordToSuggestion(record);
    if (!suggestion) continue;

    if (suggestion.type === "locality" && localities.length < limitPerGroup) {
      localities.push(suggestion);
    } else if (suggestion.type === "sub_locality" && subLocalities.length < limitPerGroup) {
      subLocalities.push(suggestion);
    } else if (suggestion.type === "project" && projects.length < limitPerGroup) {
      projects.push(suggestion);
    } else if (suggestion.type === "landmark" && landmarks.length < limitPerGroup) {
      landmarks.push(suggestion);
    }
  }

  return { localities, subLocalities, projects, landmarks };
}

export async function suggestLocationsAsync(
  query: string,
  city: string,
  limitPerGroup = 6
): Promise<LocationSuggestionGroups> {
  const cache = await loadLocationCache();
  if (cache) return suggestFromDb(cache, query, city, limitPerGroup);
  return suggestFromStatic(query, city, limitPerGroup);
}

export async function getPopularLocationsAsync(city: string, limit = 8): Promise<LocationSuggestion[]> {
  const cache = await loadLocationCache();
  if (cache) {
    const cityKey = city.trim().toLowerCase();
    const popular = cache.popular.filter((r) => r.cityName.toLowerCase() === cityKey);
    return popular
      .map((r) => recordToSuggestion(r))
      .filter((s): s is LocationSuggestion => Boolean(s))
      .slice(0, limit);
  }

  const defaults = ["New Town", "Salt Lake", "Rajarhat", "Ballygunge", "Garia", "Park Street"];
  return defaults.slice(0, limit).map((name, i) => ({
    id: `static-pop-${i}`,
    type: "locality" as const,
    label: name,
    subtitle: `${name}, ${city}`,
    city,
    locality: name,
    searchTerms: [name],
  }));
}

export async function getLocationByIdAsync(id: string): Promise<LocationSuggestion | null> {
  const cache = await loadLocationCache();
  if (cache) {
    const record = cache.byId.get(id);
    if (record) return recordToSuggestion(record);
  }

  const entry = getDictionaryEntry(id);
  if (entry) return staticEntryToSuggestion(entry);

  const project = PROJECT_SUGGESTIONS.find((p) => p.id === id);
  if (project) return { ...project, type: "project" };

  const landmark = LANDMARK_SUGGESTIONS.find((l) => "id" in l && l.id === id && "label" in l);
  if (landmark && "label" in landmark) return { ...landmark, type: "landmark" };

  return null;
}

export async function getCitiesAsync(): Promise<{ id: string; name: string; slug: string; state: string }[]> {
  const cache = await loadLocationCache();
  if (cache?.cities.length) {
    return cache.cities.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      state: c.state,
    }));
  }
  return [{ id: "static-kolkata", name: "Kolkata", slug: "kolkata", state: "West Bengal" }];
}

function collectMatchLocalities(record: LocationRecord, cache: Map<string, LocationRecord>): string[] {
  const match = new Set<string>();
  if (record.localityName) match.add(record.localityName);
  if (record.type === "locality") match.add(record.name);
  if (record.type === "sublocality") match.add(record.name);
  record.aliases.forEach((a) => match.add(a));

  for (const nid of record.nearbyIds) {
    const near = cache.get(nid);
    if (near?.localityName) match.add(near.localityName);
    if (near?.type === "locality") match.add(near.name);
  }

  return Array.from(match).filter(Boolean);
}

export function suggestionToStructured(s: LocationSuggestion): StructuredLocation {
  return {
    city: s.city,
    locality: s.locality,
    subLocality: s.subLocality,
    projectOrSociety: s.projectOrSociety,
    landmark: s.landmark,
  };
}

function buildResolved(
  structured: StructuredLocation,
  matchLocalities: string[],
  freeText?: string
): ResolvedLocationSearch {
  return {
    ...structured,
    matchLocalities,
    freeText,
  };
}

export async function resolveLocationSearchAsync(
  input: { query?: string; suggestionId?: string },
  defaultCity: string
): Promise<ResolvedLocationSearch> {
  const cache = await loadLocationCache();

  if (input.suggestionId) {
    const s = await getLocationByIdAsync(input.suggestionId);
    if (s) {
      const record = cache?.byId.get(input.suggestionId);
      const matchLocalities = record && cache
        ? collectMatchLocalities(record, cache.byId)
        : [s.locality, s.subLocality].filter(Boolean) as string[];
      return buildResolved(suggestionToStructured(s), matchLocalities, s.label);
    }
  }

  const query = (input.query || "").trim();
  if (!query) {
    return { city: defaultCity, matchLocalities: [] };
  }

  const groups = await suggestLocationsAsync(query, defaultCity, 3);
  const best =
    groups.localities[0] ||
    groups.subLocalities[0] ||
    groups.projects[0] ||
    groups.landmarks[0];

  if (best) {
    const record = cache?.byId.get(best.id);
    const matchLocalities =
      record && cache
        ? collectMatchLocalities(record, cache.byId)
        : ([best.locality, best.subLocality].filter(Boolean) as string[]);
    return buildResolved(suggestionToStructured(best), matchLocalities, query);
  }

  return {
    city: defaultCity,
    locality: query,
    matchLocalities: [query],
    freeText: query,
  };
}

/** Merge multiple location picks (Salt Lake + New Town + Rajarhat). */
export async function resolveLocationIdsAsync(
  locationIds: string[],
  defaultCity: string
): Promise<ResolvedLocationSearch> {
  const cache = await loadLocationCache();
  const city = defaultCity;
  const matchLocalities = new Set<string>();
  const structured: StructuredLocation = { city };

  for (const id of locationIds) {
    const s = await getLocationByIdAsync(id);
    if (!s) continue;
    if (s.locality) matchLocalities.add(s.locality);
    if (s.subLocality) matchLocalities.add(s.subLocality);
    const record = cache?.byId.get(id);
    if (record && cache) {
      collectMatchLocalities(record, cache.byId).forEach((m) => matchLocalities.add(m));
    }
    if (!structured.locality && s.locality) structured.locality = s.locality;
  }

  return {
    ...structured,
    city,
    matchLocalities: Array.from(matchLocalities),
  };
}

export function applyStructuredLocationToParams(
  params: URLSearchParams,
  resolved: ResolvedLocationSearch
) {
  params.set("city", resolved.city);

  if (resolved.locality && resolved.matchLocalities.length <= 1) {
    params.set("locality", resolved.locality);
  }
  if (resolved.subLocality) params.set("subLocality", resolved.subLocality);
  if (resolved.projectOrSociety) params.set("project", resolved.projectOrSociety);
  if (resolved.landmark) params.set("landmark", resolved.landmark);

  if (resolved.matchLocalities.length > 1) {
    resolved.matchLocalities.forEach((loc) => params.append("nearbyLocality", loc));
  } else if (resolved.matchLocalities.length === 1 && !params.get("locality")) {
    params.set("locality", resolved.matchLocalities[0]);
  }

  const textParts = [
    resolved.freeText,
    resolved.projectOrSociety,
    resolved.landmark,
    resolved.subLocality,
  ].filter(Boolean);

  if (textParts.length > 0 && !params.get("q")) {
    params.set("q", textParts.join(" "));
  }
}

export async function getLocationSeoMeta(citySlug: string, localitySlug?: string) {
  const cache = await loadLocationCache();
  if (!cache) return null;

  const city = cache.cities.find((c) => c.slug === citySlug);
  if (!city) return null;

  if (!localitySlug) {
    return { cityName: city.name, localityName: null, cityId: city.id };
  }

  const locality = Array.from(cache.byId.values()).find(
    (r) =>
      r.slug === localitySlug &&
      r.type === "locality" &&
      r.cityName.toLowerCase() === city.name.toLowerCase()
  );

  if (!locality) return null;
  return { cityName: city.name, localityName: locality.name, cityId: city.id, localityId: locality.id };
}
