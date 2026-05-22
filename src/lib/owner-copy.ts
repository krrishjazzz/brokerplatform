/**
 * Owner-facing language — use in owner dashboard, post flow, and owners marketing.
 * Avoid: broker, brokerage, broker network, collaboration, inventory (in owner UI).
 */

export type OwnerCopyKey =
  | "brokerage"
  | "brokerNetwork"
  | "broker"
  | "closureFee"
  | "serviceFee"
  | "managedMatching"
  | "relationshipManager"
  | "buyerInterest"
  | "krrishJazzTeam";

const OWNER_COPY: Record<OwnerCopyKey, string> = {
  brokerage: "closure fee",
  brokerNetwork: "assisted matching",
  broker: "KrrishJazz partner",
  closureFee: "closure fee",
  serviceFee: "service fee",
  managedMatching: "managed buyer matching",
  relationshipManager: "relationship manager",
  buyerInterest: "buyer interest",
  krrishJazzTeam: "KrrishJazz team",
};

export function ownerLabel(key: OwnerCopyKey): string {
  return OWNER_COPY[key];
}

export function ownerListingBannerLine(): string {
  return "List for free. Service fee applies only after a successful closure through KrrishJazz.";
}

export function ownerClosureFeeReminderTitle(): string {
  return "Closure fee reminder";
}

export function ownerClosureFeeReminderBody(): string {
  return "One month service fee applies only after a successful closure, as per KrrishJazz terms.";
}

export function ownerPostFreeCta(): string {
  return "Post Free";
}
