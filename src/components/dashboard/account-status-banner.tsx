"use client";

import Link from "next/link";
import { AlertTriangle, BadgeCheck, Building2, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/auth-context";
import { deriveAuthCapabilities } from "@/lib/post-login";

export function AccountStatusBanner({ user }: { user: User }) {
  const caps = deriveAuthCapabilities({
    role: user.role,
    brokerStatus: user.brokerStatus,
  });

  if (caps.isApprovedBroker) {
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

  if (caps.isPendingBroker) {
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

  if (caps.isRejectedBroker) {
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
          <Link href="/dashboard?tab=post" className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
            List a property
          </Link>
        </div>
      </div>
    );
  }

  if (user.role === "OWNER" || caps.canList) {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-card border border-success/25 bg-success-light/50 p-4">
        <Building2 className="mt-0.5 shrink-0 text-success" size={22} />
        <div>
          <p className="font-semibold text-foreground">Owner listing is active</p>
          <p className="mt-1 text-sm text-text-secondary">
            Post and manage properties. Brokerage is charged only on successful closure.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
