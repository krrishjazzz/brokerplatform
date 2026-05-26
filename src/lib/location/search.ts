/**
 * Location search — DB hierarchy first, static dictionary fallback.
 * Prefer async APIs from db-search.ts in routes; sync helpers delegate to static data.
 */
import {
  LOCATION_DICTIONARY,
  getDictionaryEntry,
  getNearbyLocalities,
  LANDMARK_SUGGESTIONS,
  PROJECT_SUGGESTIONS,
} from "@/lib/location/dictionary";
import { textMatchesLocationQuery } from "@/lib/location/normalize";
import type {
  LocationSuggestion,
  LocationSuggestionGroups,
  ResolvedLocationSearch,
  StructuredLocation,
} from "@/lib/location/types";
import { suggestionToStructured } from "@/lib/location/db-search";

export {
  suggestLocationsAsync,
  getPopularLocationsAsync,
  getLocationByIdAsync,
  getCitiesAsync,
  resolveLocationSearchAsync,
  resolveLocationIdsAsync,
  applyStructuredLocationToParams,
  getLocationSeoMeta,
  suggestionToStructured,
} from "@/lib/location/db-search";

function normalize(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function entryToLocalitySuggestion(entry: (typeof LOCATION_DICTIONARY)[0]): LocationSuggestion | null {
  if (entry.subLocality) return null;
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

function entryToSubLocalitySuggestion(entry: (typeof LOCATION_DICTIONARY)[0]): LocationSuggestion | null {
  if (!entry.subLocality) return null;
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

/** @deprecated Use suggestLocationsAsync — static fallback for legacy sync callers. */
export function suggestLocations(query: string, city: string, limitPerGroup = 6): LocationSuggestionGroups {
  const localities: LocationSuggestion[] = [];
  const subLocalities: LocationSuggestion[] = [];
  const projects: LocationSuggestion[] = [];
  const landmarks: LocationSuggestion[] = [];

  for (const entry of LOCATION_DICTIONARY) {
    if (entry.city !== city || entry.isActive === false) continue;
    const terms = [entry.locality, entry.subLocality || "", ...entry.aliases].filter(Boolean);
    if (!textMatchesLocationQuery(terms, query)) continue;

    const loc = entryToLocalitySuggestion(entry);
    if (loc && localities.length < limitPerGroup) localities.push(loc);

    const sub = entryToSubLocalitySuggestion(entry);
    if (sub && subLocalities.length < limitPerGroup) subLocalities.push(sub);
  }

  for (const p of PROJECT_SUGGESTIONS) {
    if (p.city !== city) continue;
    const terms = [p.label, p.projectOrSociety || "", ...p.searchTerms];
    if (!textMatchesLocationQuery(terms, query)) continue;
    if (projects.length >= limitPerGroup) break;
    projects.push({ ...p, type: "project" });
  }

  for (const l of LANDMARK_SUGGESTIONS) {
    if ("city" in l && l.city !== city) continue;
    if (!("label" in l)) continue;
    const terms = [l.label, l.landmark || "", ...l.searchTerms];
    if (!textMatchesLocationQuery(terms, query)) continue;
    if (landmarks.length >= limitPerGroup) break;
    landmarks.push({ ...l, type: "landmark" });
  }

  return { localities, subLocalities, projects, landmarks };
}

export function getSuggestionById(id: string): LocationSuggestion | null {
  const entry = getDictionaryEntry(id);
  if (entry) {
    return entryToSubLocalitySuggestion(entry) || entryToLocalitySuggestion(entry);
  }
  const project = PROJECT_SUGGESTIONS.find((p) => p.id === id);
  if (project) return { ...project, type: "project" };
  const landmark = LANDMARK_SUGGESTIONS.find((l) => "id" in l && l.id === id && "label" in l);
  if (landmark && "label" in landmark) return { ...landmark, type: "landmark" };
  return null;
}

/** @deprecated Use resolveLocationSearchAsync */
export function resolveLocationSearch(
  input: { query?: string; suggestionId?: string },
  defaultCity: string
): ResolvedLocationSearch {
  if (input.suggestionId) {
    const s = getSuggestionById(input.suggestionId);
    if (s) return buildResolved(suggestionToStructured(s), s.id, s.searchTerms[0]);
  }

  const query = (input.query || "").trim();
  if (!query) {
    return { city: defaultCity, matchLocalities: [] };
  }

  const groups = suggestLocations(query, defaultCity, 3);
  const best =
    groups.localities[0] ||
    groups.subLocalities[0] ||
    groups.projects[0] ||
    groups.landmarks[0];

  if (best) {
    return buildResolved(suggestionToStructured(best), best.id, query);
  }

  const qNorm = normalize(query);
  for (const entry of LOCATION_DICTIONARY) {
    if (entry.city !== defaultCity) continue;
    const aliasHit =
      normalize(entry.locality) === qNorm ||
      entry.aliases.some((a) => normalize(a) === qNorm || normalize(a).includes(qNorm));
    if (aliasHit) {
      return buildResolved(
        { city: entry.city, locality: entry.locality, subLocality: entry.subLocality },
        entry.id,
        query
      );
    }
  }

  if (normalize(query) === normalize(defaultCity)) {
    return { city: defaultCity, matchLocalities: [] };
  }

  return {
    city: defaultCity,
    locality: query,
    matchLocalities: [query],
    freeText: query,
  };
}

function buildResolved(
  structured: StructuredLocation,
  entryId?: string,
  freeText?: string
): ResolvedLocationSearch {
  const matchLocalities = new Set<string>();
  if (structured.locality) matchLocalities.add(structured.locality);
  if (structured.subLocality) matchLocalities.add(structured.subLocality);

  if (entryId) {
    const entry = getDictionaryEntry(entryId);
    if (entry) {
      entry.aliases.forEach((a) => matchLocalities.add(a));
      getNearbyLocalities(entryId).forEach((n) => matchLocalities.add(n));
    }
  }

  return {
    ...structured,
    matchLocalities: Array.from(matchLocalities).filter(Boolean),
    freeText,
  };
}

