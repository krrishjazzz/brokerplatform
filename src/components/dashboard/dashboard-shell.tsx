"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { deriveAuthCapabilities, profileCanList } from "@/lib/capabilities";
import { AlertTriangle, Loader2, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ClosureSupportSection } from "@/components/dashboard/closure-support-section";
import {
  DashboardTabStrip,
  usesDashboardSearchLayout,
} from "@/components/dashboard/dashboard-tab-strip";
import { DashboardWorkspaceHeader } from "@/components/dashboard/dashboard-workspace-header";
import { DashboardPathProvider } from "@/components/dashboard/dashboard-path-context";
import { MyPropertiesSection } from "@/components/dashboard/my-properties-section";
import { OwnerOverviewSection } from "@/components/dashboard/owner-overview-section";
import { SavedSection } from "@/components/dashboard/saved-section";
import { ApplicationStatusSection, ProfileSection } from "@/components/dashboard/profile-sections";
import { RequirementsSection } from "@/components/dashboard/requirements-section";
import { EnquiriesSection, OwnerEnquiriesSection } from "@/components/dashboard/lead-sections";
import { PostPropertySection } from "@/components/dashboard/post-property-section";
import { VisitsSection } from "@/components/dashboard/visits-section";
import { AccountStatusBanner } from "@/components/dashboard/account-status-banner";
import {
  canRenderDashboardTab,
  getAllowedDashboardTabs,
  resolveDashboardTab,
} from "@/components/dashboard/dashboard-tab-access";
import { getNavItems } from "@/components/dashboard/navigation";
import type { DashboardTab as Tab } from "@/components/dashboard/types";

export type DashboardShellProps = {
  basePath: string;
  loginRedirect: string;
};

