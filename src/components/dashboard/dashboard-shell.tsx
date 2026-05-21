"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deriveAuthCapabilities, profileCanList } from "@/lib/capabilities";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ClosureSupportSection } from "@/components/dashboard/closure-support-section";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { usesDashboardSearchLayout } from "@/components/dashboard/dashboard-tab-strip";
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
          {caps.canList && (
            <div className="hidden items-center justify-center gap-3 border-b border-border bg-primary-light px-4 py-3 text-sm font-semibold text-foreground lg:flex lg:pl-64">
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
          <DashboardSidebar
            user={user}
            ctx={navCtx}
            activeTab={activeTab}
            allowedTabs={allowedTabs}
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

  return (
    <DashboardPathProvider basePath={basePath}>
      <div className="min-h-screen bg-surface">
        <DashboardSidebar
          user={user}
          ctx={navCtx}
          activeTab={activeTab}
          allowedTabs={allowedTabs}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onOpenSidebar={() => setSidebarOpen(true)}
          onTabChange={handleTabChange}
          stickyTopClass="top-0 lg:top-[76px]"
          sidebarHeightClass="h-full lg:h-[calc(100vh-76px)]"
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

