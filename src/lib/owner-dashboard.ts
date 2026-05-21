/** Human-friendly labels for owner-facing property workflow. */

export type OwnerPropertyDisplayStatus =
  | "under_review"
  | "live"
  | "needs_update"
  | "paused"
  | "rejected"
  | "closed";

export function getOwnerPropertyDisplayStatus(
  status?: string | null,
  listingStatus?: string | null
): OwnerPropertyDisplayStatus {
  const normalized = (status || "").toUpperCase();
  const listing = (listingStatus || "").toUpperCase();

  if (normalized === "REJECTED") return "rejected";
  if (listing === "CLOSED" || normalized === "CLOSED") return "closed";
  if (listing === "ON_HOLD") return "paused";
  if (normalized === "PENDING_REVIEW" || normalized === "PENDING") return "under_review";
  if (normalized === "LIVE") {
    if (listing === "AVAILABLE" || !listing) return "live";
    return "needs_update";
  }
  return "needs_update";
}

export function getOwnerPropertyStatusLabel(
  status?: string | null,
  listingStatus?: string | null
): string {
  const key = getOwnerPropertyDisplayStatus(status, listingStatus);
  const labels: Record<OwnerPropertyDisplayStatus, string> = {
    under_review: "Under KrrishJazz Review",
    live: "Live",
    needs_update: "Needs Update",
    paused: "Paused",
    rejected: "Rejected",
    closed: "Closed",
  };
  return labels[key];
}

export function getOwnerPropertyStatusVariant(
  status?: string | null,
  listingStatus?: string | null
): "default" | "success" | "warning" | "error" | "blue" {
  const key = getOwnerPropertyDisplayStatus(status, listingStatus);
  if (key === "live") return "success";
  if (key === "under_review") return "warning";
  if (key === "rejected" || key === "closed") return "error";
  if (key === "paused" || key === "needs_update") return "warning";
  return "default";
}

export const OWNER_TRUST_LINES = [
  "Your property is reviewed before going live.",
  "Buyer contact is handled by KrrishJazz.",
  "Visits and negotiation are coordinated by our team.",
  "Brokerage applies only after successful closure.",
] as const;

export const KRRISHJAZZ_OWNER_SUPPORT_PHONE = process.env.NEXT_PUBLIC_KRRISHJAZZ_SUPPORT_PHONE || "+91 33 0000 0000";
