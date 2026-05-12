export function parseJsonArray<T = unknown>(value: string | null | undefined): T[] {
  try {
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseJsonObject<T extends Record<string, unknown> = Record<string, unknown>>(
  value: string | null | undefined
): T {
  try {
    const parsed = value ? JSON.parse(value) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as T) : ({} as T);
  } catch {
    return {} as T;
  }
}
