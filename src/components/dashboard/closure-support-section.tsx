"use client";

import { useEffect, useState } from "react";
import { Handshake, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { KRRISHJAZZ_OWNER_SUPPORT_PHONE } from "@/lib/owner-dashboard";

const CLOSURE_STAGES = [
  { id: "enquiry", label: "Enquiry", desc: "Buyer interest received and qualified." },
  { id: "visit", label: "Visit", desc: "Site visit coordinated by KrrishJazz." },
  { id: "negotiation", label: "Negotiation", desc: "Price and terms under discussion." },
  { id: "token", label: "Token", desc: "Token amount and timeline agreed." },
  { id: "agreement", label: "Agreement", desc: "Documentation in progress." },
  { id: "closed", label: "Closed", desc: "Deal completed — brokerage on successful closure only." },
] as const;

export function ClosureSupportSection() {
  const [loading, setLoading] = useState(true);
  const [activeDeals, setActiveDeals] = useState(0);

  useEffect(() => {
    fetch("/api/enquiries?type=received", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const active = (data.enquiries || []).filter(
          (e: { status?: string }) => e.status && !["CLOSED", "LOST"].includes(e.status)
        ).length;
        setActiveDeals(active);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Closure Support</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Track deal progress with your KrrishJazz relationship manager. Stages update as conversations move forward.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-border bg-white p-5 shadow-card">
          <h3 className="font-semibold text-foreground">Closure pipeline</h3>
          <ol className="mt-5 space-y-3">
            {CLOSURE_STAGES.map((stage, index) => {
              const isCurrent = index === Math.min(activeDeals > 0 ? 1 : 0, CLOSURE_STAGES.length - 1);
              return (
                <li
                  key={stage.id}
                  className={`flex gap-4 rounded-xl border p-4 ${
                    isCurrent ? "border-primary/25 bg-primary-light/50" : "border-border bg-surface"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isCurrent ? "bg-primary text-white" : "bg-white text-text-secondary"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{stage.label}</p>
                    <p className="mt-1 text-xs text-text-secondary">{stage.desc}</p>
                    {isCurrent && activeDeals > 0 && (
                      <Badge variant="blue" className="mt-2">
                        {activeDeals} active deal{activeDeals === 1 ? "" : "s"}
                      </Badge>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
            <Handshake className="mb-2 text-primary" size={28} />
            <p className="font-semibold text-foreground">RM note</p>
            <p className="mt-2 text-sm text-text-secondary">
              Your KrrishJazz team coordinates buyer callbacks, visit slots, and negotiation. You&apos;ll see stage
              updates here as deals progress.
            </p>
            <p className="mt-4 text-sm font-semibold text-foreground">Next action</p>
            <p className="mt-1 text-sm text-text-secondary">
              {activeDeals > 0
                ? "Keep listings fresh and confirm availability when buyers show interest."
                : "Post a property and respond to enquiries to start a closure journey."}
            </p>
          </div>
          <div className="rounded-2xl border border-warning/20 bg-warning-light/30 p-4 text-sm">
            <p className="font-semibold text-foreground">Brokerage reminder</p>
            <p className="mt-1 text-text-secondary">
              One month brokerage applies only after a successful closure, as per KrrishJazz terms.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 text-sm">
            <p className="font-semibold text-foreground">KrrishJazz support</p>
            <p className="mt-1 text-primary font-semibold">{KRRISHJAZZ_OWNER_SUPPORT_PHONE}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
