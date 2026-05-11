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
