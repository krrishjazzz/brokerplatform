/** How the user entered sign-in (marketing / CTA intent). */
export type LoginIntent = "buyer" | "owner" | "broker";

const LEGACY_AS_BROKER = "broker";
const LEGACY_INTENT_POST = "post";

export function parseLoginIntent(
  intentParam: string | null,
  asParam: string | null
): LoginIntent {
  if (intentParam === "owner" || intentParam === LEGACY_INTENT_POST) return "owner";
  if (intentParam === "broker" || asParam === LEGACY_AS_BROKER) return "broker";
  return "buyer";
}

export function buildLoginUrl(options?: {
  intent?: LoginIntent;
  redirect?: string;
}) {
  const params = new URLSearchParams();
  const intent = options?.intent ?? "buyer";
  params.set("intent", intent);
  if (options?.redirect) {
    const safe = options.redirect.startsWith("/") ? options.redirect : "/";
    params.set("redirect", safe);
  }
  const qs = params.toString();
  return `/login?${qs}`;
}

export function loginIntentPageTitle(intent: LoginIntent) {
  if (intent === "owner") return "Sign in to list your property";
  if (intent === "broker") return "Sign in to apply as broker";
  return "Sign in to KrrishJazz";
}

export function loginIntentPageSubtitle(intent: LoginIntent) {
  if (intent === "owner") return "Post free. KrrishJazz manages enquiries.";
  if (intent === "broker") return "Join the managed KrrishJazz broker network.";
  return "Track saved properties, enquiries, and callbacks.";
}

/** Inline AuthCard defaults — no role selection UI. */
export function authCardInlineTitle(intent: LoginIntent) {
  if (intent === "owner") return "List with KrrishJazz";
  if (intent === "broker") return "Apply to the broker network";
  return "Continue with KrrishJazz";
}

export function authCardInlineSubtitle(intent: LoginIntent) {
  if (intent === "owner") return "Sign in with OTP to post and manage your listing.";
  if (intent === "broker") return "Sign in with OTP to start your partner application.";
  return "Track saved properties, enquiries, callbacks, and visits.";
}

export function loginIntentChipLabel(intent: LoginIntent) {
  if (intent === "owner") return "Owner";
  if (intent === "broker") return "Broker";
  return "Buyer / Tenant";
}

export function loginIntentSidebarTitle(intent: LoginIntent) {
  if (intent === "owner") return "List with KrrishJazz";
  if (intent === "broker") return "Broker network";
  return "Find your next property";
}

export const LOGIN_INTENT_SIDEBAR: Record<
  LoginIntent,
  { title: string; desc: string }[]
> = {
  broker: [
    {
      title: "Managed requirements",
      desc: "Access KrrishJazz-managed requirements and verified network inventory.",
    },
    {
      title: "Protected contact",
      desc: "Customer contact is protected. KrrishJazz coordinates sharing and closure.",
    },
    {
      title: "Free to apply",
      desc: "No upfront fee. Approval typically within one business day.",
    },
  ],
  owner: [
    { title: "Free listing", desc: "List at no upfront cost." },
    { title: "Managed enquiries", desc: "KrrishJazz handles buyer calls." },
    { title: "Pay on closure", desc: "Brokerage only when the deal closes." },
  ],
  buyer: [
    { title: "Verified listings", desc: "Every live property is checked." },
    { title: "Save and enquire", desc: "Shortlist and track callbacks." },
    { title: "Expert support", desc: "Managed contact through KrrishJazz." },
  ],
};
