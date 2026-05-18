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

export function formatPlatformPhoneDisplay(phone: string = PLATFORM_PHONE) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
}

type PropertyWhatsAppTarget = {
  title: string;
  slug: string;
  city: string;
  locality?: string | null;
  price: number;
  propertyType: string;
};

export function buildPlatformWhatsAppUrl(message: string) {
  return `https://wa.me/${normalizePlatformPhoneForWhatsApp()}?text=${encodeURIComponent(message)}`;
}

export function buildPropertyWhatsAppUrl(property: PropertyWhatsAppTarget, origin?: string) {
  const base = origin || (typeof window !== "undefined" ? window.location.origin : "");
  const message = [
    "Hi KrrishJazz, I want help with this property.",
    property.title,
    `${property.locality ? `${property.locality}, ` : ""}${property.city}`,
    `Price: ${property.price}`,
    `${base}/properties/${property.slug}`,
  ].join("\n");
  return `https://wa.me/${normalizePlatformPhoneForWhatsApp()}?text=${encodeURIComponent(message)}`;
}
