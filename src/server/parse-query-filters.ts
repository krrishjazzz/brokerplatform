export function parseOptionalPrice(
  raw: string | null,
  fieldName: string
): { ok: true; value?: number } | { ok: false; error: string } {
  if (!raw || raw.trim() === "") return { ok: true };
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { ok: false, error: `Invalid ${fieldName}. Use a valid number.` };
  }
  return { ok: true, value: parsed };
}
