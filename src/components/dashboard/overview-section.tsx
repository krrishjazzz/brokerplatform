"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ClipboardList, Clock, Loader2, Phone, PlusCircle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { cn, formatPrice } from "@/lib/utils";
import type { DashboardRequirement, DashboardStats, PropertyRow } from "./types";

export function OverviewSection() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ownedProperties, setOwnedProperties] = useState<PropertyRow[]>([]);
  const [requirements, setRequirements] = useState<DashboardRequirement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadWorkDesk() {
      if (!user) return;
      setLoading(true);
      try {
        const statsReq = fetch("/api/dashboard/stats", { credentials: "include" }).then((r) => r.json());
        const propertiesReq =
          user.role === "CUSTOMER"
            ? Promise.resolve({ properties: [] })
            : fetch("/api/properties?postedBy=me", { credentials: "include" }).then((r) => r.json()).catch(() => ({ properties: [] }));
        const requirementsReq =
          user.role === "BROKER" && user.brokerStatus === "APPROVED"
            ? fetch("/api/broker/requirements", { credentials: "include" }).then((r) => r.json()).catch(() => ({ requirements: [] }))
            : Promise.resolve({ requirements: [] });

        const [statsData, propertiesData, requirementsData] = await Promise.all([statsReq, propertiesReq, requirementsReq]);
        if (!mounted) return;

        setStats(statsData);
        setOwnedProperties(propertiesData.properties || []);
        setRequirements(requirementsData.requirements || []);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadWorkDesk();
    return () => {
      mounted = false;
    };
  }, [user]);

  const dashboardSignals = useMemo(() => {
    const liveProperties = stats?.liveProperties ?? ownedProperties.filter((property) => property.status === "LIVE").length;
    const pendingReview = ownedProperties.filter((property) => property.status === "PENDING_REVIEW" || property.status === "PENDING").length;
    const onHold = ownedProperties.filter((property) => property.listingStatus === "ON_HOLD").length;
    const staleListings = ownedProperties.filter((property) => {
      if (!property.updatedAt) return false;
      if (property.status !== "LIVE" && property.listingStatus !== "AVAILABLE") return false;
      const days = Math.floor((Date.now() - new Date(property.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
      return days >= 10;
    }).length;
    const matchedDemand = requirements.filter((requirement) => requirement.matchedPropertiesCount > 0).length;
    const totalRequirementMatches = requirements.reduce((sum, requirement) => sum + requirement.matchedPropertiesCount, 0);
    const freshDemand = requirements.filter((requirement) => {
      const days = Math.floor((Date.now() - new Date(requirement.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return days < 7;
    }).length;

    return {
      totalProperties: stats?.totalProperties ?? ownedProperties.length,
      liveProperties,
      totalLeads: stats?.totalLeads ?? 0,
      newLeads: stats?.newLeads ?? 0,
      pendingReview,
      onHold,
      staleListings,
      activeDemand: requirements.length,
      matchedDemand,
      totalRequirementMatches,
      freshDemand,
    };
  }, [ownedProperties, requirements, stats]);

  const {
    totalProperties,
    liveProperties,
    totalLeads,
    newLeads,
    pendingReview,
    onHold,
    staleListings,
    activeDemand,
    matchedDemand,
    totalRequirementMatches,
    freshDemand,
  } = dashboardSignals;

  const metrics = [
    { label: "Responses", value: newLeads, hint: "New buyer interest", icon: <Phone size={22} />, tone: "border-warning/20 bg-warning-light text-warning" },
    { label: "Live Listings", value: liveProperties, hint: `${staleListings} need refresh`, icon: <Building2 size={22} />, tone: "border-success/20 bg-success-light text-success" },
    { label: "Pending Actions", value: pendingReview + onHold + staleListings, hint: "Verification and freshness", icon: <ClipboardList size={22} />, tone: "border-error/20 bg-error-light text-error" },
    { label: "Broker Matches", value: totalRequirementMatches, hint: "Potential demand matches", icon: <TrendingUp size={22} />, tone: "border-primary/20 bg-primary-light text-primary" },
  ];

  const workQueue = [
    {
      title: `${newLeads} response${newLeads === 1 ? "" : "s"} waiting`,
      desc: "Review interested buyers and respond quickly.",
      icon: <Phone size={18} />,
      cta: "Open leads",
      href: "/dashboard?tab=leads",
      tone: "text-warning bg-warning/10 border-warning/20",
    },
    {
      title: `${staleListings} listing${staleListings === 1 ? "" : "s"} need freshness`,
      desc: "Refresh availability before brokers or users ask.",
      icon: <Clock size={18} />,
      cta: "Review inventory",
      href: "/dashboard?tab=properties",
      tone: "text-primary bg-primary-light border-primary/20",
    },
    {
      title: `${activeDemand} active requirement${activeDemand === 1 ? "" : "s"}`,
      desc: user?.role === "BROKER" ? "Match demand against network inventory." : "Relevant broker demand can improve listing movement.",
      icon: <ClipboardList size={18} />,
      cta: user?.role === "BROKER" ? "Open demand" : "Post inventory",
      href: user?.role === "BROKER" ? "/broker/requirements" : "/dashboard?tab=post",
      tone: "text-accent bg-accent/10 border-accent/20",
    },
    {
      title: "Add fresh supply",
      desc: "New inventory keeps the network alive.",
      icon: <PlusCircle size={18} />,
      cta: "Post property",
      href: "/dashboard?tab=post",
      tone: "text-success bg-success/10 border-success/20",
    },
  ];

  return (
    <div className="space-y-5">
      {loading ? (
        <div className="flex items-center justify-center rounded-card border border-border bg-white py-16 shadow-card">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <section className="overflow-hidden rounded-card border border-border bg-white shadow-card">
            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="p-6 text-foreground">
                <div className="mb-4 inline-flex items-center gap-2 rounded-pill border border-primary/15 bg-primary-light px-3 py-1.5 text-xs font-semibold text-primary">
                  <Clock size={14} />
                  Welcome to your dashboard
                </div>
                <h2 className="text-3xl font-semibold text-foreground">Your Listings</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                  Manage free listings, responses, freshness, and KrrishJazz-assisted deal closure in one clean owner workspace.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button onClick={() => router.push("/dashboard?tab=post")}>
                    <PlusCircle size={16} className="mr-2" />
                    Post Property
                  </Button>
                  {user?.role === "BROKER" && (
                    <Button variant="outline" onClick={() => router.push("/broker/requirements")}>
                      <ClipboardList size={16} className="mr-2" />
                      Open Demand
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-primary-light p-4">
                <MiniOpsStat label="Total inventory" value={totalProperties} />
                <MiniOpsStat label="Managed leads" value={totalLeads} />
                <MiniOpsStat label="Pending review" value={pendingReview} />
                <MiniOpsStat label="On hold" value={onHold} />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-card border border-border bg-white p-5 shadow-card transition-shadow hover:shadow-lift">
                <div className="mb-4 flex items-center justify-between">
                  <div className={cn("rounded-btn border p-2.5", metric.tone)}>{metric.icon}</div>
                  <Badge variant="default">Today</Badge>
                </div>
                <p className="text-2xl font-bold text-foreground">{metric.value.toLocaleString("en-IN")}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{metric.label}</p>
                <p className="mt-1 text-xs text-text-secondary">{metric.hint}</p>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-card border border-border bg-white p-5 shadow-card">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">Action Queue</h3>
                  <p className="mt-1 text-sm text-text-secondary">The next actions that create deal movement.</p>
                </div>
                <Badge variant="blue">Operational</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {workQueue.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => router.push(item.href)}
                    className="group rounded-card border border-border bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:shadow-card"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className={cn("rounded-btn border p-2", item.tone)}>{item.icon}</div>
                      <span className="text-xs font-semibold text-primary group-hover:text-accent">{item.cta}</span>
                    </div>
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-text-secondary">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-card border border-border bg-white p-5 shadow-card">
              <div className="mb-4">
                <h3 className="font-semibold text-foreground">Network Pulse</h3>
                <p className="mt-1 text-sm text-text-secondary">Signals that keep the work moving.</p>
              </div>
              <div className="space-y-3">
                <PulseRow label="Fresh demand" value={freshDemand} variant="success" />
                <PulseRow label="Matched demand" value={matchedDemand} variant="accent" />
                <PulseRow label="Inventory health" value={liveProperties} variant="blue" />
                <PulseRow label="Follow-up load" value={newLeads} variant="warning" />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-card border border-border bg-white p-5 shadow-card">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">Inventory Watchlist</h3>
                  <p className="mt-1 text-sm text-text-secondary">Refresh, hold, or close listings before they become stale.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push("/dashboard?tab=properties")}>
                  Review
                </Button>
              </div>
              <div className="space-y-3">
                {ownedProperties.slice(0, 4).map((property) => (
                  <div key={property.id} className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{property.title}</p>
                      <p className="text-xs text-text-secondary">{property.city} - {property.propertyType}</p>
                    </div>
                    <Badge variant={property.status === "LIVE" ? "success" : property.status === "PENDING_REVIEW" ? "warning" : "default"}>
                      {(property.listingStatus || property.status).replaceAll("_", " ")}
                    </Badge>
                  </div>
                ))}
                {ownedProperties.length === 0 && (
                  <EmptyWorkHint icon={<Building2 size={22} />} title="No inventory yet" desc="Post your first property to start creating network supply." action="Post property" onClick={() => router.push("/dashboard?tab=post")} />
                )}
              </div>
            </div>

            <div className="rounded-card border border-border bg-white p-5 shadow-card">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">Demand Snapshot</h3>
                  <p className="mt-1 text-sm text-text-secondary">Requirements brokers can act on now.</p>
                </div>
                {user?.role === "BROKER" && (
                  <Button variant="outline" size="sm" onClick={() => router.push("/broker/requirements")}>
                    Open
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {requirements.slice(0, 4).map((requirement) => (
                  <div key={requirement.id} className="rounded-card border border-border bg-surface p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-semibold text-foreground">{requirement.description}</p>
                        <p className="mt-1 text-xs text-text-secondary">
                          {requirement.city} - {requirement.propertyType} - {formatRequirementBudget(requirement)}
                        </p>
                      </div>
                      <Badge variant={requirement.matchedPropertiesCount > 0 ? "accent" : "warning"}>
                        {requirement.matchedPropertiesCount} matches
                      </Badge>
                    </div>
                  </div>
                ))}
                {requirements.length === 0 && (
                  <EmptyWorkHint icon={<ClipboardList size={22} />} title="No demand loaded" desc="Broker requirements will appear here as live demand builds." action={user?.role === "BROKER" ? "Add demand" : "Post inventory"} onClick={() => router.push(user?.role === "BROKER" ? "/broker/requirements" : "/dashboard?tab=post")} />
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function MiniOpsStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-border bg-white p-4 shadow-sm">
      <p className="text-xl font-bold text-foreground">{value.toLocaleString("en-IN")}</p>
      <p className="mt-1 text-xs font-medium text-text-secondary">{label}</p>
    </div>
  );
}

function PulseRow({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "success" | "accent" | "blue" | "warning";
}) {
  const tone = {
    success: "bg-success-light text-success",
    accent: "bg-accent-light text-accent",
    blue: "bg-primary-light text-primary",
    warning: "bg-warning/10 text-warning",
  }[variant];

  return (
    <div className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface p-3">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className={cn("rounded-pill px-2.5 py-1 text-xs font-bold", tone)}>
        {value.toLocaleString("en-IN")}
      </span>
    </div>
  );
}

function EmptyWorkHint({
  icon,
  title,
  desc,
  action,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-card border border-dashed border-border bg-surface p-5 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
        {icon}
      </div>
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm leading-5 text-text-secondary">{desc}</p>
      <Button variant="secondary" size="sm" className="mt-4" onClick={onClick}>
        {action}
      </Button>
    </div>
  );
}

function formatRequirementBudget(requirement: DashboardRequirement) {
  if (requirement.budgetMin && requirement.budgetMax) {
    return `${formatPrice(requirement.budgetMin)} - ${formatPrice(requirement.budgetMax)}`;
  }
  if (requirement.budgetMin) return `From ${formatPrice(requirement.budgetMin)}`;
  if (requirement.budgetMax) return `Up to ${formatPrice(requirement.budgetMax)}`;
  return "Budget flexible";
}
