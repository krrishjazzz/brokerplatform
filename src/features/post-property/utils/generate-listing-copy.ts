import type { ListingIntent } from "@/lib/posting-config";

function intentPhrase(intent: ListingIntent): string {
  switch (intent) {
    case "SELL":
      return "for Sale";
    case "RENT":
      return "for Rent";
    case "LEASE":
      return "for Lease";
    case "PG":
      return "";
    case "PROJECT":
      return "Project";
    default:
      return "";
  }
}

export function generateListingTitle(params: {
  listingIntent: ListingIntent;
  propertyType: string;
  typeDetails?: Record<string, string>;
  locality?: string;
  city?: string;
}): string {
  const loc = [params.locality?.trim(), params.city?.trim()].filter(Boolean).join(", ") || "Kolkata";
  const bhk = params.typeDetails?.bhk?.trim();
  const type = params.propertyType;

  if (params.listingIntent === "PG") {
    const gender = params.typeDetails?.genderPreference?.trim();
    const sharing = params.typeDetails?.sharingType?.trim();
    const bits = ["PG"];
    if (gender) bits.push(`for ${gender}`);
    if (sharing) bits.push(`(${sharing})`);
    return `${bits.join(" ")} in ${loc}`.replace(/\s+/g, " ").trim();
  }

  const prefix = bhk && /bhk|rk/i.test(bhk) ? `${bhk} ` : "";
  const phrase = intentPhrase(params.listingIntent);
  return `${prefix}${type} ${phrase} in ${loc}`.replace(/\s+/g, " ").trim();
}

export function generateListingDescription(params: {
  propertyType: string;
  listingIntent: ListingIntent;
  locality?: string;
  city?: string;
  typeDetails?: Record<string, string>;
}): string {
  const loc = [params.locality?.trim(), params.city?.trim()].filter(Boolean).join(", ") || "Kolkata";
  const bhk = params.typeDetails?.bhk?.trim();
  const beds = params.typeDetails?.totalBeds?.trim();

  const highlights: string[] = [];
  if (bhk) highlights.push(bhk);
  if (beds) highlights.push(`${beds} beds available`);
  highlights.push(params.propertyType);

  const action =
    params.listingIntent === "SELL"
      ? "sale"
      : params.listingIntent === "PG"
      ? "PG stay"
      : params.listingIntent === "LEASE"
      ? "lease"
      : "rent";

  return [
    `${highlights.filter(Boolean).join(" ")} available for ${action} in ${loc}.`,
    "Listing managed by KrrishJazz with verified details and coordinated visits.",
    "Contact through KrrishJazz for enquiries; your direct number stays private until a visit is arranged.",
  ].join(" ");
}
