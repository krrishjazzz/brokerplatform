/** Normalize user input to +91XXXXXXXXXX for API/auth. */
export function normalizeIndianPhoneInput(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 13 && digits.startsWith("910")) return `+91${digits.slice(3)}`;
  return null;
}

/** Extract up to 10 local digits for display in the input (after +91 prefix). */
export function extractLocalPhoneDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2, 12);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1, 11);
  if (digits.length >= 10) return digits.slice(-10);
  return digits.slice(0, 10);
}

export function formatPhoneInputValue(raw: string): string {
  return extractLocalPhoneDigits(raw);
}

export function isValidIndianPhoneLocal(localDigits: string) {
  return localDigits.length === 10 && /^[6-9]\d{9}$/.test(localDigits);
}

export function toApiPhone(localDigits: string): string | null {
  return normalizeIndianPhoneInput(localDigits);
}

export function formatPhoneDisplay(localOrFull: string) {
  const normalized = normalizeIndianPhoneInput(localOrFull);
  if (!normalized) return localOrFull;
  return `${normalized.slice(0, 3)} ${normalized.slice(3, 8)} ${normalized.slice(8)}`;
}