function DashboardShellInner({ basePath, loginRedirect }: DashboardShellProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?intent=buyer&redirect=${encodeURIComponent(loginRedirect)}`);
    }
  }, [user, loading, router, loginRedirect]);

  useEffect(() => {
    if (!user) return;

    const navCtx = {
      role: user.role,
      brokerStatus: user.brokerStatus,
      canList: profileCanList(user),
      hasBrokerApplication: user.hasBrokerApplication,
    };

    const { tab, redirectTo } = resolveDashboardTab(searchParams.get("tab"), navCtx);
    if (redirectTo) {
      router.replace(redirectTo);
      return;
    }
    setActiveTab(tab);
  }, [user, searchParams, router]);

  const navCtx = user
    ? {
        role: user.role,
        brokerStatus: user.brokerStatus,
        canList: profileCanList(user),
        hasBrokerApplication: user.hasBrokerApplication,
      }
    : null;

  const handleTabChange = useCallback(
    (tab: Tab) => {
      setActiveTab(tab);
      router.replace(`${basePath}?tab=${tab}`);
    },
    [router, basePath]
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-surface">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !navCtx) return null;

  const caps = deriveAuthCapabilities(navCtx);
  const searchLayout = usesDashboardSearchLayout(navCtx);
  const navItems = getNavItems(navCtx);
  const allowedTabs = getAllowedDashboardTabs(navCtx);
  const showTab = (tab: Tab) => activeTab === tab && canRenderDashboardTab(tab, navCtx);

  const dashboardMain = (
    <>
      <AccountStatusBanner user={user} caps={caps} />
      {showTab("overview") && (caps.canList ? <OwnerOverviewSection /> : null)}
      {showTab("properties") && <MyPropertiesSection />}
      {showTab("post") && <PostPropertySection onPosted={() => handleTabChange("properties")} />}
      {showTab("enquiries") && (caps.canList ? <OwnerEnquiriesSection /> : <EnquiriesSection />)}
      {showTab("visits") && <VisitsSection />}
      {showTab("closure-support") && <ClosureSupportSection />}
      {showTab("saved") && <SavedSection />}
      {showTab("profile") && <ProfileSection user={user} />}
      {showTab("application") && (
        <ApplicationStatusSection
          brokerStatus={user.brokerStatus}
          appliedAt={user.brokerApplicationAt ?? null}
          rejectionReason={user.brokerRejectionReason ?? null}
        />
      )}
      {showTab("requirements") && <RequirementsSection />}
    </>
  );

  if (searchLayout) {
    return (
      <DashboardPathProvider basePath={basePath}>
        <div className="min-h-screen bg-surface">
          <DashboardWorkspaceHeader />
          <DashboardTabStrip
            ctx={navCtx}
            activeTab={activeTab}
            allowedTabs={allowedTabs}
            onTabChange={handleTabChange}
          />
          {caps.canList && (
            <div className="hidden items-center justify-center gap-3 border-b border-border bg-primary-light px-4 py-3 text-sm font-semibold text-foreground lg:flex">
              <AlertTriangle size={20} className="text-primary" />
              <span>
                Post property for free. KrrishJazz charges one month brokerage only after a successful closure.
              </span>
              {allowedTabs.includes("post") && (
                <button
                  type="button"
                  onClick={() => handleTabChange("post")}
                  className="font-bold text-accent hover:underline"
                >
                  Post Free
                </button>
              )}
            </div>
          )}
          <main className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:px-8 lg:py-6">{dashboardMain}</main>
        </div>
      </DashboardPathProvider>
    );
  }

  return (
    <DashboardPathProvider basePath={basePath}>
      <div className="min-h-screen bg-surface">
        <LegacyDashboardSidebar
          user={user}
          caps={caps}
          navItems={navItems}
          allowedTabs={allowedTabs}
          activeTab={activeTab}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onOpenSidebar={() => setSidebarOpen(true)}
          onTabChange={handleTabChange}
        />
        <div className="lg:ml-64">
          <main className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:px-8 lg:py-6">{dashboardMain}</main>
        </div>
      </div>
    </DashboardPathProvider>
  );
}

export function DashboardShell(props: DashboardShellProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center bg-surface">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <DashboardShellInner {...props} />
    </Suspense>
  );
}

function LegacyDashboardSidebar({
  user,
  caps,
  navItems,
  allowedTabs,
  activeTab,
  sidebarOpen,
  onCloseSidebar,
  onOpenSidebar,
  onTabChange,
}: {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  caps: ReturnType<typeof deriveAuthCapabilities>;
  navItems: ReturnType<typeof getNavItems>;
  allowedTabs: Tab[];
  activeTab: Tab;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
  onOpenSidebar: () => void;
  onTabChange: (tab: Tab) => void;
}) {
  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onCloseSidebar} />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full w-64 flex-col border-r border-border bg-background shadow-card transition-transform duration-200 lg:top-[76px] lg:z-30 lg:h-[calc(100vh-76px)] lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="border-b border-border bg-primary-light p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-sm">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{user.name || "User"}</p>
              <Badge variant={caps.accountBadgeVariant}>{caps.accountLabel}</Badge>
            </div>
            <button type="button" className="ml-auto rounded-btn p-1 hover:bg-surface lg:hidden" onClick={onCloseSidebar}>
              <X size={20} className="text-text-secondary" />
            </button>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) =>
            item.href ? (
              <Link
                key={item.id}
                href={item.href}
                onClick={onCloseSidebar}
                className={cn(
                  "flex w-full items-center gap-3 rounded-btn border px-3 py-2.5 text-sm font-semibold transition-colors",
                  item.emphasis
                    ? "border-primary/30 bg-primary text-white shadow-card hover:bg-primary-dark"
                    : "border-transparent text-text-secondary hover:bg-primary-light hover:text-primary"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ) : (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (allowedTabs.includes(item.id as Tab)) onTabChange(item.id as Tab);
                  onCloseSidebar();
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-btn border border-transparent px-3 py-2.5 text-sm font-medium transition-colors",
                  activeTab === item.id
                    ? "bg-primary text-white shadow-card"
                    : "text-text-secondary hover:bg-primary-light hover:text-primary"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            )
          )}
        </nav>
      </aside>
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <button type="button" onClick={onOpenSidebar} className="rounded-btn p-1 hover:bg-surface">
          <Menu size={24} className="text-foreground" />
        </button>
        <h1 className="font-semibold text-foreground">Dashboard</h1>
      </div>
    </>
  );
}
