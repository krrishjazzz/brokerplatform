import { BadgeCheck, Clock, Headphones, ShieldCheck, Sparkles } from "lucide-react";

const REASONS = [
  { icon: ShieldCheck, label: "100% Verified" },
  { icon: Headphones, label: "Expert Support" },
  { icon: BadgeCheck, label: "Transparent Process" },
  { icon: Sparkles, label: "Assisted Closure" },
  { icon: Clock, label: "Save Time" },
];

export function WhyChooseSection() {
  return (
    <section className="border-y border-border bg-surface py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">Why choose KrrishJazz?</h2>
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {REASONS.map((item) => (
            <div key={item.label} className="flex flex-col items-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/20 bg-white text-primary shadow-sm">
                <item.icon size={24} strokeWidth={2} />
              </span>
              <p className="mt-3 text-sm font-semibold text-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
