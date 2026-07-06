/** Buyer/customer workspace — saved, enquiries, requirements */
export const BUYER_DASHBOARD_PATH = "/dashboard";

/** Owner listing command center */
export const OWNER_DASHBOARD_PATH = "/owners/dashboard";

/** My activity dashboard — same path for all users */
export function getActivityDashboardPath(): string {
  return BUYER_DASHBOARD_PATH;
}

export function dashboardTabHref(tab: string): string {
  return `${BUYER_DASHBOARD_PATH}?tab=${tab}`;
}

export function ownerDashboardTabHref(tab: string): string {
  return `${OWNER_DASHBOARD_PATH}?tab=${tab}`;
}

export function isOwnerDashboardPath(pathname: string): boolean {
  return pathname === OWNER_DASHBOARD_PATH || pathname.startsWith(`${OWNER_DASHBOARD_PATH}/`);
}

export function isBuyerDashboardPath(pathname: string): boolean {
  return pathname === BUYER_DASHBOARD_PATH || pathname.startsWith(`${BUYER_DASHBOARD_PATH}/`);
}

/** Logo / breadcrumb home — search-first for all non-admin users. */
export function getAppHomeHref(user?: { role?: string } | null): string {
  if (!user) return "/";
  if (user.role === "ADMIN") return "/admin";
  return "/properties";
}
