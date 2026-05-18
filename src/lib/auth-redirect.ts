/** Build a safe in-app login URL that returns the user after auth. */
export function buildLoginUrl(returnPath: string) {
  const safe = returnPath.startsWith("/") ? returnPath : "/";
  return `/login?redirect=${encodeURIComponent(safe)}`;
}

/** Return path for saving a listing from search/cards (property detail + auto-save). */
export function buildPropertySaveLoginUrl(slug: string) {
  return buildLoginUrl(`/properties/${slug}?intent=save`);
}
