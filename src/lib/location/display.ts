export type PropertyLocationFields = {
  city: string;
  locality?: string | null;
  subLocality?: string | null;
  projectOrSociety?: string | null;
  landmark?: string | null;
  address?: string | null;
  state?: string | null;
  pincode?: string | null;
};

/** What buyers see on cards and detail pages. */
export function formatPublicLocationLine(loc: PropertyLocationFields): string {
  const parts: string[] = [];
  if (loc.locality?.trim()) parts.push(loc.locality.trim());
  if (loc.subLocality?.trim() && loc.subLocality !== loc.locality) {
    parts.push(loc.subLocality.trim());
  }
  if (loc.city?.trim()) parts.push(loc.city.trim());
  return parts.length > 0 ? parts.join(", ") : loc.city || "Kolkata";
}

export function formatPublicLocationSecondary(loc: PropertyLocationFields): string | null {
  if (loc.landmark?.trim()) return `Near ${loc.landmark.trim()}`;
  if (loc.projectOrSociety?.trim()) return loc.projectOrSociety.trim();
  return null;
}

export const LOCATION_PRIVACY_NOTE =
  "Full address is private. Buyers only see locality until KrrishJazz coordinates a visit.";

export const EXACT_LOCATION_NOTE =
  "Exact location shared after KrrishJazz visit coordination.";

export function stripPrivateLocationFields<T extends PropertyLocationFields>(
  property: T,
  publicView: boolean
): T {
  if (!publicView) return property;
  return { ...property, address: null };
}
