"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Loader2, MessageSquare, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LEAD_PIPELINE, leadStatusHint, leadStatusLabel, leadStatusVariant } from "@/components/dashboard/lead-pipeline";
import type { LeadRow } from "@/components/dashboard/types";

export function LeadsSection() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/enquiries?type=received", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        const items = (data.enquiries || []).map((enquiry: any) => ({
          id: enquiry.id,
          customerName: enquiry.customer?.name || enquiry.name,
          phone: enquiry.customer?.phone || enquiry.phone,
          propertyTitle: enquiry.property?.title || "",
          propertySlug: enquiry.property?.slug,
          message: enquiry.message,
          date: enquiry.createdAt,
          status: enquiry.status,
          visitDate: enquiry.visitDate,
        }));
        setLeads(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pipelineCounts = useMemo(
    () => LEAD_PIPELINE.map((item) => ({
      ...item,
      count: leads.filter((lead) => lead.status === item.value).length,
    })),
    [leads]
  );

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-2">Managed Enquiries Received</h2>
      <p className="mb-6 text-sm text-text-secondary">Customer contact stays protected. KrrishJazz coordinates callbacks and shares deal-ready context.</p>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-card shadow-card p-8 text-center border border-border">
          <Users size={48} className="mx-auto text-text-secondary mb-3" />
          <p className="text-text-secondary">No enquiries received yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {pipelineCounts.map((item) => (
              <div key={item.value} className="rounded-card border border-border bg-white p-3 shadow-card">
                <p className="text-xl font-bold text-foreground">{item.count}</p>
                <p className="mt-1 text-xs font-semibold text-foreground">{item.label}</p>
                <p className="mt-0.5 text-[11px] leading-4 text-text-secondary">{item.ownerHint}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4">
            {leads.map((lead) => (
              <LeadPipelineCard key={lead.id} lead={lead} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LeadPipelineCard({ lead }: { lead: LeadRow }) {
  const currentIndex = Math.max(0, LEAD_PIPELINE.findIndex((item) => item.value === lead.status));
  const visibleSteps = LEAD_PIPELINE.filter((item) => item.value !== "LOST");
  const isLost = lead.status === "LOST";

  return (
    <article className="rounded-card border border-border bg-white p-4 shadow-card">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant={leadStatusVariant(lead.status) as any}>{leadStatusLabel(lead.status)}</Badge>
            {lead.visitDate && <Badge variant="blue">Visit: {new Date(lead.visitDate).toLocaleDateString("en-IN")}</Badge>}
          </div>
          <h3 className="text-base font-semibold text-foreground">{lead.propertyTitle || "Property enquiry"}</h3>
          <p className="mt-1 text-sm text-text-secondary">
            {lead.customerName || "Customer"} - {lead.phone || "KrrishJazz managed contact"}
          </p>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-text-secondary">{lead.message}</p>
        </div>
        <div className="shrink-0 text-sm text-text-secondary">
          {new Date(lead.date).toLocaleDateString("en-IN")}
        </div>
      </div>

      <div className="mt-4 rounded-card border border-primary/10 bg-primary-light p-3">
        <p className="text-sm font-semibold text-primary">{leadStatusHint(lead.status)}</p>
        <p className="mt-1 text-xs leading-5 text-text-secondary">KrrishJazz manages callback, visit coordination and deal discussion before brokerage applies on closure.</p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        {visibleSteps.map((step, index) => {
          const complete = !isLost && index <= currentIndex;
          return (
            <div key={step.value}>
              <div className={cn("h-1.5 rounded-pill", complete ? "bg-primary" : "bg-border")} />
              <p className={cn("mt-2 text-xs font-semibold", complete ? "text-primary" : "text-text-secondary")}>{step.label}</p>
            </div>
          );
        })}
      </div>

      {isLost && (
        <div className="mt-3 rounded-btn border border-error/20 bg-error-light px-3 py-2 text-xs font-semibold text-error">
          This lead was marked lost by KrrishJazz ops.
        </div>
      )}
    </article>
  );
}

export function EnquiriesSection() {
  const [enquiries, setEnquiries] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/enquiries?type=sent", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        const items = (data.enquiries || []).map((enquiry: any) => ({
          id: enquiry.id,
          customerName: "",
          phone: "",
          propertyTitle: enquiry.property?.title || "",
          propertySlug: enquiry.property?.slug,
          message: enquiry.message,
          date: enquiry.createdAt,
          status: enquiry.status,
          visitDate: enquiry.visitDate,
        }));
        setEnquiries(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-6">My Enquiries</h2>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : enquiries.length === 0 ? (
        <div className="bg-white rounded-card shadow-card p-8 text-center border border-border">
          <MessageSquare size={48} className="mx-auto text-text-secondary mb-3" />
          <p className="text-text-secondary">You haven&apos;t sent any enquiries yet.</p>
          <Button className="mt-4" onClick={() => (window.location.href = "/properties")}>
            Browse Properties
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((enquiry) => (
            <div key={enquiry.id} className="bg-white rounded-card shadow-card border border-border p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-light rounded-btn shrink-0">
                  <Building2 size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{enquiry.propertyTitle}</p>
                  <p className="text-sm text-text-secondary mt-1 line-clamp-2">{enquiry.message}</p>
                  <p className="text-xs text-text-secondary mt-2">
                    {new Date(enquiry.date).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <Badge variant={leadStatusVariant(enquiry.status) as any}>{leadStatusLabel(enquiry.status)}</Badge>
              </div>
              <div className="mt-4 rounded-card border border-primary/10 bg-primary-light p-3">
                <p className="text-sm font-semibold text-primary">{leadStatusHint(enquiry.status)}</p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">KrrishJazz will coordinate the callback, visit and deal discussion with protected contact handling.</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
