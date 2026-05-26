"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Eye } from "lucide-react";
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
import { PropertyOpsModal } from "@/components/admin/property-ops-modal";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type AdminProperty = {
  id: string;
  slug: string;
  title: string;
  propertyType: string;
  listingType: string;
  city: string;
  locality: string;
  price: number;
  status: string;
  createdAt: string;
  postedBy: { name: string | null; phone: string; role: string } | null;
  enquiryCount: number;
};

const STATUS_FILTERS = ["ALL", "LIVE", "PENDING_REVIEW", "REJECTED", "SOLD", "DRAFT"] as const;

export function AllPropertiesSection() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [opsPropertyId, setOpsPropertyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 25 });
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "25",
        status: statusFilter,
      });
      if (query.trim()) params.set("q", query.trim());

      const res = await fetch(`/api/admin/properties?${params}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setProperties([]);
        return;
      }
      setProperties(data.properties || []);
      setPagination(data.pagination || { total: 0, totalPages: 1, limit: 25 });
      setStatusCounts(data.statusCounts || {});
    } finally {
      setLoading(false);
    }
  }, [page, query, statusFilter]);

  useEffect(() => {
    void fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  const totalLive = statusCounts.LIVE || 0;
  const totalPending = statusCounts.PENDING_REVIEW || 0;

  return (
    <div>
      <SectionHeader
        eyebrow="Inventory"
        title="All Properties"
        description="Full marketplace inventory across every status — search, filter, and open ops controls like a listing CRM."
        right={
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">{totalLive} live</Badge>
            <Badge variant="warning">{totalPending} pending</Badge>
            <Badge variant="default">{pagination.total} total</Badge>
          </div>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                statusFilter === status
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-text-secondary hover:border-primary/40 hover:text-primary"
              )}
            >
              {status === "ALL" ? "All" : readableStatus(status)}
              {status !== "ALL" && statusCounts[status] != null && (
                <span className="ml-1 opacity-80">({statusCounts[status]})</span>
              )}
            </button>
          ))}
        </div>
        <SearchBox value={query} onChange={setQuery} placeholder="Search title, city, owner phone..." />
      </div>

      {loading ? (
        <Skeleton />
      ) : properties.length === 0 ? (
        <EmptyState
          title="No properties found"
          description="Try another status filter or search term. All cities are included in this admin view."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-card border border-border bg-white shadow-card">
            <table className="w-full min-w-[960px] text-sm">
              <thead className="border-b border-border bg-surface">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Property</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Location</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Price</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Owner</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Enquiries</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Updated</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="max-w-[220px] px-4 py-3">
                      <p className="truncate font-medium text-foreground">{p.title}</p>
                      <p className="truncate text-xs text-text-secondary">{p.listingType}</p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{p.propertyType}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {[p.locality, p.city].filter(Boolean).join(", ") || p.city}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{p.postedBy?.name || "—"}</p>
                      <p className="text-xs text-text-secondary">{p.postedBy?.phone || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={adminStatusVariant(p.status) as "default"}>{readableStatus(p.status)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{p.enquiryCount}</td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{formatDateTime(p.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setOpsPropertyId(p.id)}>
                          <Eye size={14} className="mr-1" /> Ops
                        </Button>
                        {p.status === "LIVE" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(`/properties/${p.slug}`, "_blank")}
                          >
                            <ExternalLink size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-text-secondary">
              Page {pagination.totalPages ? page : 0} of {pagination.totalPages} · {pagination.total} properties
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

      <PropertyOpsModal
        propertyId={opsPropertyId}
        isOpen={!!opsPropertyId}
        onClose={() => setOpsPropertyId(null)}
        onChanged={fetchProperties}
      />
    </div>
  );
}
