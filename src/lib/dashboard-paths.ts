/** Buyer/customer workspace */
export const BUYER_DASHBOARD_PATH = "/dashboard";

/** Owner listing command center */
export const OWNER_DASHBOARD_PATH = "/owners/dashboard";

export function getDashboardBasePath(canList: boolean): string {
  return canList ? OWNER_DASHBOARD_PATH : BUYER_DASHBOARD_PATH;
}

export function dashboardTabHref(canList: boolean, tab: string): string {
  return `${getDashboardBasePath(canList)}?tab=${tab}`;
}

export function isOwnerDashboardPath(pathname: string): boolean {
  return pathname === OWNER_DASHBOARD_PATH || pathname.startsWith(`${OWNER_DASHBOARD_PATH}/`);
}

export function isBuyerDashboardPath(pathname: string): boolean {
  return pathname === BUYER_DASHBOARD_PATH || pathname.startsWith(`${BUYER_DASHBOARD_PATH}/`);
}

/** Logo / “Home” for logged-in owners — dashboard instead of marketing homepage. */
export function getAppHomeHref(canList: boolean): string {
  return canList ? OWNER_DASHBOARD_PATH : "/";
}
