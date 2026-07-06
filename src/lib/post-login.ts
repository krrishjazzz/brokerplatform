import type { LoginIntent } from "@/lib/login-intent";
import { profileCanList } from "@/lib/capabilities";
import { getDefaultHomeHref, getOwnerLandingHref } from "@/lib/user-journey";
import { persistLastWorkspace, type WorkspaceMode } from "@/lib/workspace";

export type PostLoginUser = {
  role: string;
  brokerStatus?: string | null;
  canList?: boolean;
  hasBrokerApplication?: boolean;
};

/** Safe in-app path only. */
export function sanitizeRedirect(path: string | null | undefined): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return null;
  if (path.startsWith("/login")) return null;
  return path;
}

/**
 * Single routing table after OTP / session restore.
 * Priority: admin -> explicit broker intent -> owner intent -> safe redirect -> default home.
 */
export function resolvePostLoginDestination(
  user: PostLoginUser,
  intent: LoginIntent,
  redirectUrl?: string | null
): string {
  const safeRedirect = sanitizeRedirect(redirectUrl ?? null);

  if (user.role === "ADMIN") {
    return safeRedirect?.startsWith("/admin") ? safeRedirect : "/admin";
  }

  let destination: string;
  let workspace: WorkspaceMode = "buyer";

  if (intent === "broker") {
    workspace = "broker";
    if (user.brokerStatus === "APPROVED") {
      destination = "/broker/properties";
    } else if (user.hasBrokerApplication) {
      destination = "/dashboard?tab=application";
    } else {
      destination = "/brokers#broker-auth";
    }
  } else if (intent === "owner") {
    workspace = profileCanList(user) ? "owner" : "buyer";
    destination = getOwnerLandingHref(user);
  } else if (safeRedirect) {
    destination = safeRedirect;
    workspace = safeRedirect.startsWith("/owners/dashboard")
      ? "owner"
      : safeRedirect.startsWith("/broker")
        ? "broker"
        : safeRedirect.startsWith("/admin")
          ? "admin"
          : "buyer";
  } else {
    destination = getDefaultHomeHref(user);
    workspace =
      destination.startsWith("/broker") ? "broker" : destination.startsWith("/owners") ? "owner" : "buyer";
  }

  if (typeof window !== "undefined") {
    persistLastWorkspace(workspace);
  }

  return destination;
}

export { deriveAuthCapabilities } from "@/lib/capabilities";
