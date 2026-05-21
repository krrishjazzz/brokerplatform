import {
  getDictionaryEntry,
  getNearbyLocalities,
  LANDMARK_SUGGESTIONS,
  LOCATION_DICTIONARY,
  PROJECT_SUGGESTIONS,
} from "@/lib/location/dictionary";
import type {
  LocationSuggestion,
  LocationSuggestionGroups,
  ResolvedLocationSearch,
  StructuredLocation,
} from "@/lib/location/types";

function normalize(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function matchesQuery(terms: string[], query: string) {
  const q = normalize(query);
  if (!q) return true;
  return terms.some((t) => normalize(t).includes(q) || q.includes(normalize(t)));
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

export function suggestLocations(query: string, city: string, limitPerGroup = 6): LocationSuggestionGroups {
  const localities: LocationSuggestion[] = [];
  const subLocalities: LocationSuggestion[] = [];
  const projects: LocationSuggestion[] = [];
  const landmarks: LocationSuggestion[] = [];

  for (const entry of LOCATION_DICTIONARY) {
    if (entry.city !== city || entry.isActive === false) continue;
    const terms = [entry.locality, entry.subLocality || "", ...entry.aliases].filter(Boolean);
    if (!matchesQuery(terms, query)) continue;

    const loc = entryToLocalitySuggestion(entry);
    if (loc && localities.length < limitPerGroup) localities.push(loc);

    const sub = entryToSubLocalitySuggestion(entry);
    if (sub && subLocalities.length < limitPerGroup) subLocalities.push(sub);
  }

  for (const p of PROJECT_SUGGESTIONS) {
    if (p.city !== city) continue;
    const terms = [p.label, p.projectOrSociety || "", ...p.searchTerms];
    if (!matchesQuery(terms, query)) continue;
    if (projects.length >= limitPerGroup) break;
    projects.push({ ...p, type: "project" });
  }

  for (const l of LANDMARK_SUGGESTIONS) {
    if ("city" in l && l.city !== city) continue;
    if (!("label" in l)) continue;
    const terms = [l.label, l.landmark || "", ...l.searchTerms];
    if (!matchesQuery(terms, query)) continue;
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

export function suggestionToStructured(s: LocationSuggestion): StructuredLocation {
  return {
    city: s.city,
    locality: s.locality,
    subLocality: s.subLocality,
    projectOrSociety: s.projectOrSociety,
    landmark: s.landmark,
  };
}

/** Resolve free-text or suggestion id into structured search + match localities. */
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

/** Apply structured location to property list API query params. */
export function applyStructuredLocationToParams(
  params: URLSearchParams,
  resolved: ResolvedLocationSearch
) {
  params.set("city", resolved.city);

  if (resolved.locality) params.set("locality", resolved.locality);
  if (resolved.subLocality) params.set("subLocality", resolved.subLocality);
  if (resolved.projectOrSociety) params.set("project", resolved.projectOrSociety);
  if (resolved.landmark) params.set("landmark", resolved.landmark);

  if (resolved.matchLocalities.length > 1) {
    resolved.matchLocalities.forEach((loc) => params.append("nearbyLocality", loc));
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
