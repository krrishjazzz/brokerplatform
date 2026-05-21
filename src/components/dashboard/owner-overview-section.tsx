"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Calendar,
  Camera,
  Clock,
  Loader2,
  MessageSquare,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardPath } from "@/components/dashboard/dashboard-path-context";
import { getOwnerPropertyDisplayStatus, OWNER_TRUST_LINES } from "@/lib/owner-dashboard";
import type { DashboardStats, PropertyRow } from "./types";

type OwnerStats = DashboardStats & {
  pendingReview?: number;
  visitRequests?: number;
};

export function OwnerOverviewSection() {
  const router = useRouter();
  const dashboardPath = useDashboardPath();
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [statsRes, propsRes] = await Promise.all([
          fetch("/api/dashboard/stats", { credentials: "include" }).then((r) => r.json()),
          fetch("/api/properties?postedBy=me", { credentials: "include" }).then((r) => r.json()),
        ]);
        if (!mounted) return;
        setStats(statsRes);
        setProperties(propsRes.properties || []);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const signals = useMemo(() => {
    const live = stats?.liveProperties ?? properties.filter((p) => p.status === "LIVE").length;
    const pendingReview =
      stats?.pendingReview ??
      properties.filter((p) => p.status === "PENDING_REVIEW" || p.status === "PENDING").length;
    const newEnquiries = stats?.newLeads ?? 0;
    const visitRequests = stats?.visitRequests ?? 0;

    const needsPhotos = properties.filter((p) => !p.coverImage && !(p.images?.length)).length;
    const needsFreshness = properties.filter((p) => {
      if (p.status !== "LIVE") return false;
      const latest = p.latestFreshness;
      if (!latest) return true;
      if (latest.expiresAt && new Date(latest.expiresAt).getTime() < Date.now()) return true;
      return latest.availabilityStatus !== "AVAILABLE";
    }).length;

    const todaysActions = [
      needsPhotos > 0 && {
        title: "Complete missing photos",
        desc: `${needsPhotos} listing${needsPhotos === 1 ? "" : "s"} need clearer images.`,
        href: `${dashboardPath}?tab=properties`,
        icon: Camera,
      },
      needsFreshness > 0 && {
        title: "Confirm availability",
        desc: `${needsFreshness} live listing${needsFreshness === 1 ? "" : "s"} need a freshness check.`,
        href: `${dashboardPath}?tab=properties`,
        icon: RefreshCw,
      },
      newEnquiries > 0 && {
        title: "Respond to new enquiries",
        desc: `${newEnquiries} new buyer interest — KrrishJazz is coordinating callbacks.`,
        href: `${dashboardPath}?tab=enquiries`,
        icon: MessageSquare,
      },
      pendingReview > 0 && {
        title: "Listing under review",
        desc: "Usually reviewed within one business day.",
        href: `${dashboardPath}?tab=properties`,
        icon: Clock,
      },
    ].filter(Boolean) as {
      title: string;
      desc: string;
      href: string;
      icon: typeof Camera;
    }[];

    if (properties.length === 0) {
      todaysActions.unshift({
        title: "List your first property",
        desc: "KrrishJazz will verify and manage enquiries for you.",
        href: `${dashboardPath}?tab=post`,
        icon: PlusCircle,
      });
    }

    return { live, pendingReview, newEnquiries, visitRequests, todaysActions };
  }, [properties, stats, dashboardPath]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border bg-white py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/15 bg-primary-light/50 p-5">
        <p className="text-sm font-semibold text-primary">Owner command center</p>
        <p className="mt-1 max-w-2xl text-sm text-text-secondary">
          Post, verify, receive enquiries, coordinate visits, and close with KrrishJazz support.
        </p>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
          {OWNER_TRUST_LINES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Live Properties", value: signals.live, icon: Building2 },
          { label: "Pending Review", value: signals.pendingReview, icon: Clock },
          { label: "New Enquiries", value: signals.newEnquiries, icon: MessageSquare },
          { label: "Visit Requests", value: signals.visitRequests, icon: Calendar },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-white p-5 shadow-card">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
              <card.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
            <p className="mt-1 text-sm font-medium text-text-secondary">{card.label}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Today&apos;s actions</h2>
            <p className="text-sm text-text-secondary">What to do next for faster responses and closures.</p>
          </div>
          <Button onClick={() => router.push(`${dashboardPath}?tab=post`)}>
            <PlusCircle size={16} className="mr-2" />
            Post Property
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {signals.todaysActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/30 hover:bg-white hover:shadow-card"
            >
              <div className="mb-2 flex items-center gap-2 text-primary">
                <action.icon size={18} />
                <span className="text-sm font-semibold text-foreground group-hover:text-primary">{action.title}</span>
              </div>
              <p className="text-xs leading-5 text-text-secondary">{action.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {properties.length > 0 && (
        <section className="rounded-2xl border border-border bg-white p-5 shadow-card">
          <h3 className="font-semibold text-foreground">Listing pipeline</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {(["under_review", "live", "needs_update", "paused"] as const).map((key) => {
              const count = properties.filter(
                (p) => getOwnerPropertyDisplayStatus(p.status, p.listingStatus) === key
              ).length;
              return (
                <div key={key} className="rounded-xl border border-border bg-surface px-3 py-3 text-center">
                  <p className="text-xl font-bold text-foreground">{count}</p>
                  <p className="mt-1 text-xs capitalize text-text-secondary">{key.replace("_", " ")}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
