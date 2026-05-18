"use client";

import { useState, useEffect } from "react";
import { Clock, Users, UserCheck, MessageSquare, AlertTriangle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardSection() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats").then((r) => r.json()).then(setStats).catch(console.error);
  }, []);

  const cards = stats
    ? [
        { label: "Pending Properties", value: stats.pendingProperties || 0, hint: "Verify first", icon: <Clock size={24} />, color: "text-warning" },
        { label: "Stale Listings", value: stats.staleProperties || 0, hint: "Refresh availability", icon: <AlertTriangle size={24} />, color: "text-error" },
        { label: "Hot Requirements", value: stats.hotRequirements || 0, hint: "Match inventory", icon: <Activity size={24} />, color: "text-accent" },
        { label: "Open Collaborations", value: stats.openCollaborations || 0, hint: "Broker workflow", icon: <Users size={24} />, color: "text-primary" },
        { label: "New Enquiries", value: stats.newEnquiries || 0, hint: "Managed callback", icon: <MessageSquare size={24} />, color: "text-success" },
        { label: "Pending Brokers", value: stats.pendingBrokers || 0, hint: "Trust review", icon: <UserCheck size={24} />, color: "text-primary" },
      ]
    : [];

  return (
    <div>
      <section className="mb-5 overflow-hidden rounded-card border border-primary/10 bg-primary text-white shadow-card">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px] lg:p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-white/70">Admin workspace</p>
            <h1 className="mt-2 text-3xl font-bold">KrrishJazz Control Centre</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/82">
              Keep listing trust, broker onboarding, and buyer callbacks moving with a clean approval queue.
            </p>
          </div>
          <div className="rounded-card bg-white/10 p-4">
            <p className="text-sm font-semibold">Today&apos;s focus</p>
            <div className="mt-3 space-y-2 text-sm text-white/85">
              <p>{stats?.pendingProperties || 0} properties waiting for verification</p>
              <p>{stats?.pendingBrokers || 0} broker applications need review</p>
              <p>{stats?.newEnquiries || 0} new enquiries need managed follow-up</p>
            </div>
          </div>
        </div>
      </section>
      {!stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-card border border-border p-6 animate-pulse">
              <div className="h-6 bg-surface rounded w-20 mb-2" />
              <div className="h-8 bg-surface rounded w-12" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-card border border-border bg-white p-5 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">{card.label}</p>
                <span className={cn("rounded-full bg-surface p-2", card.color)}>{card.icon}</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{card.value}</p>
              <p className="mt-1 text-xs text-text-secondary">{card.hint}</p>
            </div>
          ))}
        </div>
      )}
      {stats && (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <OpsQueueCard
            title="Verification Queue"
            value={stats.pendingProperties || 0}
            description="Properties waiting for KrrishJazz trust check before going live."
            action="Review properties"
          />
          <OpsQueueCard
            title="Freshness Queue"
            value={stats.staleProperties || 0}
            description="Live inventory that needs owner/broker availability reconfirmation."
            action="Refresh listings"
          />
          <OpsQueueCard
            title="Demand Queue"
            value={stats.activeRequirements || 0}
            description="Active requirements that should be matched against network inventory."
            action="Open matches"
          />
        </div>
      )}
    </div>
  );
}

function OpsQueueCard({
  title,
  value,
  description,
  action,
}: {
  title: string;
  value: number;
  description: string;
  action: string;
}) {
  return (
    <div className="rounded-card border border-border bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
        </div>
        <span className="rounded-pill bg-primary-light px-3 py-1 text-sm font-semibold text-primary">{value}</span>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-text-secondary">{action}</p>
    </div>
  );
}
