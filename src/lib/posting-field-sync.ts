import type { ListingIntent } from "@/lib/posting-config";
import type { PropertyInput } from "@/lib/validations";

export function parseTypeSpecificDetails(
  raw: string | Record<string, string> | null | undefined
): Record<string, string> {
  if (!raw) return {};
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, String(v ?? "")])
    );
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return Object.fromEntries(
        Object.entries(parsed).map(([k, v]) => [k, String(v ?? "")])
      );
    } catch {
      return {};
    }
  }
  return {};
}

function bhkToBedrooms(bhk: string): number | undefined {
  const t = bhk.trim().toLowerCase();
  if (t.includes("1 rk") || t === "1 rk") return 0;
  const m = t.match(/(\d+)/);
  if (m) return Math.min(parseInt(m[1], 10), 20);
  return undefined;
}

/** Map dynamic type fields onto Property columns for search/cards. */
export function syncPrimaryFieldsFromTypeDetails(
  data: PropertyInput,
  typeDetails: Record<string, string>
): PropertyInput {
  const next = { ...data, typeSpecificDetails: { ...typeDetails } };

  const bhk = typeDetails.bhk?.trim();
  if (bhk && (next.bedrooms == null || next.bedrooms === 0)) {
    const beds = bhkToBedrooms(bhk);
    if (beds !== undefined) next.bedrooms = beds;
  }

  const dynBath = typeDetails.bathrooms?.trim();
  if (dynBath && !next.bathrooms) {
    const n = parseInt(dynBath, 10);
    if (Number.isFinite(n)) next.bathrooms = n;
  }

  const dynFloor = typeDetails.floor?.trim();
  if (dynFloor && next.floor == null) {
    const n = parseInt(dynFloor, 10);
    if (Number.isFinite(n)) next.floor = n;
  }

  const dynTotalFloors = typeDetails.totalFloors?.trim();
  if (dynTotalFloors && next.totalFloors == null) {
    const n = parseInt(dynTotalFloors, 10);
    if (Number.isFinite(n)) next.totalFloors = n;
  }

  const fitOut = typeDetails.fitOut?.trim();
  if (fitOut && !next.furnishing) {
    next.furnishing = fitOut;
  }

  if (!next.area || next.area <= 0) {
    const areaCandidate =
      typeDetails.carpetArea ||
      typeDetails.builtUpArea ||
      typeDetails.plotArea ||
      typeDetails.shedArea ||
      typeDetails.landArea;
    if (areaCandidate) {
      const n = parseFloat(areaCandidate);
      if (Number.isFinite(n) && n > 0) next.area = n;
    }
  }

  return next;
}

export function formatIntentAwarePrice(
  price: number,
  listingIntent?: ListingIntent | string | null
): string {
  const n = Number(price);
  if (!Number.isFinite(n) || n <= 0) return "Price on request";

  const intent = listingIntent as ListingIntent | undefined;

  if (intent === "RENT" || intent === "LEASE") {
    if (n >= 100000) return `Rs ${(n / 100000).toFixed(2)} Lac/month`;
    return `Rs ${n.toLocaleString("en-IN")}/month`;
  }

  if (intent === "PG") {
    return `Rs ${n.toLocaleString("en-IN")}/bed`;
  }

  if (intent === "PROJECT") {
    if (n >= 10000000) return `Starting Rs ${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `Starting Rs ${(n / 100000).toFixed(2)} Lac`;
    return `Starting Rs ${n.toLocaleString("en-IN")}`;
  }

  if (n >= 10000000) return `Rs ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `Rs ${(n / 100000).toFixed(2)} Lac`;
  return `Rs ${n.toLocaleString("en-IN")}`;
}

export function getListingIntentFromProperty(property: {
  typeSpecificDetails?: string | Record<string, unknown> | null;
  listingType?: string | null;
}): ListingIntent | null {
  const details = parseTypeSpecificDetails(
    property.typeSpecificDetails as string | Record<string, string> | undefined
  );
  const fromDetails = details.listingIntent as ListingIntent | undefined;
  if (fromDetails && ["SELL", "RENT", "LEASE", "PG", "PROJECT"].includes(fromDetails)) {
    return fromDetails;
  }
  if (details.isPgListing === "true") return "PG";
  if (details.isProject === "true") return "PROJECT";
  if (property.listingType === "LEASE") return "LEASE";
  if (property.listingType === "RENT") return "RENT";
  if (property.listingType === "BUY") return "SELL";
  return null;
}
