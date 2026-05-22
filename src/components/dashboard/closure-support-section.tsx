"use client";

import { useEffect, useMemo, useState } from "react";
import { Handshake, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  CLOSURE_STAGES,
  getHighestClosureStage,
  type ClosureStageId,
} from "@/components/dashboard/lead-pipeline";
import { dashboardFetch } from "@/lib/dashboard-api";
import { KRRISHJAZZ_OWNER_SUPPORT_PHONE } from "@/lib/owner-dashboard";
import {
  ownerClosureFeeReminderBody,
  ownerClosureFeeReminderTitle,
} from "@/lib/owner-copy";

const STAGE_ORDER = CLOSURE_STAGES.map((s) => s.id);

function stageIndex(id: ClosureStageId) {
  return STAGE_ORDER.indexOf(id);
}

export function ClosureSupportSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDeals, setActiveDeals] = useState(0);
  const [highlightStage, setHighlightStage] = useState<ClosureStageId>("enquiry");

  useEffect(() => {
    void (async () => {
      const result = await dashboardFetch<{ enquiries: { status?: string }[] }>(
        "/api/enquiries?type=received"
      );
      if (result.error) {
        setError(result.error);
      } else {
        const enquiries = result.data?.enquiries || [];
        const active = enquiries.filter(
          (e) => e.status && !["CLOSED", "LOST"].includes(e.status)
        );
        const statuses = active.map((e) => e.status as string);
        setActiveDeals(active.length);
        setHighlightStage(getHighestClosureStage(statuses));
      }
      setLoading(false);
    })();
  }, []);

  const highlightIndex = useMemo(() => stageIndex(highlightStage), [highlightStage]);

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

      {error && (
        <div className="rounded-xl border border-error/20 bg-error-light px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-border bg-white p-5 shadow-card">
          <h3 className="font-semibold text-foreground">Closure pipeline</h3>
          <ol className="mt-5 space-y-3">
            {CLOSURE_STAGES.filter((s) => s.id !== "lost").map((stage, index) => {
              const isCurrent = index === highlightIndex && activeDeals > 0;
              const isPast = activeDeals > 0 && index < highlightIndex;
              return (
                <li
                  key={stage.id}
                  className={`flex gap-4 rounded-xl border p-4 ${
                    isCurrent
                      ? "border-primary/25 bg-primary-light/50"
                      : isPast
                        ? "border-success/15 bg-success-light/20"
                        : "border-border bg-surface"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isCurrent
                        ? "bg-primary text-white"
                        : isPast
                          ? "bg-success text-white"
                          : "bg-white text-text-secondary"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{stage.label}</p>
                    <p className="mt-1 text-xs text-text-secondary">{stage.desc}</p>
                    {isCurrent && activeDeals > 0 && (
                      <Badge variant="blue" className="mt-2">
                        {activeDeals} active deal{activeDeals === 1 ? "" : "s"} at this stage
                      </Badge>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          {highlightStage === "lost" && (
            <p className="mt-4 text-sm text-text-secondary">
              Some leads were marked lost. Focus on fresh enquiries and listing freshness.
            </p>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
            <Handshake className="mb-2 text-primary" size={28} />
            <p className="font-semibold text-foreground">RM note</p>
            <p className="mt-2 text-sm text-text-secondary">
              Your KrrishJazz team coordinates buyer callbacks, visit slots, and negotiation. You&apos;ll see stage
              updates here as deals progress.
            </p>
            <p className="mt-4 text-sm font-semibold text-foreground">Current focus</p>
            <p className="mt-1 text-sm text-text-secondary">
              {activeDeals > 0
                ? `Most active leads are in the ${CLOSURE_STAGES.find((s) => s.id === highlightStage)?.label ?? "pipeline"} stage.`
                : "Post a property and respond to enquiries to start a closure journey."}
            </p>
          </div>
          <div className="rounded-2xl border border-warning/20 bg-warning-light/30 p-4 text-sm">
            <p className="font-semibold text-foreground">{ownerClosureFeeReminderTitle()}</p>
            <p className="mt-1 text-text-secondary">{ownerClosureFeeReminderBody()}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 text-sm">
            <p className="font-semibold text-foreground">KrrishJazz support</p>
            <p className="mt-1 font-semibold text-primary">{KRRISHJAZZ_OWNER_SUPPORT_PHONE}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
