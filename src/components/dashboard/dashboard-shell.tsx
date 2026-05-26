"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deriveAuthCapabilities, profileCanList } from "@/lib/capabilities";
import type { DashboardMode } from "@/components/dashboard/dashboard-mode";
import { ownerListingBannerLine, ownerPostFreeCta } from "@/lib/owner-copy";
import { persistLastWorkspace } from "@/lib/workspace";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ClosureSupportSection } from "@/components/dashboard/closure-support-section";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { OwnerWorkspaceHeader } from "@/components/workspace/owner-workspace-header";
import { SearchWorkspaceHeader } from "@/components/workspace/search-workspace-header";
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
  mode?: DashboardMode;
};

function DashboardShellInner({ basePath, loginRedirect, mode = "buyer" }: DashboardShellProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      const intent = mode === "owner" ? "owner" : "buyer";
      router.replace(`/login?intent=${intent}&redirect=${encodeURIComponent(loginRedirect)}`);
    }
  }, [user, loading, router, loginRedirect, mode]);

  useEffect(() => {
    if (!user || loading) return;
    if (mode === "owner") persistLastWorkspace("owner");
    else if (mode === "buyer") persistLastWorkspace("buyer");
  }, [user, loading, mode]);

  useEffect(() => {
    if (!user) return;

    const navCtx = {
      role: user.role,
      brokerStatus: user.brokerStatus,
      canList: profileCanList(user),
      ownerStatus: user.ownerStatus,
      hasBrokerApplication: user.hasBrokerApplication,
      mode,
    };

    const editSlug = searchParams.get("edit");
    const { tab, redirectTo } = resolveDashboardTab(searchParams.get("tab"), navCtx, mode, editSlug);
    if (redirectTo) {
      router.replace(redirectTo);
      return;
    }
    setActiveTab(tab);
  }, [user, searchParams, router, mode]);

  const editSlug = searchParams.get("edit");

  const navCtx = user
    ? {
        role: user.role,
        brokerStatus: user.brokerStatus,
        canList: profileCanList(user),
        ownerStatus: user.ownerStatus,
        hasBrokerApplication: user.hasBrokerApplication,
        mode,
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
  const allowedTabs = getAllowedDashboardTabs(navCtx, mode);
  const showTab = (tab: Tab) => activeTab === tab && canRenderDashboardTab(tab, navCtx, mode);

  const dashboardMain = (
    <>
      <AccountStatusBanner user={user} caps={caps} dashboardMode={mode} />
      {showTab("overview") && (caps.canList ? <OwnerOverviewSection /> : null)}
      {showTab("properties") && <MyPropertiesSection />}
      {showTab("post") && (
        <PostPropertySection
          editSlug={editSlug}
          onPosted={() => handleTabChange("properties")}
        />
      )}
      {showTab("enquiries") && (caps.canList ? <OwnerEnquiriesSection /> : <EnquiriesSection />)}
      {showTab("visits") && <VisitsSection />}
      {showTab("closure-support") && <ClosureSupportSection />}
      {showTab("saved") && <SavedSection />}
      {showTab("profile") && <ProfileSection user={user} ownerDashboardMode={mode === "owner"} />}
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

  const showOwnerHeader = mode === "owner" && caps.canList;
  const showBuyerHeader = mode === "buyer";
  const hasWorkspaceHeader = showOwnerHeader || showBuyerHeader;
  const sidebarTopClass = hasWorkspaceHeader ? "top-14 lg:top-14" : "top-0";
  const sidebarHeightClass = hasWorkspaceHeader
    ? "h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-3.5rem)]"
    : "h-full";

  return (
    <DashboardPathProvider basePath={basePath}>
      <div className="min-h-screen bg-surface">
        {showOwnerHeader && <OwnerWorkspaceHeader />}
        {showBuyerHeader && <SearchWorkspaceHeader logoHref="/properties" />}
        {showOwnerHeader && caps.canList && (
          <div className="hidden items-center justify-center gap-3 border-b border-border bg-primary-light px-4 py-3 text-sm font-semibold text-foreground lg:flex lg:pl-64">
            <AlertTriangle size={20} className="text-primary" />
            <span>{ownerListingBannerLine()}</span>
            {allowedTabs.includes("post") && (
              <button
                type="button"
                onClick={() => handleTabChange("post")}
                className="font-bold text-accent hover:underline"
              >
                {ownerPostFreeCta()}
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
          stickyTopClass={sidebarTopClass}
          sidebarHeightClass={sidebarHeightClass}
        />
        <div className="lg:ml-64">
          <main className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:px-8 lg:py-6">{dashboardMain}</main>
          <DashboardFooter />
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

