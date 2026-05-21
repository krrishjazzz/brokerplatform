import type { LocationDictionaryEntry, LocationSuggestion } from "@/lib/location/types";

/** Canonical Kolkata-area dictionary (seed into DB via admin later). */
export const LOCATION_DICTIONARY: LocationDictionaryEntry[] = [
  {
    id: "loc-salt-lake",
    city: "Kolkata",
    locality: "Salt Lake",
    aliases: ["Bidhannagar", "Bidhan Nagar", "Sector V area"],
    zone: "East Kolkata",
    nearbyLocalityIds: ["loc-sector-v", "loc-karunamoyee"],
  },
  {
    id: "loc-sector-v",
    city: "Kolkata",
    locality: "Salt Lake",
    subLocality: "Sector V",
    aliases: ["Sec V", "Salt Lake Sector 5"],
    zone: "East Kolkata",
  },
  {
    id: "loc-karunamoyee",
    city: "Kolkata",
    locality: "Karunamoyee",
    aliases: ["Karunamoyee Housing"],
    zone: "East Kolkata",
    nearbyLocalityIds: ["loc-salt-lake"],
  },
  {
    id: "loc-new-town",
    city: "Kolkata",
    locality: "New Town",
    aliases: ["Newtown", "Rajarhat New Town", "Action Area"],
    zone: "East Kolkata",
    nearbyLocalityIds: ["loc-rajarhat", "loc-ecospace"],
  },
  {
    id: "loc-rajarhat",
    city: "Kolkata",
    locality: "Rajarhat",
    aliases: ["Rajarhat Main Road"],
    zone: "East Kolkata",
    nearbyLocalityIds: ["loc-new-town"],
  },
  {
    id: "loc-ballygunge",
    city: "Kolkata",
    locality: "Ballygunge",
    aliases: ["Ballygunge Place"],
    zone: "South Kolkata",
  },
  {
    id: "loc-park-street",
    city: "Kolkata",
    locality: "Park Street",
    aliases: ["Park Street Area", "Camac Street"],
    zone: "Central Kolkata",
  },
  {
    id: "loc-behala",
    city: "Kolkata",
    locality: "Behala",
    aliases: [],
    zone: "South Kolkata",
  },
  {
    id: "loc-em-bypass",
    city: "Kolkata",
    locality: "EM Bypass",
    aliases: ["Eastern Metropolitan Bypass", "EM Bypass Kolkata"],
    zone: "East Kolkata",
  },
  {
    id: "loc-howrah",
    city: "Howrah",
    locality: "Howrah",
    aliases: ["Howrah Station area"],
    zone: "Howrah",
  },
];

export const PROJECT_SUGGESTIONS: Omit<LocationSuggestion, "type">[] = [
  {
    id: "proj-south-city",
    label: "South City",
    subtitle: "Prince Anwar Shah Rd, Kolkata",
    city: "Kolkata",
    locality: "Ballygunge",
    projectOrSociety: "South City",
    searchTerms: ["south city kolkata", "south city towers"],
  },
  {
    id: "proj-merlin-x",
    label: "Merlin X",
    subtitle: "New Town, Kolkata",
    city: "Kolkata",
    locality: "New Town",
    projectOrSociety: "Merlin X",
    searchTerms: ["merlin x new town"],
  },
  {
    id: "proj-xyz-residency",
    label: "XYZ Residency",
    subtitle: "Sector V, Salt Lake",
    city: "Kolkata",
    locality: "Salt Lake",
    subLocality: "Sector V",
    projectOrSociety: "XYZ Residency",
    searchTerms: ["xyz residency salt lake"],
  },
];

export const LANDMARK_SUGGESTIONS: Omit<LocationSuggestion, "type">[] = [
  {
    id: "lm-city-centre-sl",
    label: "City Centre Salt Lake",
    subtitle: "Salt Lake, Kolkata",
    city: "Kolkata",
    locality: "Salt Lake",
    landmark: "City Centre Salt Lake",
    searchTerms: ["city centre salt lake", "city centre mall salt lake"],
  },
  {
    id: "lm-ecospace",
    label: "Ecospace New Town",
    subtitle: "New Town, Kolkata",
    city: "Kolkata",
    locality: "New Town",
    landmark: "Ecospace New Town",
    searchTerms: ["ecospace", "ecospace business park"],
  },
];

const entryById = new Map<string, LocationDictionaryEntry>();
for (const e of LOCATION_DICTIONARY) {
  entryById.set(e.id, e);
}

export function getDictionaryEntry(id: string): LocationDictionaryEntry | undefined {
  return entryById.get(id);
}

export function getNearbyLocalities(entryId: string): string[] {
  const entry = entryById.get(entryId);
  if (!entry?.nearbyLocalityIds?.length) return [];
  const names = new Set<string>();
  for (const nid of entry.nearbyLocalityIds) {
    const near = entryById.get(nid);
    if (near?.locality) names.add(near.locality);
    if (near?.subLocality) names.add(near.subLocality);
  }
  return Array.from(names);
}

export function allCanonicalLocalityNames(city: string): string[] {
  const names = new Set<string>();
  for (const e of LOCATION_DICTIONARY) {
    if (e.city !== city || e.isActive === false) continue;
    names.add(e.locality);
    if (e.subLocality) names.add(e.subLocality);
    e.aliases.forEach((a) => names.add(a));
  }
  return Array.from(names);
}
