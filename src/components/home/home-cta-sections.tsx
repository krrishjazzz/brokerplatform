import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Headphones,
  IndianRupee,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function OwnerListPropertyCta() {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-white via-primary-light/30 to-white p-6 shadow-[0_12px_40px_rgba(0,92,168,0.1)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-pill border border-primary/20 bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                <Sparkles size={12} />
                For Owners
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">List Property with KrrishJazz</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
                Reach serious buyers and tenants with verified exposure, assisted closure, and support from our broker network — without listing noise.
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: ShieldCheck, label: "Verified exposure" },
                  { icon: BadgeCheck, label: "Assisted closure" },
                  { icon: Users, label: "Broker network support" },
                  { icon: Headphones, label: "Dedicated RM" },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-white/80 px-3 py-2.5 text-sm font-medium text-foreground">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                      <item.icon size={16} />
                    </span>
                    {item.label}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/owners/dashboard?tab=post">
                  <Button size="lg" className="min-w-44 gap-2">
                    <PlusCircle size={18} />
                    Post Property Free
                  </Button>
                </Link>
                <Link href="/login?intent=owner" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  Login to manage listings
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Owner listing flow</p>
              <ol className="mt-4 space-y-4">
                {["Add property details", "KrrishJazz reviews & verifies", "Managed callbacks begin", "Close with assisted support"].map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="pt-0.5 text-sm font-medium text-foreground">{step}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 rounded-xl bg-surface px-3 py-2 text-xs leading-5 text-text-secondary">
                Free listing. Brokerage only on successful closure through KrrishJazz-managed deals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function JoinBrokerNetworkCta() {
  return (
    <section className="border-t border-border bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="overflow-hidden rounded-2xl bg-primary-dark shadow-lift">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 sm:p-8">
              <span className="inline-flex items-center gap-2 rounded-pill border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                <Briefcase size={12} />
                Broker Network
              </span>
              <h2 className="mt-4 text-2xl font-semibold leading-tight text-white sm:text-3xl">
                Join the KrrishJazz broker network
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/85">
                Access verified demand, curated inventory tools, and managed closures — built for brokers who want quality leads, not spam.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link href="/brokers">
                  <Button size="lg" className="min-w-44 gap-2 bg-white text-primary hover:bg-white/95">
                    <Briefcase size={16} />
                    Explore Broker Network
                  </Button>
                </Link>
                <Link href="/login?intent=broker" className="inline-flex items-center gap-1 text-sm font-semibold text-white underline-offset-4 hover:underline">
                  Broker login
                  <ArrowRight size={14} />
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-pill border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">Verified leads</span>
                <span className="rounded-pill border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">RM support</span>
                <span className="rounded-pill border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  <IndianRupee size={11} className="mr-1 inline" />
                  Commission tracking
                </span>
              </div>
            </div>
            <div className="border-t border-white/10 bg-white/[0.06] p-5 sm:p-6 lg:border-l lg:border-t-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Why brokers choose us</p>
              <ul className="mt-4 space-y-3">
                {["No public marketplace clutter", "Requirements + inventory in one place", "Closure-first workflow", "Verified network badge"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/90">
                    <BadgeCheck size={16} className="mt-0.5 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
