/** Public KrrishJazz contact for buyers/tenants (never owner/broker direct numbers). */
export const PLATFORM_PHONE = (
  process.env.NEXT_PUBLIC_PLATFORM_PHONE || "9163034822"
).replace(/\s/g, "");

export function normalizePlatformPhoneForTel(phone: string = PLATFORM_PHONE) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  return phone.startsWith("+") ? phone : `+${digits}`;
}

export function normalizePlatformPhoneForWhatsApp(phone: string = PLATFORM_PHONE) {
  return normalizePlatformPhoneForTel(phone).replace(/^\+/, "");
}
