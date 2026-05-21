import type { DashboardTab } from "./types";
import { getDefaultTab, getNavItems, type NavContext } from "./navigation";

const NAV_ONLY_IDS = new Set(["broker-workspace"]);

export function getAllowedDashboardTabs(ctx: NavContext): DashboardTab[] {
  return getNavItems(ctx)
    .map((item) => item.id)
    .filter((id): id is DashboardTab => !NAV_ONLY_IDS.has(id));
}

export function resolveDashboardTab(
  requestedTab: string | null,
  ctx: NavContext
): { tab: DashboardTab; redirectTo?: string } {
  if (requestedTab === "apply-broker") {
    return { tab: getDefaultTab(ctx), redirectTo: "/brokers#broker-auth" };
  }

  if (requestedTab === "leads" && ctx.canList) {
    return { tab: "enquiries" };
  }

  const allowed = getAllowedDashboardTabs(ctx);
  if (requestedTab && allowed.includes(requestedTab as DashboardTab)) {
    return { tab: requestedTab as DashboardTab };
  }

  return { tab: getDefaultTab(ctx) };
}

export function canRenderDashboardTab(tab: DashboardTab, ctx: NavContext): boolean {
  return getAllowedDashboardTabs(ctx).includes(tab);
}
