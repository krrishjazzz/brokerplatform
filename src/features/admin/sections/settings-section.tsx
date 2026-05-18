"use client";

import { SectionHeader } from "@/components/admin/admin-primitives";

export function SettingsSection() {
  return (
    <div>
      <SectionHeader
        eyebrow="Policy"
        title="Ops Settings"
        description="Current operational rules are shown as policy cards until backed by persistent, permissioned controls."
      />
      <div className="rounded-card border border-border bg-white p-6 shadow-card">
        <p className="text-sm text-text-secondary">
          Fake toggles were removed here because they create operational risk. These controls should only return once they are backed by persistent settings, audit events, and admin permissions.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Verification policy", "Manual KrrishJazz review stays on for trust."],
            ["Freshness expiry", "Live listings should be reconfirmed every 14 days."],
            ["Lead policy", "Customer contact remains KrrishJazz-managed first."],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-card border border-border bg-surface p-4">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
