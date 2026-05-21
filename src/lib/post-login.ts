import type { LoginIntent } from "@/lib/login-intent";

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
 * Priority: admin -> explicit broker intent -> owner intent -> safe redirect -> browse default.
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

  if (intent === "broker") {
    if (user.brokerStatus === "APPROVED") {
      return "/broker/properties";
    }
    if (user.hasBrokerApplication) {
      return "/dashboard?tab=application";
    }
    return "/brokers#broker-auth";
  }

  if (intent === "owner") {
    return "/dashboard?tab=post";
  }

  if (safeRedirect) {
    return safeRedirect;
  }

  return "/properties";
}

export { deriveAuthCapabilities } from "@/lib/capabilities";
