"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { useDashboardPath } from "@/components/dashboard/dashboard-path-context";
import { leadStatusLabel, leadStatusVariant } from "@/components/dashboard/lead-pipeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dashboardFetch } from "@/lib/dashboard-api";
import { useToast } from "@/components/ui/toast";

type VisitEnquiry = {
  id: string;
  status: string;
  visitDate: string | null;
  message: string;
  property?: { title?: string; slug?: string };
  customer?: { name?: string | null };
};

type VisitBucketId = "upcoming" | "requested" | "completed" | "cancelled";

const VISIT_BUCKETS: { id: VisitBucketId; label: string; empty: string }[] = [
  { id: "upcoming", label: "Upcoming Visits", empty: "No visits scheduled yet." },
  { id: "requested", label: "Requested Visits", empty: "No visit requests pending confirmation." },
  { id: "completed", label: "Completed Visits", empty: "Completed visits will appear here." },
  { id: "cancelled", label: "Cancelled Visits", empty: "No cancelled visits." },
];

function maskBuyerName(name?: string | null) {
  const trimmed = name?.trim();
  if (!trimmed) return "Buyer";
  const [first] = trimmed.split(/\s+/);
  if (!first || first.length < 2) return "Buyer";
  return `${first.charAt(0).toUpperCase()}***`;
}

function classifyVisit(enquiry: VisitEnquiry): VisitBucketId {
  if (enquiry.status === "LOST") return "cancelled";
  if (enquiry.status === "CLOSED") return "completed";

  const visitAt = enquiry.visitDate ? new Date(enquiry.visitDate).getTime() : null;
  const now = Date.now();

  if (visitAt && visitAt >= now) return "upcoming";
  if (enquiry.status === "VISIT_SCHEDULED") return "requested";
  if (visitAt && visitAt < now) return "completed";

  return "requested";
}

function formatVisitDate(value: string | null) {
  if (!value) return "Date TBC";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function VisitsSection() {
  const dashboardPath = useDashboardPath();
  const { toast } = useToast();
  const [enquiries, setEnquiries] = useState<VisitEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadVisits = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await dashboardFetch<{ enquiries: VisitEnquiry[] }>("/api/enquiries?type=received");
    if (result.error) {
      setError(result.error);
      setEnquiries([]);
    } else {
      const visitRelated = (result.data?.enquiries || []).filter(
        (e) =>
          e.visitDate ||
          e.status === "VISIT_SCHEDULED" ||
          e.status === "CLOSED" ||
          e.status === "LOST"
      );
      setEnquiries(visitRelated);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadVisits();
  }, [loadVisits]);

  const buckets = useMemo(() => {
    const grouped: Record<VisitBucketId, VisitEnquiry[]> = {
      upcoming: [],
      requested: [],
      completed: [],
      cancelled: [],
    };
    for (const enquiry of enquiries) {
      grouped[classifyVisit(enquiry)].push(enquiry);
    }
    return grouped;
  }, [enquiries]);

  const runOwnerAction = async (id: string, ownerAction: "confirm_availability" | "request_reschedule") => {
    setActionId(id);
    const result = await dashboardFetch<{ enquiry: VisitEnquiry }>(`/api/enquiries/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ ownerAction }),
    });
    setActionId(null);
    if (result.error) {
      toast(result.error, "error");
      return;
    }
    toast(
      ownerAction === "confirm_availability"
        ? "Availability confirmed. KrrishJazz will coordinate the visit."
        : "Reschedule requested. Your RM will follow up.",
      "success"
    );
    void loadVisits();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Visits</h2>
        <p className="mt-1 text-sm text-text-secondary">
          KrrishJazz coordinates site visits with buyers. You confirm slots; our team handles the rest.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-error/20 bg-error-light px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {VISIT_BUCKETS.map((bucket) => {
          const items = buckets[bucket.id];
          return (
            <section key={bucket.id} className="rounded-2xl border border-border bg-white p-5 shadow-card">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{bucket.label}</h3>
                <Badge variant="default">{items.length}</Badge>
              </div>
              {items.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-surface py-10 text-center">
                  <Calendar className="mb-3 text-text-tertiary" size={36} />
                  <p className="text-sm text-text-secondary">{bucket.empty}</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {items.map((enquiry) => (
                    <li key={enquiry.id} className="rounded-xl border border-border bg-surface p-4">
                      <p className="font-semibold text-foreground line-clamp-1">
                        {enquiry.property?.title || "Property"}
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {maskBuyerName(enquiry.customer?.name)} · {formatVisitDate(enquiry.visitDate)}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant={leadStatusVariant(enquiry.status)}>
                          {leadStatusLabel(enquiry.status)}
                        </Badge>
                      </div>
                      {bucket.id === "requested" && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            loading={actionId === enquiry.id}
                            onClick={() => void runOwnerAction(enquiry.id, "confirm_availability")}
                          >
                            Confirm availability
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            loading={actionId === enquiry.id}
                            onClick={() => void runOwnerAction(enquiry.id, "request_reschedule")}
                          >
                            Request reschedule
                          </Button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-text-secondary">
        <Clock size={14} />
        <span>Need a visit now? Open Enquiries and confirm availability — your RM will follow up.</span>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => (window.location.href = `${dashboardPath}?tab=enquiries`)}
        >
          View Enquiries
        </Button>
      </div>
    </div>
  );
}
