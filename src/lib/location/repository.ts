import { prisma } from "@/lib/prisma";
import { normalizeLocationText } from "@/lib/location/normalize";
import type { LocationSuggestionType } from "@/lib/location/types";

export type LocationType =
  | "country"
  | "state"
  | "city"
  | "zone"
  | "locality"
  | "sublocality"
  | "landmark"
  | "project";

export type LocationRecord = {
  id: string;
  name: string;
  slug: string;
  type: LocationType;
  parentId: string | null;
  cityId: string | null;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  aliases: string[];
  nearbyIds: string[];
  priority: number;
  isActive: boolean;
  cityName: string;
  localityName: string;
  zoneName: string;
  searchTerms: string[];
};

type LocationCache = {
  loadedAt: number;
  byId: Map<string, LocationRecord>;
  byCityName: Map<string, LocationRecord[]>;
  cities: LocationRecord[];
  popular: LocationRecord[];
};

const CACHE_TTL_MS = 60_000;

const globalRef = globalThis as typeof globalThis & { __locationCache?: LocationCache };

function parseJsonArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function mapSuggestionType(type: LocationType): LocationSuggestionType | null {
  if (type === "locality" || type === "city") return "locality";
  if (type === "sublocality") return "sub_locality";
  if (type === "project") return "project";
  if (type === "landmark") return "landmark";
  return null;
}

function enrichRecord(
  row: {
    id: string;
    name: string;
    slug: string;
    type: string;
    parentId: string | null;
    cityId: string | null;
    state: string;
    country: string;
    latitude: number | null;
    longitude: number | null;
    aliases: string;
    nearbyIds: string;
    priority: number;
    isActive: boolean;
  },
  byId: Map<string, { id: string; name: string; type: string; parentId: string | null; cityId: string | null }>
): LocationRecord {
  const aliases = parseJsonArray(row.aliases);
  const nearbyIds = parseJsonArray(row.nearbyIds);

  let cityName = "";
  let localityName = "";
  let zoneName = "";

  const walk = (id: string | null): void => {
    if (!id) return;
    const n = byId.get(id);
    if (!n) return;
    if (n.type === "city" && !cityName) cityName = n.name;
    if (n.type === "zone" && !zoneName) zoneName = n.name;
    if (n.type === "locality" && !localityName) localityName = n.name;
    walk(n.parentId);
  };

  if (row.type === "city") cityName = row.name;
  else walk(row.parentId);

  if (row.type === "locality") localityName = row.name;
  if (row.type === "sublocality" || row.type === "landmark" || row.type === "project") {
    if (!localityName && row.parentId) {
      const parent = byId.get(row.parentId);
      if (parent?.type === "locality") localityName = parent.name;
    }
  }

  const resolvedCityId = row.type === "city" ? row.id : row.cityId;

  const searchTerms = Array.from(
    new Set([row.name, ...aliases, cityName, localityName, zoneName].filter(Boolean))
  );

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type as LocationType,
    parentId: row.parentId,
    cityId: resolvedCityId,
    state: row.state,
    country: row.country,
    latitude: row.latitude,
    longitude: row.longitude,
    aliases,
    nearbyIds,
    priority: row.priority,
    isActive: row.isActive,
    cityName: cityName || "Kolkata",
    localityName,
    zoneName,
    searchTerms,
  };
}

export async function loadLocationCache(force = false): Promise<LocationCache | null> {
  const existing = globalRef.__locationCache;
  if (!force && existing && Date.now() - existing.loadedAt < CACHE_TTL_MS) {
    return existing;
  }

  try {
    const rows = await prisma.location.findMany({
      where: { isActive: true },
      orderBy: [{ priority: "desc" }, { name: "asc" }],
    });

    if (rows.length === 0) return null;

    const skeleton = new Map(
      rows.map((r) => [
        r.id,
        {
          id: r.id,
          name: r.name,
          type: r.type,
          parentId: r.parentId,
          cityId: r.cityId,
        },
      ])
    );

    const byId = new Map<string, LocationRecord>();
    for (const row of rows) {
      byId.set(row.id, enrichRecord(row, skeleton));
    }

    const byCityName = new Map<string, LocationRecord[]>();
    const cities: LocationRecord[] = [];

    for (const record of Array.from(byId.values())) {
      if (record.type === "city") {
        cities.push(record);
        byCityName.set(normalizeLocationText(record.name), []);
      }
    }

    for (const record of Array.from(byId.values())) {
      const cityKey = normalizeLocationText(record.cityName);
      if (!byCityName.has(cityKey)) byCityName.set(cityKey, []);
      const searchable: LocationType[] = ["locality", "sublocality", "landmark", "project", "zone", "city"];
      if (searchable.includes(record.type)) {
        byCityName.get(cityKey)!.push(record);
      }
    }

    const popular = Array.from(byId.values())
      .filter((r) => r.type === "locality" && r.priority > 0)
      .sort((a, b) => b.priority - a.priority);

    const cache: LocationCache = {
      loadedAt: Date.now(),
      byId,
      byCityName,
      cities,
      popular,
    };

    globalRef.__locationCache = cache;
    return cache;
  } catch {
    return null;
  }
}

export function invalidateLocationCache() {
  globalRef.__locationCache = undefined;
}

export function recordToSuggestion(record: LocationRecord): import("@/lib/location/types").LocationSuggestion | null {
  const type = mapSuggestionType(record.type);
  if (!type) return null;

  const label = record.name;
  const subtitle =
    record.type === "city"
      ? `${record.name}, ${record.state || record.country}`
      : record.type === "locality"
        ? `${record.name}, ${record.cityName}`
        : `${record.name}, ${record.localityName ? `${record.localityName}, ` : ""}${record.cityName}`;

  return {
    id: record.id,
    type,
    label,
    subtitle,
    city: record.cityName,
    locality: record.localityName || (record.type === "locality" ? record.name : ""),
    subLocality: record.type === "sublocality" ? record.name : undefined,
    projectOrSociety: record.type === "project" ? record.name : undefined,
    landmark: record.type === "landmark" ? record.name : undefined,
    searchTerms: record.searchTerms,
  };
}
