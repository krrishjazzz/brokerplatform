import type { LoginIntent } from "@/lib/login-intent";
import { buildLoginUrl as buildLoginUrlWithIntent } from "@/lib/login-intent";
import { LIST_PROPERTY_POST_REDIRECT } from "@/lib/user-journey";

/** Build login URL with optional intent and return path. */
export function buildLoginUrl(returnPath: string, intent?: LoginIntent) {
  const safe = returnPath.startsWith("/") ? returnPath : "/";
  return buildLoginUrlWithIntent({ redirect: safe, intent });
}

/** Return path for saving a listing from search/cards. */
export function buildPropertySaveLoginUrl(slug: string) {
  return buildLoginUrl(`/properties/${slug}?intent=save`, "buyer");
}

export function buildOwnerLoginUrl(redirect = LIST_PROPERTY_POST_REDIRECT) {
  return buildLoginUrlWithIntent({ intent: "owner", redirect });
}

export function buildBrokerLoginUrl() {
  return buildLoginUrlWithIntent({ intent: "broker" });
}
