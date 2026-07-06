import type { AccountCapabilityUser } from "@/lib/capabilities";
import { canAccessBrokerWorkspace, profileCanList } from "@/lib/capabilities";
import {
  BUYER_DASHBOARD_PATH,
  ownerDashboardTabHref,
  OWNER_DASHBOARD_PATH,
} from "@/lib/dashboard-paths";
import { getLastWorkspace, type WorkspaceMode } from "@/lib/workspace";

/** Safe post-login redirect for owner listing intent (avoids middleware hop). */
export const LIST_PROPERTY_POST_REDIRECT = `${BUYER_DASHBOARD_PATH}?tab=post`;

export function canAccessWorkspace(user: AccountCapabilityUser, mode: WorkspaceMode): boolean {
  if (mode === "admin") return user.role === "ADMIN";
  if (mode === "buyer") return true;
  if (mode === "owner") return profileCanList(user);
  if (mode === "broker") return canAccessBrokerWorkspace(user.brokerStatus);
  return false;
}

export function resolveValidLastWorkspace(
  user: AccountCapabilityUser,
  last: WorkspaceMode | null
): WorkspaceMode | null {
  if (!last || last === "admin") return null;
  return canAccessWorkspace(user, last) ? last : null;
}

/** Default landing after login when no explicit redirect or intent. */
export function getDefaultHomeHref(user: AccountCapabilityUser): string {
  if (user.role === "ADMIN") return "/admin";

  if (typeof window !== "undefined") {
    const last = resolveValidLastWorkspace(user, getLastWorkspace());
    if (last === "owner") return OWNER_DASHBOARD_PATH;
    if (last === "broker") return "/broker/properties";
    if (last === "buyer") return "/properties";
  }

  if (canAccessBrokerWorkspace(user.brokerStatus) && !profileCanList(user)) {
    return "/broker/properties";
  }

  return "/properties";
}

export function getOwnerLandingHref(user: AccountCapabilityUser): string {
  return profileCanList(user) ? OWNER_DASHBOARD_PATH : LIST_PROPERTY_POST_REDIRECT;
}

/** List / post property — one entry point for guest, buyer, and owner. */
export function getListPropertyHref(user?: AccountCapabilityUser | null): string {
  if (!user) return "/owners#owner-auth";
  if (profileCanList(user)) return ownerDashboardTabHref("post");
  return LIST_PROPERTY_POST_REDIRECT;
}

/** Marketing CTAs on homepage and public pages (sign-in first). */
export function getListPropertyMarketingHref(): string {
  return `/login?intent=owner&redirect=${encodeURIComponent(LIST_PROPERTY_POST_REDIRECT)}`;
}
