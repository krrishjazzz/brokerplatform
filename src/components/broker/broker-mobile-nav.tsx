"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Contact, LayoutDashboard, Target, UserCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBrokerNavCounts } from "@/components/broker/broker-nav-context";

const MOBILE_TABS = [
  { label: "Home", href: "/broker/overview", icon: LayoutDashboard, match: (path: string) => path === "/broker/overview" || path === "/broker" },
  { label: "CRM", href: "/broker/crm", icon: Contact, match: (path: string) => path.startsWith("/broker/crm") },
  { label: "Stock", href: "/broker/properties", icon: Building2, match: (path: string) => path.startsWith("/broker/properties"), countKey: "inventory" as const },
  { label: "Demand", href: "/broker/requirements", icon: Target, match: (path: string) => path.startsWith("/broker/requirements"), countKey: "demand" as const },
  { label: "Match", href: "/broker/matches", icon: Zap, match: (path: string) => path.startsWith("/broker/matches"), countKey: "matches" as const },
  { label: "Profile", href: "/broker/profile", icon: UserCircle, match: (path: string) => path.startsWith("/broker/profile") },
];

export function BrokerMobileNav() {
  const pathname = usePathname() ?? "";
  const { counts } = useBrokerNavCounts();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden"
      aria-label="Broker workspace mobile"
    >
      <div className="mx-auto grid max-w-lg grid-cols-6">
        {MOBILE_TABS.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          const badge = "countKey" in tab ? counts[tab.countKey] : 0;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-semibold transition-colors",
                active ? "text-primary" : "text-text-secondary"
              )}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
              {badge > 0 && "countKey" in tab && tab.countKey !== "inventory" && (
                <span className="absolute right-2 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
