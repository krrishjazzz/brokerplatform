"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useBrokerNavCounts, getBrokerNavBadge } from "@/components/broker/broker-nav-context";

const BROKER_TABS = [
  {
    label: "Overview",
    href: "/broker/overview",
    match: (path: string) => path === "/broker/overview" || path === "/broker",
  },
  {
    label: "CRM",
    href: "/broker/crm",
    match: (path: string) => path.startsWith("/broker/crm"),
  },
  {
    label: "Inventory",
    href: "/broker/properties",
    match: (path: string) => path.startsWith("/broker/properties"),
    countKey: "inventory" as const,
  },
  {
    label: "Demand",
    href: "/broker/requirements",
    match: (path: string) => path.startsWith("/broker/requirements"),
    countKey: "demand" as const,
  },
  {
    label: "Matches",
    href: "/broker/matches",
    match: (path: string) => path.startsWith("/broker/matches"),
    countKey: "matches" as const,
  },
  {
    label: "Profile",
    href: "/broker/profile",
    match: (path: string) => path.startsWith("/broker/profile"),
  },
] as const;

export function BrokerSubNav() {
  const pathname = usePathname() ?? "";
  const { counts } = useBrokerNavCounts();

  return (
    <div className="border-t border-white/10 bg-primary-dark">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 lg:px-6">
        <nav className="flex gap-1 overflow-x-auto py-2" aria-label="Partner workspace">
          {BROKER_TABS.map((tab) => {
            const active = tab.match(pathname);
            const badge = getBrokerNavBadge(counts, "countKey" in tab ? tab.countKey : undefined);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-white text-primary shadow-sm"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                {tab.label}
                {badge > 0 && "countKey" in tab && tab.countKey === "matches" && (
                  <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/properties"
          className="hidden shrink-0 rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10 sm:inline-block"
        >
          Customer view
        </Link>
      </div>
    </div>
  );
}
