import { BadgeCheck, Headphones, PhoneOff, ShieldCheck } from "lucide-react";

const ITEMS = [
  {
    icon: ShieldCheck,
    title: "Verified Listings",
    desc: "Every listing is verified",
  },
  {
    icon: PhoneOff,
    title: "No Spam Calls",
    desc: "We value your privacy",
  },
  {
    icon: Headphones,
    title: "Managed Closure",
    desc: "Assisted till you close",
  },
  {
    icon: BadgeCheck,
    title: "Pay on Closure",
    desc: "Pay only on successful deal",
  },
];

export function TrustValueBar() {
  return (
    <section className="border-b border-border bg-white py-8">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        {ITEMS.map((item) => (
          <div key={item.title} className="flex items-start gap-3 text-center sm:text-left">
            <span className="mx-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary sm:mx-0">
              <item.icon size={22} strokeWidth={2} />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">{item.title}</p>
              <p className="mt-0.5 text-xs text-text-secondary">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
