"use client";

import { ArrowRight, Briefcase, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLoginPopup } from "@/lib/login-popup-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const DASHBOARD_CARDS = [
  { title: "Live requirements", metric: "24+", desc: "Active buyer & tenant briefs in your city", tone: "from-primary-light to-white" },
  { title: "Matched inventory", metric: "180+", desc: "Verified owner & partner listings", tone: "from-white to-primary-light/40" },
  { title: "Closure pipeline", metric: "12", desc: "Deals in progress this month", tone: "from-primary-light/50 to-white" },
];

export function BrokersPageHero() {
  const { user } = useAuth();
  const { openLoginPopup } = useLoginPopup();
  const router = useRouter();
  const signedIn = Boolean(user?.name?.trim());

  const scrollToApplication = () => {
    document.getElementById("broker-auth")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleApply = () => {
    if (signedIn) {
      if (user?.brokerStatus === "APPROVED") {
        router.push("/broker/properties");
        return;
      }
      if (user?.hasBrokerApplication && user.brokerStatus !== "REJECTED") {
        router.push("/dashboard?tab=application");
        return;
      }
      scrollToApplication();
      return;
    }
    openLoginPopup({
      intent: "broker",
      allowIntentSwitch: false,
      title: "Sign in to apply as broker",
      subtitle: "Join the managed KrrishJazz broker network.",
      onSuccess: () => {
        window.location.href = "/brokers#broker-auth";
      },
    });
  };

  return (
    <section className="relative overflow-hidden border-b border-border-strong bg-gradient-to-b from-primary-light via-white to-surface">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-pill border border-primary/20 bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Briefcase size={12} />
              KrrishJazz Broker Network
            </span>
            <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl lg:text-[44px]">
              Close deals with verified demand — not chase noise.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-text-secondary">
              A premium broker workspace for managed requirements, verified inventory, and RM-backed support — built for Kolkata&apos;s serious operators.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="min-w-44 gap-2" onClick={handleApply}>
                <UserPlus size={18} />
                Apply as Broker
                <ArrowRight size={16} />
              </Button>
            </div>
            <p className="mt-4 text-sm text-text-secondary">Free to apply · RERA-verified network · Approval typically within one business day</p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-[0_16px_48px_rgba(0,92,168,0.12)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Dashboard preview</p>
            <div className="mt-4 space-y-3">
              {DASHBOARD_CARDS.map((card) => (
                <div key={card.title} className={cn("rounded-xl border border-border/80 bg-gradient-to-r p-4", card.tone)}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{card.title}</p>
                    <span className="text-xl font-bold text-primary">{card.metric}</span>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
