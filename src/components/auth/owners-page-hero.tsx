"use client";

import { ArrowRight, PlusCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLoginPopup } from "@/lib/login-popup-context";
import { useRouter } from "next/navigation";
import { OWNER_DASHBOARD_PATH } from "@/lib/dashboard-paths";
import { cn } from "@/lib/utils";

const FLOW_CARDS = [
  { title: "Active enquiries", metric: "12+", desc: "Managed buyer callbacks this week", tone: "from-primary-light to-white" },
  { title: "Listing views", metric: "840+", desc: "Verified traffic on live listings", tone: "from-white to-primary-light/40" },
  { title: "Avg. response", metric: "< 2h", desc: "KrrishJazz coordinates first touch", tone: "from-primary-light/50 to-white" },
];

export function OwnersPageHero() {
  const { user } = useAuth();
  const { openLoginPopup } = useLoginPopup();
  const router = useRouter();
  const signedIn = Boolean(user?.name?.trim());

  const handleListClick = () => {
    if (signedIn) {
      router.push(`${OWNER_DASHBOARD_PATH}?tab=post`);
      return;
    }
    openLoginPopup({
      intent: "owner",
      redirect: `${OWNER_DASHBOARD_PATH}?tab=post`,
      title: "Sign in to list your property",
      subtitle: "Post free. KrrishJazz manages enquiries.",
      onSuccess: () => router.push(`${OWNER_DASHBOARD_PATH}?tab=post`),
    });
  };

  return (
    <section className="relative overflow-hidden border-b border-border-strong bg-gradient-to-b from-primary-light via-white to-surface">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-pill border border-primary/20 bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles size={12} />
              For Property Owners
            </span>
            <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl lg:text-[44px]">
              List property free. Close with confidence.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-text-secondary">
              Reach serious buyers and tenants in Kolkata with verified exposure, managed enquiries, and assisted closure — without marketplace noise.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="min-w-44 gap-2" onClick={handleListClick}>
                <PlusCircle size={18} />
                List Property Free
                <ArrowRight size={16} />
              </Button>
            </div>
            <p className="mt-4 text-sm text-text-secondary">Free listing · Managed callbacks · Pay brokerage only on closure</p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-[0_16px_48px_rgba(0,92,168,0.12)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Owner dashboard preview</p>
            <div className="mt-4 space-y-3">
              {FLOW_CARDS.map((card) => (
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
