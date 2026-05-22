"use client";

import Link from "next/link";
import { AlertTriangle, BadgeCheck, Briefcase, Building2, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardMode } from "@/components/dashboard/dashboard-mode";
import type { User } from "@/lib/auth-context";
import { deriveAuthCapabilities, type AuthCapabilities } from "@/lib/capabilities";
import { OWNER_TRUST_LINES } from "@/lib/owner-dashboard";

export function AccountStatusBanner({
  user,
  caps: capsProp,
  dashboardMode = "buyer",
}: {
  user: User;
  caps?: AuthCapabilities;
  dashboardMode?: DashboardMode;
}) {
  const caps =
    capsProp ??
    deriveAuthCapabilities({
      role: user.role,
      brokerStatus: user.brokerStatus,
      canList: user.canList,
      ownerStatus: user.ownerStatus,
      hasBrokerApplication: user.hasBrokerApplication,
    });

  const isOwnerDashboard = dashboardMode === "owner";

  if (isOwnerDashboard && caps.canList) {
    return (
      <div className="mb-6 space-y-3">
        <div className="rounded-2xl border border-primary/15 bg-primary-light/40 p-4">
          <div className="flex items-start gap-3">
            <Building2 className="mt-0.5 shrink-0 text-primary" size={22} />
            <div>
              <p className="font-semibold text-foreground">Your listings, managed by KrrishJazz</p>
              <p className="mt-1 text-sm text-text-secondary">
                {OWNER_TRUST_LINES[0]} {OWNER_TRUST_LINES[1]} {OWNER_TRUST_LINES[3]}
              </p>
            </div>
          </div>
        </div>
        {caps.isApprovedBroker && (
          <div className="flex flex-col gap-3 rounded-card border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Briefcase className="mt-0.5 shrink-0 text-text-secondary" size={20} />
              <div>
                <p className="text-sm font-semibold text-foreground">You also have partner workspace access</p>
                <p className="mt-1 text-xs text-text-secondary">
                  Separate tools for demand matching — your owner listings stay here.
                </p>
              </div>
            </div>
            <Link href="/broker/properties">
              <Button variant="outline" size="sm">
                Open partner workspace
              </Button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  if (caps.isApprovedBroker && !isOwnerDashboard) {
    return (
      <div className="mb-6 flex flex-col gap-3 rounded-card border border-primary/20 bg-primary-light p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <BadgeCheck className="mt-0.5 shrink-0 text-primary" size={22} />
          <div>
            <p className="font-semibold text-foreground">Broker workspace is active</p>
            <p className="mt-1 text-sm text-text-secondary">
              Open leads, requirements, and network inventory from your broker dashboard.
            </p>
          </div>
        </div>
        <Link href="/broker/properties">
          <Button>Open broker workspace</Button>
        </Link>
      </div>
    );
  }

  if (caps.isPendingBroker && !isOwnerDashboard) {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-card border border-warning/30 bg-warning-light p-4">
        <Clock className="mt-0.5 shrink-0 text-warning" size={22} />
        <div>
          <p className="font-semibold text-foreground">Broker application under review</p>
          <p className="mt-1 text-sm text-text-secondary">
            Usually within one business day. You can still search listings and manage enquiries while you wait.
          </p>
          <Link href="/dashboard?tab=application" className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
            View application status
          </Link>
        </div>
      </div>
    );
  }

  if (caps.isRejectedBroker && !isOwnerDashboard) {
    return (
      <div className="mb-6 flex flex-col gap-3 rounded-card border border-error/25 bg-error-light p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 shrink-0 text-error" size={22} />
          <div>
            <p className="font-semibold text-foreground">Broker application not approved</p>
            <p className="mt-1 text-sm text-text-secondary">
              {user.brokerRejectionReason || "You can update details and apply again."}
            </p>
          </div>
        </div>
        <Link href="/brokers">
          <Button variant="outline">Apply again on brokers page</Button>
        </Link>
      </div>
    );
  }

  if (user.role === "CUSTOMER" && !caps.canList) {
    return (
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-card border border-border bg-white p-4">
          <div className="flex items-center gap-2 text-primary">
            <Search size={18} />
            <p className="font-semibold text-foreground">Signed in as buyer</p>
          </div>
          <p className="mt-2 text-sm text-text-secondary">Track enquiries and saved properties from this dashboard.</p>
        </div>
        <div className="rounded-card border border-primary/15 bg-primary-light/40 p-4">
          <div className="flex items-center gap-2 text-primary">
            <Building2 size={18} />
            <p className="font-semibold text-foreground">Want to list?</p>
          </div>
          <p className="mt-2 text-sm text-text-secondary">Enable owner listing on the same account.</p>
          <Link href="/owners/dashboard?tab=post" className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
            List a property
          </Link>
        </div>
      </div>
    );
  }

  if (caps.canList && !caps.isApprovedBroker) {
    return (
      <div className="mb-6 rounded-2xl border border-primary/15 bg-primary-light/40 p-4">
        <div className="flex items-start gap-3">
          <Building2 className="mt-0.5 shrink-0 text-primary" size={22} />
          <div>
            <p className="font-semibold text-foreground">Owner command center</p>
            <p className="mt-1 text-sm text-text-secondary">
              {OWNER_TRUST_LINES[0]} {OWNER_TRUST_LINES[3]}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (caps.canList && caps.isApprovedBroker && !isOwnerDashboard) {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-success/25 bg-success-light/50 p-4">
        <Building2 className="mt-0.5 shrink-0 text-success" size={22} />
        <div>
          <p className="font-semibold text-foreground">Owner tools active</p>
          <p className="mt-1 text-sm text-text-secondary">
            Listings and broker workspace are both available on this account.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
