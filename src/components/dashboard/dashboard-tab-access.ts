import type { DashboardMode } from "@/components/dashboard/dashboard-mode";
import type { DashboardTab } from "./types";
import { getDefaultTab, getNavItems, type NavContext } from "./navigation";

const NAV_ONLY_IDS = new Set(["broker-workspace"]);

export function getAllowedDashboardTabs(ctx: NavContext, mode?: DashboardMode): DashboardTab[] {
  return getNavItems({ ...ctx, mode })
    .map((item) => item.id)
    .filter((id): id is DashboardTab => !NAV_ONLY_IDS.has(id));
}

export function resolveDashboardTab(
  requestedTab: string | null,
  ctx: NavContext,
  mode?: DashboardMode,
  editSlug?: string | null
): { tab: DashboardTab; redirectTo?: string } {
  const navCtx = { ...ctx, mode };

  if (requestedTab === "apply-broker") {
    return { tab: getDefaultTab(navCtx), redirectTo: "/brokers#broker-auth" };
  }

  if (requestedTab === "leads" && ctx.canList) {
    return { tab: "enquiries" };
  }

  const allowed = getAllowedDashboardTabs(navCtx, mode);

  if (editSlug && allowed.includes("post")) {
    return { tab: "post" };
  }

  if (requestedTab && allowed.includes(requestedTab as DashboardTab)) {
    return { tab: requestedTab as DashboardTab };
  }

  return { tab: getDefaultTab(navCtx) };
}

export function canRenderDashboardTab(tab: DashboardTab, ctx: NavContext, mode?: DashboardMode): boolean {
  return getAllowedDashboardTabs({ ...ctx, mode }, mode).includes(tab);
}
