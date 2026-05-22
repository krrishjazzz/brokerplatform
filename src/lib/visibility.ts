export const CUSTOMER_VISIBLE_TYPES = ["DIRECT_CUSTOMERS_ONLY", "FULL_VISIBILITY", "PUBLIC_TO_CUSTOMERS"];
export const BROKER_VISIBLE_TYPES = ["BROKER_NETWORK_ONLY", "FULL_VISIBILITY", "PUBLIC_TO_CUSTOMERS"];

export const VISIBILITY_OPTIONS = [
  {
    value: "FULL_VISIBILITY",
    label: "Full Visibility",
    shortLabel: "Customers + Broker Network",
    description: "Show publicly and to approved brokers. KrrishJazz protects contacts and coordinates interest.",
  },
  {
    value: "DIRECT_CUSTOMERS_ONLY",
    label: "Direct Customers Only",
    shortLabel: "Customers Only",
    description: "Show on public search for buyers and tenants. Hidden from the broker network.",
  },
  {
    value: "BROKER_NETWORK_ONLY",
    label: "Broker Network Only",
    shortLabel: "Broker Network",
    description: "Visible only to approved brokers. Customer public search will not show this listing.",
  },
  {
    value: "PRIVATE",
    label: "Private",
    shortLabel: "Private",
    description: "Only you and KrrishJazz ops can see it until you are ready to open visibility.",
  },
] as const;

export type PropertyVisibilityType = (typeof VISIBILITY_OPTIONS)[number]["value"] | "PUBLIC_TO_CUSTOMERS";

export function getVisibilityLabel(value?: string) {
  if (value === "PUBLIC_TO_CUSTOMERS") return "Full Visibility";
  return VISIBILITY_OPTIONS.find((option) => option.value === value)?.label || "Full Visibility";
}

export function getVisibilityShortLabel(value?: string) {
  if (value === "PUBLIC_TO_CUSTOMERS") return "Customers + Broker Network";
  return VISIBILITY_OPTIONS.find((option) => option.value === value)?.shortLabel || "Customers + Broker Network";
}

/** Plain-language visibility for owners (no broker network wording). */
export const OWNER_FACING_VISIBILITY = [
  {
    value: "FULL_VISIBILITY",
    label: "Public listing",
    shortLabel: "Public listing",
    description:
      "Visible to buyers and tenants on KrrishJazz. KrrishJazz can also use assisted matching while your contact stays protected.",
  },
  {
    value: "DIRECT_CUSTOMERS_ONLY",
    label: "Public listing",
    shortLabel: "Public listing",
    description: "Visible to buyers and tenants on KrrishJazz. Contact stays protected.",
  },
  {
    value: "PUBLIC_TO_CUSTOMERS",
    label: "Public listing",
    shortLabel: "Public listing",
    description: "Visible to buyers and tenants on KrrishJazz. Contact stays protected.",
  },
  {
    value: "BROKER_NETWORK_ONLY",
    label: "Assisted matching",
    shortLabel: "Assisted matching",
    description:
      "KrrishJazz can share the listing with trusted matching partners while protecting your contact.",
  },
  {
    value: "PRIVATE",
    label: "Private assisted listing",
    shortLabel: "Private assisted",
    description: "Not shown publicly. KrrishJazz only uses it for managed matching.",
  },
] as const;

export function getOwnerVisibilityLabel(value?: string) {
  const match = OWNER_FACING_VISIBILITY.find(
    (option) => option.value === value || (value === "PUBLIC_TO_CUSTOMERS" && option.value === "PUBLIC_TO_CUSTOMERS")
  );
  if (match) return match.label;
  if (value === "FULL_VISIBILITY") return "Public listing";
  return "Listing visibility";
}

export function getOwnerVisibilityDescription(value?: string) {
  const match = OWNER_FACING_VISIBILITY.find((option) => option.value === value);
  return match?.description ?? "KrrishJazz manages visibility and buyer contact for you.";
}
