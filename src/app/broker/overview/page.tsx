"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BellRing,
  Building2,
  MessageCircle,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrokerOverviewSkeleton } from "@/components/broker/broker-skeletons";
import { BrokerPageShell, BrokerMetricsStrip } from "@/components/broker/broker-shell";
import { MetricCard } from "@/components/broker/broker-primitives";
import { useBrokerAuthGuard, useBrokerOverview } from "@/features/broker-exchange";

function formatActivityLabel(eventType: string) {
  const labels: Record<string, string> = {
    MATCH_DRAWER_OPENED: "Opened match drawer",
    PROPERTY_SHARED: "Shared property",
    DEMAND_SHARED: "Shared demand",
    BROKER_WHATSAPP_CLICKED: "WhatsApp contact",
    BROKER_CALL_CLICKED: "Called broker",
    REQUIREMENT_POSTED: "Posted requirement",
  };
  return labels[eventType] || eventType.replace(/_/g, " ").toLowerCase();
}

export default function BrokerOverviewPage() {
  const router = useRouter();
  const { user, loading: authLoading, isReady } = useBrokerAuthGuard();
  const { data, loading } = useBrokerOverview(isReady);

  if (authLoading || !user || !isReady) return null;

  return (
    <BrokerPageShell
      title={`Good ${new Date().getHours() < 12 ? "morning" : "evening"}, ${data?.greeting || "Partner"}`}
      subtitle="Your partner workspace — matches, follow-ups, and demand in one place."
      actions={
        <>
          <Button variant="inverse" size="sm" onClick={() => router.push("/broker/properties")}>
            <Building2 size={15} className="mr-2" />
            Inventory
          </Button>
          <Button variant="inverse-outline" size="sm" onClick={() => router.push("/broker/requirements")}>
            <Plus size={15} className="mr-2" />
            Add demand
          </Button>
          <Button variant="inverse-outline" size="sm" onClick={() => router.push("/broker/crm")}>
            <MessageCircle size={15} className="mr-2" />
            Open CRM
          </Button>
          <Button variant="inverse-outline" size="sm" onClick={() => router.push("/broker/matches")}>
            <Target size={15} className="mr-2" />
            Match desk
          </Button>
        </>
      }
    >
      {loading || !data ? (
        <BrokerOverviewSkeleton />
      ) : (
        <>
          <BrokerMetricsStrip>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MetricCard label="Inventory" value={data.stats.inventoryTotal} tone="default" />
              <MetricCard label="Active demand" value={data.stats.demandTotal} tone="primary" />
              <MetricCard label="Hot matches" value={data.stats.hotMatchCount} tone="accent" />
              <MetricCard label="Follow-ups" value={data.stats.followUpCount} tone="warning" />
            </div>

            {data.profile && data.profile.profileCompletion < 100 && (
              <div className="flex flex-col gap-2 rounded-card border border-primary/20 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Profile strength: {data.profile.profileCompletion}%
                  </p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    Complete bio and service areas to improve trust with network brokers.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push("/broker/profile")}>
                  Complete profile
                </Button>
              </div>
            )}
          </BrokerMetricsStrip>

          <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-2 lg:px-6">
            <section className="rounded-card border border-border bg-white p-4 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Today&apos;s queue</h2>
                  <p className="text-xs text-text-secondary">Listings needing freshness or match action</p>
                </div>
                <BellRing size={18} className="text-warning" />
              </div>
              {data.followUpQueue.length === 0 ? (
                <p className="text-sm text-text-secondary">No follow-ups pending. Great work.</p>
              ) : (
                <ul className="space-y-2">
                  {data.followUpQueue.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/broker/properties?q=${encodeURIComponent(item.title)}`}
                        className="flex items-center justify-between rounded-btn border border-border bg-surface px-3 py-2 transition-colors hover:border-primary/30"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                          <p className="text-xs text-text-secondary">
                            {item.city} · {item.matchingRequirementsCount} matches
                          </p>
                        </div>
                        <ArrowRight size={16} className="shrink-0 text-primary" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-card border border-border bg-white p-4 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Suggested matches</h2>
                  <p className="text-xs text-text-secondary">Highest-scoring property ↔ demand pairs</p>
                </div>
                <TrendingUp size={18} className="text-accent" />
              </div>
              {data.suggestedMatches.length === 0 ? (
                <p className="text-sm text-text-secondary">No strong matches yet. Add demand or widen filters.</p>
              ) : (
                <ul className="space-y-2">
                  {data.suggestedMatches.map((match) => (
                    <li key={`${match.propertyId}-${match.requirementId}`}>
                      <Link
                        href={`/broker/matches?propertyId=${match.propertyId}&requirementId=${match.requirementId}`}
                        className="block rounded-btn border border-border bg-surface px-3 py-2 transition-colors hover:border-accent/40"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant={match.score >= 85 ? "success" : match.score >= 60 ? "accent" : "warning"}>
                            {match.label} · {match.score}%
                          </Badge>
                          <span className="text-xs text-text-secondary">{match.city}</span>
                        </div>
                        <p className="mt-2 truncate text-sm font-semibold text-foreground">{match.propertyTitle}</p>
                        <p className="truncate text-xs text-text-secondary">{match.requirementDescription}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => router.push("/broker/matches")}>
                Open full match desk
              </Button>
            </section>

            <section className="rounded-card border border-border bg-white p-4 shadow-card">
              <h2 className="text-sm font-semibold text-foreground">Recent collaborations</h2>
              <p className="mb-4 text-xs text-text-secondary">Shared property ↔ requirement pairs</p>
              {data.recentCollaborations.length === 0 ? (
                <p className="text-sm text-text-secondary">No collaborations yet. Share a match to start.</p>
              ) : (
                <ul className="space-y-2">
                  {data.recentCollaborations.map((item) => (
                    <li key={item.id} className="rounded-btn border border-border px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="blue">{item.status}</Badge>
                        <span className="text-[10px] text-text-secondary">
                          {new Date(item.updatedAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm font-medium text-foreground">
                        {item.property?.title || "Property"} ↔ {item.requirement?.description || "Requirement"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-card border border-border bg-white p-4 shadow-card">
              <h2 className="text-sm font-semibold text-foreground">Recent activity</h2>
              <p className="mb-4 text-xs text-text-secondary">Your last actions in partner workspace</p>
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-text-secondary">No activity yet today.</p>
              ) : (
                <ul className="space-y-2">
                  {data.recentActivity.map((item) => (
                    <li key={item.id} className="flex items-center justify-between rounded-btn bg-surface px-3 py-2 text-xs">
                      <span className="font-medium text-foreground">{formatActivityLabel(item.eventType)}</span>
                      <span className="text-text-secondary">
                        {new Date(item.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push("/properties")}>
                  Customer view
                </Button>
                <Button variant="accent" size="sm" onClick={() => router.push("/broker/requirements")}>
                  <MessageCircle size={14} className="mr-2" />
                  Add demand
                </Button>
              </div>
            </section>
          </div>
        </>
      )}
    </BrokerPageShell>
  );
}
