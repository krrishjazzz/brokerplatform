/** Normalize user input for location matching (aliases, fuzzy search). */
export function normalizeLocationText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9\s-]/g, "");
}

/** Compact form: "salt lake" → "saltlake" for alias hits like Saltlake. */
export function compactLocationText(text: string): string {
  return normalizeLocationText(text).replace(/\s+/g, "");
}

export function slugifyLocation(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function textMatchesLocationQuery(terms: string[], query: string): boolean {
  const q = normalizeLocationText(query);
  const qCompact = compactLocationText(query);
  if (!q) return true;

  return terms.some((term) => {
    const t = normalizeLocationText(term);
    const tCompact = compactLocationText(term);
    return (
      t.includes(q) ||
      q.includes(t) ||
      (qCompact.length >= 2 && (tCompact.includes(qCompact) || qCompact.includes(tCompact)))
    );
  });
}
