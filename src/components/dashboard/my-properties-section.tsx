"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Home, Loader2 } from "lucide-react";
import { useDashboardPath } from "@/components/dashboard/dashboard-path-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getOwnerPropertyStatusLabel,
  getOwnerPropertyStatusVariant,
} from "@/lib/owner-dashboard";
import { cn, formatPrice } from "@/lib/utils";
import type { PropertyRow } from "./types";

export function MyPropertiesSection() {
  const dashboardPath = useDashboardPath();
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingSlug, setRefreshingSlug] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchMyProperties = useCallback(() => {
    setLoading(true);
    fetch("/api/properties?postedBy=me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setProperties(d.properties || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMyProperties();
  }, [fetchMyProperties]);

  const getFreshnessLabel = (property: PropertyRow) => {
    const latest = property.latestFreshness;
    if (latest?.availabilityStatus === "CLOSED") return "Closed";
    if (latest?.availabilityStatus === "ON_HOLD") return "Paused";
    if (!latest) return "Needs check";
    if (latest.expiresAt && new Date(latest.expiresAt).getTime() < Date.now()) return "Stale";
    if (latest.availabilityStatus === "AVAILABLE") return "Fresh";
    return "Needs check";
  };

  const getLastUpdated = (property: PropertyRow) => {
    const value = property.updatedAt || property.latestFreshness?.confirmedAt || property.createdAt;
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const updateFreshness = async (slug: string, listingStatus: "AVAILABLE" | "ON_HOLD" | "CLOSED") => {
    setRefreshingSlug(slug);
    try {
      const res = await fetch(`/api/properties/${slug}/freshness`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ listingStatus }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setNotice({ type: "error", text: err?.error || "Failed to update listing" });
        return;
      }

      await fetchMyProperties();
      setNotice({ type: "success", text: "Listing updated." });
    } catch {
      setNotice({ type: "error", text: "Failed to update listing" });
    } finally {
      setRefreshingSlug(null);
    }
  };

  const emptyStateCopy = (status?: string) => {
    if (status === "PENDING_REVIEW" || status === "PENDING") {
      return {
        title: "Your listing is under review",
        desc: "Usually reviewed within one business day.",
      };
    }
    if (status === "REJECTED") {
      return {
        title: "Needs changes before going live",
        desc: "Reason may include unclear photos, incomplete location, or missing price.",
      };
    }
    return null;
  };

  return (
    <div>
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">My Properties</h2>
          <p className="mt-1 text-sm text-text-secondary">
            KrrishJazz verifies listings and manages buyer contact for you.
          </p>
        </div>
        <Button onClick={() => (window.location.href = `${dashboardPath}?tab=post`)}>Post Property</Button>
      </div>

      {notice && (
        <div
          className={cn(
            "mb-4 rounded-xl border px-4 py-3 text-sm font-medium",
            notice.type === "success"
              ? "border-success/20 bg-success-light text-success"
              : "border-error/20 bg-error-light text-error"
          )}
        >
          {notice.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : properties.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-card">
          <Home size={48} className="mx-auto mb-3 text-text-secondary" />
          <p className="font-medium text-foreground">List your first property</p>
          <p className="mt-2 text-sm text-text-secondary">
            KrrishJazz will verify and manage enquiries for you.
          </p>
          <Button className="mt-5" onClick={() => (window.location.href = `${dashboardPath}?tab=post`)}>
            Post your first property
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((p) => {
            const image = p.coverImage || p.images?.[0];
            const statusLabel = getOwnerPropertyStatusLabel(p.status, p.listingStatus);
            const statusVariant = getOwnerPropertyStatusVariant(p.status, p.listingStatus);
            const freshness = getFreshnessLabel(p);
            const enquiries = p._count?.enquiries ?? 0;
            const reviewCopy = emptyStateCopy(p.status);

            return (
              <article
                key={p.id}
                className="overflow-hidden rounded-2xl border border-border bg-white shadow-card"
              >
                <div className="flex flex-col gap-4 p-4 lg:flex-row">
                  <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-surface lg:h-32 lg:w-40">
                    {image ? (
                      <img src={image} alt={p.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-primary">
                        <Building2 size={32} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant}>{statusLabel}</Badge>
                      <Badge variant="default">{freshness}</Badge>
                    </div>
                    <h3 className="line-clamp-1 text-lg font-semibold text-foreground">{p.title}</h3>
                    <p className="mt-0.5 text-sm text-text-secondary">
                      {p.locality ? `${p.locality}, ` : ""}
                      {p.city}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:grid-cols-6">
                      <div>
                        <p className="text-xs text-text-secondary">Price</p>
                        <p className="font-semibold text-foreground">{formatPrice(p.price)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Enquiries</p>
                        <p className="font-semibold text-foreground">{enquiries}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Visits</p>
                        <p className="font-semibold text-foreground">0</p>
                      </div>
                      <div className="col-span-2 sm:col-span-2 lg:col-span-3">
                        <p className="text-xs text-text-secondary">Last updated</p>
                        <p className="font-semibold text-foreground">{getLastUpdated(p)}</p>
                      </div>
                    </div>

                    {reviewCopy && (
                      <div
                        className={cn(
                          "mt-3 rounded-xl border px-3 py-2 text-xs",
                          p.status === "REJECTED"
                            ? "border-error/20 bg-error-light text-error"
                            : "border-warning/20 bg-warning-light text-foreground"
                        )}
                      >
                        <p className="font-semibold">{reviewCopy.title}</p>
                        <p className="mt-1 text-text-secondary">{reviewCopy.desc}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-border bg-surface/50 px-4 py-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = `/properties/${p.slug}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={refreshingSlug === p.slug}
                    onClick={() => updateFreshness(p.slug, "AVAILABLE")}
                  >
                    Refresh Availability
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => (window.location.href = `${dashboardPath}?tab=enquiries`)}
                  >
                    View Enquiries
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={refreshingSlug === p.slug}
                    onClick={() => updateFreshness(p.slug, "ON_HOLD")}
                  >
                    Pause Listing
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={refreshingSlug === p.slug}
                    onClick={() => updateFreshness(p.slug, "CLOSED")}
                  >
                    Mark as Closed
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
