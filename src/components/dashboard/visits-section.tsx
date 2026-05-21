"use client";

import { Calendar, Clock } from "lucide-react";
import { useDashboardPath } from "@/components/dashboard/dashboard-path-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const VISIT_BUCKETS = [
  { id: "upcoming", label: "Upcoming Visits", empty: "No visits scheduled yet." },
  { id: "requested", label: "Requested Visits", empty: "No visit requests pending confirmation." },
  { id: "completed", label: "Completed Visits", empty: "Completed visits will appear here." },
  { id: "cancelled", label: "Cancelled Visits", empty: "No cancelled visits." },
] as const;

export function VisitsSection() {
  const dashboardPath = useDashboardPath();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Visits</h2>
        <p className="mt-1 text-sm text-text-secondary">
          KrrishJazz coordinates site visits with buyers. You confirm slots; our team handles the rest.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-primary/15 bg-primary-light/40 p-4 text-sm text-text-secondary">
        Visit scheduling is rolling out. Enquiries marked for site visits will appear here with date, RM notes, and
        owner actions (confirm slot, reschedule, mark done).
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {VISIT_BUCKETS.map((bucket) => (
          <section key={bucket.id} className="rounded-2xl border border-border bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{bucket.label}</h3>
              <Badge variant="default">0</Badge>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-surface py-10 text-center">
              <Calendar className="mb-3 text-text-tertiary" size={36} />
              <p className="text-sm text-text-secondary">{bucket.empty}</p>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-text-secondary">
        <Clock size={14} />
        <span>Need a visit now? Open Enquiries and confirm availability — your RM will follow up.</span>
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => (window.location.href = `${dashboardPath}?tab=enquiries`)}>
          View Enquiries
        </Button>
      </div>
    </div>
  );
}
