/** Normalize user input to +91XXXXXXXXXX for API/auth. */
export function normalizeIndianPhoneInput(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (/^\+91[6-9]\d{9}$/.test(raw.trim())) return raw.trim();
  return null;
}

export function formatPhoneInputValue(raw: string): string {
  const normalized = normalizeIndianPhoneInput(raw);
  if (normalized) return normalized;
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91")) return `+${digits.slice(0, 12)}`;
  if (digits.length > 0) return `+91${digits.slice(0, 10)}`;
  return "+91";
}
