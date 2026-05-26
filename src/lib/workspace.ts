import type { AccountCapabilityUser } from "@/lib/capabilities";
import {
  canAccessBrokerWorkspace,
  deriveAuthCapabilities,
  profileCanList,
  profileCanPostProperty,
} from "@/lib/capabilities";
import {
  isBuyerDashboardPath,
  isOwnerDashboardPath,
  OWNER_DASHBOARD_PATH,
} from "@/lib/dashboard-paths";

export type WorkspaceMode = "owner" | "buyer" | "broker" | "admin";

export type WorkspaceCapabilities = {
  canSearch: boolean;
  canSave: boolean;
  canList: boolean;
  canPostProperty: boolean;
  canUseBrokerWorkspace: boolean;
  isAdmin: boolean;
};

const LAST_WORKSPACE_KEY = "krrishjazz:lastWorkspace";

export function isDashboardWorkspacePath(pathname: string): boolean {
  if (!pathname) return false;
  return (
    isOwnerDashboardPath(pathname) ||
    isBuyerDashboardPath(pathname) ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/broker" ||
    pathname.startsWith("/broker/")
  );
}

export function getWorkspaceModeFromPath(pathname: string): WorkspaceMode {
  if (!pathname) return "buyer";
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin";
  if (pathname === "/broker" || pathname.startsWith("/broker/")) return "broker";
  if (isOwnerDashboardPath(pathname)) return "owner";
  if (isBuyerDashboardPath(pathname)) return "buyer";
  if (pathname.startsWith("/properties")) return "buyer";
  return "buyer";
}

export function isMarketplaceSearchPath(pathname: string): boolean {
  return pathname === "/properties" || pathname.startsWith("/properties/");
}

/** App shells that use workspace headers instead of the public navbar. */
export function usesWorkspaceChrome(pathname: string): boolean {
  return isDashboardWorkspacePath(pathname) || isMarketplaceSearchPath(pathname);
}

export function deriveWorkspaceCapabilities(user: AccountCapabilityUser): WorkspaceCapabilities {
  const caps = deriveAuthCapabilities(user);
  const canList = profileCanList(user);
  return {
    canSearch: true,
    canSave: true,
    canList,
    canPostProperty: profileCanPostProperty(user),
    canUseBrokerWorkspace: canAccessBrokerWorkspace(user.brokerStatus),
    isAdmin: caps.isAdmin,
  };
}

export function persistLastWorkspace(mode: WorkspaceMode) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_WORKSPACE_KEY, mode);
  } catch {
    // ignore
  }
}

export function getLastWorkspace(): WorkspaceMode | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(LAST_WORKSPACE_KEY);
    if (value === "owner" || value === "buyer" || value === "broker" || value === "admin") {
      return value;
    }
  } catch {
    // ignore
  }
  return null;
}

export function workspaceHomeHref(mode: WorkspaceMode, caps: WorkspaceCapabilities): string {
  if (mode === "admin") return "/admin";
  if (mode === "broker") return "/broker/properties";
  if (mode === "owner" && caps.canList) return OWNER_DASHBOARD_PATH;
  return "/properties";
}

export function workspaceModeLabel(mode: WorkspaceMode): string {
  switch (mode) {
    case "owner":
      return "Owner Dashboard";
    case "buyer":
      return "Marketplace";
    case "broker":
      return "Broker Workspace";
    case "admin":
      return "Admin";
    default:
      return "KrrishJazz";
  }
}
