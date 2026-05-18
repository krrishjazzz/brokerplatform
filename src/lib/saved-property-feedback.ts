export function savedPropertyToastMessage(saved: boolean) {
  return saved ? "Property saved." : "Removed from saved.";
}

export function parseSavedPropertyIds(payload: unknown): string[] {
  if (!payload || typeof payload !== "object" || !("saved" in payload)) return [];
  const items = (payload as { saved?: unknown }).saved;
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as { propertyId?: string; property?: { id?: string } };
      return record.propertyId || record.property?.id || null;
    })
    .filter((id): id is string => typeof id === "string" && id.length > 0);
}

export function parseSavedToggleResponse(payload: unknown): boolean | null {
  if (!payload || typeof payload !== "object" || !("saved" in payload)) return null;
  const saved = (payload as { saved?: unknown }).saved;
  return typeof saved === "boolean" ? saved : null;
}
