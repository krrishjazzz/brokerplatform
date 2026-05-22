"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { deriveAuthCapabilities } from "@/lib/capabilities";
import type { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getNavItems } from "@/components/dashboard/navigation";
import type { DashboardTab } from "@/components/dashboard/types";
import type { NavContext } from "@/components/dashboard/navigation";

type DashboardSidebarProps = {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  ctx: NavContext;
  activeTab: DashboardTab;
  allowedTabs: DashboardTab[];
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
  onOpenSidebar: () => void;
  onTabChange: (tab: DashboardTab) => void;
  /** Top offset for fixed sidebar (below header). */
  stickyTopClass?: string;
  sidebarHeightClass?: string;
};

export function DashboardSidebar({
  user,
  ctx,
  activeTab,
  allowedTabs,
  sidebarOpen,
  onCloseSidebar,
  onOpenSidebar,
  onTabChange,
  stickyTopClass = "top-14",
  sidebarHeightClass = "h-[calc(100vh-3.5rem)]",
}: DashboardSidebarProps) {
  const caps = deriveAuthCapabilities(ctx);
  const navItems = getNavItems(ctx).filter((item) => item.id !== "broker-workspace");
  const sidebarAccountLabel =
    ctx.mode === "owner" && caps.canList
      ? caps.canPostProperty
        ? "Listing tools active"
        : caps.ownerStatus === "PENDING"
          ? "Listing pending approval"
          : caps.ownerStatus === "REJECTED"
            ? "Listing not approved"
            : "Owner account"
      : caps.accountLabel;
  const sidebarBadgeVariant =
    ctx.mode === "owner" && caps.canList
      ? caps.canPostProperty
        ? "accent"
        : "warning"
      : caps.accountBadgeVariant;

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={onCloseSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 z-50 flex w-64 flex-col border-r border-border bg-white shadow-card transition-transform duration-200",
          stickyTopClass,
          sidebarHeightClass,
          "lg:z-30",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className="border-b border-border bg-primary-light/60 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{user.name || "User"}</p>
              <Badge variant={sidebarBadgeVariant} className="mt-0.5">
                {sidebarAccountLabel}
              </Badge>
            </div>
            <button
              type="button"
              className="rounded-lg p-1 hover:bg-white/80 lg:hidden"
              onClick={onCloseSidebar}
              aria-label="Close sidebar"
            >
              <X size={20} className="text-text-secondary" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="Dashboard sections">
          {navItems.map((item) => {
            const tabId = item.id as DashboardTab;
            if (!allowedTabs.includes(tabId) && !item.href) return null;

            const isActive = !item.href && activeTab === tabId;
            const itemClass = cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
              item.href
                ? item.emphasis
                  ? "bg-primary text-white shadow-sm hover:bg-primary-dark"
                  : "text-text-secondary hover:bg-primary-light hover:text-primary"
                : isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-secondary hover:bg-primary-light hover:text-primary"
            );

            if (item.href) {
              return (
                <Link key={item.id} href={item.href} onClick={onCloseSidebar} className={itemClass}>
                  {item.icon}
                  {item.label}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (allowedTabs.includes(tabId)) onTabChange(tabId);
                  onCloseSidebar();
                }}
                className={itemClass}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div
        className={cn(
          "sticky z-20 flex items-center gap-3 border-b border-border bg-white px-4 py-3 lg:hidden",
          stickyTopClass
        )}
      >
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-lg p-1.5 hover:bg-surface"
          aria-label="Open menu"
        >
          <Menu size={22} className="text-foreground" />
        </button>
        <p className="text-sm font-semibold text-foreground">
          {navItems.find((i) => i.id === activeTab)?.label ?? "Dashboard"}
        </p>
      </div>
    </>
  );
}
