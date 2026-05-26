"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  EmptyState,
  SearchBox,
  SectionHeader,
  Skeleton,
  adminStatusVariant,
  readableStatus,
  formatDateTime,
} from "@/components/admin/admin-primitives";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type RequirementRow = {
  id: string;
  source: "broker" | "buyer";
  description: string;
  propertyType: string;
  locality: string;
  city: string;
  budgetMin: number | null;
  budgetMax: number | null;
  status: string;
  urgency: string;
  createdAt: string;
  broker?: { name: string | null; phone: string; role: string } | null;
  contactName?: string;
  contactPhone?: string;
  userRole?: string;
  matchCount: number;
};

type SourceFilter = "all" | "broker" | "buyer";

const BROKER_STATUS_FILTERS = ["ALL", "ACTIVE", "MATCHING", "IN_DISCUSSION", "CLOSED"] as const;

function formatBudget(row: RequirementRow) {
  if (row.budgetMin != null && row.budgetMax != null) {
    return `${formatPrice(row.budgetMin)} – ${formatPrice(row.budgetMax)}`;
  }
  if (row.budgetMin != null) return `From ${formatPrice(row.budgetMin)}`;
  if (row.budgetMax != null) return `Up to ${formatPrice(row.budgetMax)}`;
  return "—";
}

export function AllRequirementsSection() {
  const [requirements, setRequirements] = useState<RequirementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SourceFilter>("all");
  const [statusFilter, setStatusFilter] = useState<(typeof BROKER_STATUS_FILTERS)[number]>("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 25 });
  const [counts, setCounts] = useState({ broker: 0, buyer: 0, all: 0 });

  const fetchRequirements = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "25",
        source,
      });
      if (source !== "buyer" && statusFilter !== "ALL") params.set("status", statusFilter);
      if (query.trim()) params.set("q", query.trim());

      const res = await fetch(`/api/admin/requirements?${params}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setRequirements([]);
        return;
      }
      setRequirements(data.requirements || []);
      setPagination(data.pagination || { total: 0, totalPages: 1, limit: 25 });
      setCounts(data.counts || { broker: 0, buyer: 0, all: 0 });
    } finally {
      setLoading(false);
    }
  }, [page, query, source, statusFilter]);

  useEffect(() => {
    void fetchRequirements();
  }, [fetchRequirements]);

  useEffect(() => {
    setPage(1);
  }, [query, source, statusFilter]);

  return (
    <div>
      <SectionHeader
        eyebrow="Demand"
        title="All Requirements"
        description="Broker-posted demand and buyer search briefs in one ops view — filter by source, urgency, and contact details."
        right={
          <div className="flex flex-wrap gap-2">
            <Badge variant="blue">{counts.broker} broker</Badge>
            <Badge variant="accent">{counts.buyer} buyer briefs</Badge>
            <Badge variant="default">{counts.all} total</Badge>
          </div>
        }
      />

      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All requirements"],
              ["broker", "Broker requirements"],
              ["buyer", "Buyer search briefs"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setSource(value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                source === value
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-text-secondary hover:border-primary/40 hover:text-primary"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {source !== "buyer" && (
            <div className="flex flex-wrap gap-2">
              {BROKER_STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    statusFilter === status
                      ? "border-primary bg-primary-light text-primary"
                      : "border-border bg-white text-text-secondary hover:border-primary/40"
                  )}
                >
                  {status === "ALL" ? "All statuses" : readableStatus(status)}
                </button>
              ))}
            </div>
          )}
          <SearchBox value={query} onChange={setQuery} placeholder="Search city, type, contact, notes..." />
        </div>
      </div>

      {loading ? (
        <Skeleton />
      ) : requirements.length === 0 ? (
        <EmptyState
          title="No requirements found"
          description="Buyer briefs from search and broker-posted requirements will show up here for matching and follow-up."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-card border border-border bg-white shadow-card">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="border-b border-border bg-surface">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Source</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Requirement</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Location</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Budget</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Contact</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Posted</th>
                </tr>
              </thead>
              <tbody>
                {requirements.map((row) => (
                  <tr key={`${row.source}-${row.id}`} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <Badge variant={row.source === "broker" ? "blue" : "accent"}>
                        {row.source === "broker" ? "Broker" : "Buyer"}
                      </Badge>
                    </td>
                    <td className="max-w-[240px] px-4 py-3">
                      <p className="line-clamp-2 font-medium text-foreground">{row.description}</p>
                      {row.urgency && row.urgency !== "NORMAL" && (
                        <p className="mt-1 text-xs font-semibold uppercase text-accent">{row.urgency}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{row.propertyType}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {[row.locality, row.city].filter(Boolean).join(", ") || row.city}
                    </td>
                    <td className="px-4 py-3 text-foreground">{formatBudget(row)}</td>
                    <td className="px-4 py-3">
                      {row.source === "broker" ? (
                        <>
                          <p className="font-medium text-foreground">{row.broker?.name || "—"}</p>
                          <p className="text-xs text-text-secondary">{row.broker?.phone || "—"}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-foreground">{row.contactName || "Guest"}</p>
                          <p className="text-xs text-text-secondary">{row.contactPhone || "—"}</p>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={adminStatusVariant(row.status) as "default"}>{readableStatus(row.status)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{formatDateTime(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-text-secondary">
              Page {page} of {pagination.totalPages} · {pagination.total} requirements
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} className="mr-1" /> Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
