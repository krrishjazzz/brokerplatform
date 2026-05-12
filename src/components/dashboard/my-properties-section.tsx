"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Home, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import type { PropertyRow } from "./types";

export function MyPropertiesSection() {
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

  const statusVariant = (s: string) => {
    if (s === "LIVE" || s === "APPROVED" || s === "ACTIVE" || s === "AVAILABLE") return "success";
    if (s === "PENDING_REVIEW" || s === "PENDING" || s === "ON_HOLD") return "warning";
    if (s === "REJECTED" || s === "CLOSED") return "error";
    return "default";
  };

  const statusLabel = (s: string) => {
    if (s === "PENDING_REVIEW") return "Pending Review";
    if (s === "ON_HOLD") return "On Hold";
    return s.replaceAll("_", " ");
  };

  const getFreshnessSignal = (property: PropertyRow) => {
    const latest = property.latestFreshness;
    if (latest?.availabilityStatus === "CLOSED") return { label: "Closed", variant: "error" as const, hint: latest.note || "Marked closed" };
    if (latest?.availabilityStatus === "ON_HOLD") return { label: "On hold", variant: "warning" as const, hint: latest.note || "Paused by owner/broker" };
    if (!latest) return { label: "Needs check", variant: "warning" as const, hint: "No availability confirmation yet" };
    if (latest.expiresAt && new Date(latest.expiresAt).getTime() < Date.now()) {
      return { label: "Stale", variant: "error" as const, hint: "Availability expired" };
    }
    if (latest.availabilityStatus === "AVAILABLE") {
      return { label: "Fresh", variant: "success" as const, hint: `Confirmed ${new Date(latest.confirmedAt || property.updatedAt || Date.now()).toLocaleDateString("en-IN")}` };
    }
    return { label: statusLabel(latest.availabilityStatus), variant: "default" as const, hint: latest.note || "Awaiting verification" };
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
      setNotice({ type: "success", text: "Listing status updated." });
    } catch {
      setNotice({ type: "error", text: "Failed to update listing" });
    } finally {
      setRefreshingSlug(null);
    }
  };

  const getListingHealthScore = (property: PropertyRow) => {
    let score = 24;
    if ((property.images?.length || 0) >= 3 || property.coverImage) score += 18;
    if (property.status === "LIVE") score += 18;
    if (property.latestFreshness?.availabilityStatus === "AVAILABLE") score += 16;
    if (property.locality && property.city) score += 10;
    if (property._count?.enquiries) score += Math.min(14, property._count.enquiries * 3);
    return Math.min(96, score);
  };

  const getPropertyId = (id: string) => id.slice(-8).toUpperCase();

  const getDuration = (value?: string) => {
    if (!value) return "Posted recently";
    const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24)));
    if (days === 0) return "Posted today";
    if (days === 1) return "Posted 1 day ago";
    return `Posted ${days} days ago`;
  };

  return (
    <div>
      <div className="mb-5">
        <p className="mb-2 text-sm font-medium text-foreground">Welcome to your dashboard</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Your Listings</h2>
            <p className="text-sm text-text-secondary mt-1">Manage free listings, verification, freshness and responses.</p>
          </div>
          <Button onClick={() => window.location.href = "/dashboard?tab=post"}>Post Property</Button>
        </div>
      </div>
      {notice && (
        <div className={cn("mb-4 rounded-card border px-4 py-3 text-sm font-medium", notice.type === "success" ? "border-success/20 bg-success-light text-success" : "border-error/20 bg-error-light text-error")}>
          {notice.text}
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-card shadow-card p-8 text-center border border-border">
          <Home size={48} className="mx-auto text-text-secondary mb-3" />
          <p className="text-text-secondary">You haven&apos;t posted any properties yet.</p>
          <Button className="mt-5" onClick={() => window.location.href = "/dashboard?tab=post"}>Post your first property</Button>
        </div>
      ) : (
        <div className="space-y-5">
          <OwnerActivityTimeline properties={properties} />
          <VisibilityAnalytics properties={properties} />
          {properties.map((p) => {
            const freshness = getFreshnessSignal(p);
            const listingHealth = getListingHealthScore(p);
            const image = p.coverImage || p.images?.[0];
            const pendingActions = [
              p.status !== "LIVE" ? "Awaiting verification" : null,
              freshness.variant !== "success" ? "Confirm availability" : null,
              listingHealth < 70 ? "Improve listing health" : null,
            ].filter(Boolean);

            return (
              <article key={p.id} className="overflow-hidden rounded-card border border-border bg-white shadow-card">
                <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
                  <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-btn bg-surface lg:w-52">
                    {image ? <img src={image} alt={p.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-primary"><Building2 size={34} /></div>}
                    <span className="absolute left-2 top-2 rounded-sm bg-white px-2 py-0.5 text-[11px] font-bold text-foreground shadow-sm">
                      {p.status === "LIVE" ? "Verified" : "Not Verified"}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant(p.listingStatus || p.status)}>{statusLabel(p.listingStatus || p.status)}</Badge>
                      <Badge variant={freshness.variant}>{freshness.label}</Badge>
                    </div>
                    <h3 className="line-clamp-1 text-lg font-bold text-foreground">{p.title}</h3>
                    <p className="mt-1 text-sm text-text-secondary">{p.locality ? `${p.locality}, ` : ""}{p.city}</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div><p className="text-xs text-text-secondary">Price</p><p className="font-semibold text-foreground">{formatPrice(p.price)}</p></div>
                      <div><p className="text-xs text-text-secondary">Property ID</p><p className="font-semibold text-foreground">{getPropertyId(p.id)}</p></div>
                      <div><p className="text-xs text-text-secondary">Duration</p><p className="font-semibold text-foreground">{getDuration(p.createdAt)}</p></div>
                    </div>
                  </div>

                  <div className="w-full shrink-0 rounded-card border border-border bg-surface p-4 lg:w-64">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-bold text-foreground">Listing Health</p>
                      <p className="text-xl font-bold text-primary">{listingHealth}%</p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-pill bg-border">
                      <div className="h-full rounded-pill bg-success" style={{ width: `${listingHealth}%` }} />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-foreground">{pendingActions.length || 0} pending action{pendingActions.length === 1 ? "" : "s"}</p>
                    <div className="mt-3 space-y-2">
                      <div className="rounded-btn bg-primary-light px-3 py-2">
                        <span className="text-xs font-semibold text-foreground">Free listing active</span>
                        <p className="mt-1 text-[11px] leading-4 text-text-secondary">One month brokerage applies only after successful closure.</p>
                      </div>
                      <div className="flex items-center justify-between rounded-btn bg-error-light px-3 py-2">
                        <span className="text-xs font-semibold text-foreground">Verify your property</span>
                        <button onClick={() => updateFreshness(p.slug, "AVAILABLE")} className="text-xs font-bold text-accent">Self Verify</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-white px-4 py-3">
                  <div className="text-sm text-text-secondary">
                    <strong className="text-foreground">{p._count?.enquiries ?? 0}</strong> responses on this posting
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" loading={refreshingSlug === p.slug} onClick={() => updateFreshness(p.slug, "AVAILABLE")}>Confirm</Button>
                    <Button variant="ghost" size="sm" loading={refreshingSlug === p.slug} onClick={() => updateFreshness(p.slug, "ON_HOLD")}>Hold</Button>
                    <Button variant="ghost" size="sm" loading={refreshingSlug === p.slug} onClick={() => updateFreshness(p.slug, "CLOSED")}>Closed</Button>
                    <Button size="sm" onClick={() => window.location.href = `/properties/${p.slug}`}>Manage Listing</Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OwnerActivityTimeline({ properties }: { properties: PropertyRow[] }) {
  const steps = useMemo(() => {
    const liveCount = properties.filter((property) => property.status === "LIVE").length;
    const enquiryCount = properties.reduce((total, property) => total + (property._count?.enquiries || 0), 0);
    const freshCount = properties.filter((property) => property.latestFreshness?.availabilityStatus === "AVAILABLE").length;

    return [
      { title: "Listings submitted", desc: `${properties.length} propert${properties.length === 1 ? "y" : "ies"} in your workspace`, active: properties.length > 0 },
      { title: "KrrishJazz verification", desc: `${liveCount} live listing${liveCount === 1 ? "" : "s"} after review`, active: liveCount > 0 },
      { title: "Customer interest", desc: `${enquiryCount} managed response${enquiryCount === 1 ? "" : "s"} captured`, active: enquiryCount > 0 },
      { title: "Freshness check", desc: `${freshCount} listing${freshCount === 1 ? "" : "s"} recently confirmed`, active: freshCount > 0 },
    ];
  }, [properties]);

  return (
    <section className="rounded-card border border-border bg-white p-5 shadow-card">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-semibold text-foreground">KrrishJazz activity timeline</h3>
          <p className="text-sm text-text-secondary">A simple view of what is happening after you list.</p>
        </div>
        <Badge variant="blue">Owner view</Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step.title} className={cn("rounded-card border p-4", step.active ? "border-primary/20 bg-primary-light" : "border-border bg-surface")}>
            <div className={cn("mb-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold", step.active ? "bg-primary text-white" : "bg-white text-text-secondary")}>
              {index + 1}
            </div>
            <p className="text-sm font-semibold text-foreground">{step.title}</p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function VisibilityAnalytics({ properties }: { properties: PropertyRow[] }) {
  const visibilityCounts = useMemo(
    () =>
      [
        { label: "Customer + Broker", value: "FULL_VISIBILITY" },
        { label: "Customers only", value: "DIRECT_CUSTOMERS_ONLY" },
        { label: "Broker network", value: "BROKER_NETWORK_ONLY" },
        { label: "Private", value: "PRIVATE" },
      ].map((item) => ({
        ...item,
        count: properties.filter((property) => property.visibilityType === item.value).length,
      })),
    [properties]
  );

  const staleCount = useMemo(
    () =>
      properties.filter((property) => {
        const updatedAt = property.latestFreshness?.confirmedAt || property.updatedAt || property.createdAt;
        if (!updatedAt) return true;
        return Date.now() - new Date(updatedAt).getTime() > 14 * 24 * 60 * 60 * 1000;
      }).length,
    [properties]
  );

  return (
    <section className="rounded-card border border-border bg-white p-5 shadow-card">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Visibility and freshness analytics</h3>
          <p className="text-sm text-text-secondary">See how your inventory is distributed and which listings need reconfirmation.</p>
        </div>
        <Badge variant={staleCount ? "warning" : "success"}>{staleCount} stale</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visibilityCounts.map((item) => (
          <div key={item.value} className="rounded-btn border border-border bg-surface p-3">
            <p className="text-2xl font-bold text-primary">{item.count}</p>
            <p className="mt-1 text-xs font-semibold text-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
