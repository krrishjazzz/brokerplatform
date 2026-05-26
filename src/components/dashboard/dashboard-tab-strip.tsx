"use client";

import Link from "next/link";
import { deriveAuthCapabilities } from "@/lib/capabilities";
import { cn } from "@/lib/utils";
import { getNavItems, type NavContext } from "./navigation";
import type { DashboardTab } from "./types";

type DashboardTabStripProps = {
  ctx: NavContext;
  activeTab: DashboardTab;
  allowedTabs: DashboardTab[];
  onTabChange: (tab: DashboardTab) => void;
};

/** Owner workspace uses OwnerWorkspaceHeader — no embedded property search bar. */
export function usesDashboardSearchLayout(ctx: NavContext): boolean {
  if (ctx.mode === "owner") return false;
  const caps = deriveAuthCapabilities(ctx);
  if (caps.isAdmin) return false;
  if (caps.isApprovedBroker && !caps.canList) return false;
  return false;
}

export function DashboardTabStrip({
  ctx,
  activeTab,
  allowedTabs,
  onTabChange,
}: DashboardTabStripProps) {
  const items = getNavItems(ctx).filter((item) => item.id !== "broker-workspace");

  return (
    <div className="border-b border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <nav
          className="-mb-px flex gap-1 overflow-x-auto py-2 scrollbar-thin"
          aria-label="Dashboard sections"
        >
          {items.map((item) => {
            const tabId = item.id as DashboardTab;
            if (!allowedTabs.includes(tabId) && !item.href) return null;

            const isActive = !item.href && activeTab === tabId;
            const className = cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap",
              isActive
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:bg-primary-light hover:text-primary"
            );

            if (item.href) {
              return (
                <Link key={item.id} href={item.href} className={className}>
                  {item.label}
                </Link>
              );
            }

            return (
              <button key={item.id} type="button" onClick={() => onTabChange(tabId)} className={className}>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
