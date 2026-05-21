"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { deriveAuthCapabilities, profileCanList } from "@/lib/capabilities";
import { AlertTriangle, Loader2, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MyPropertiesSection } from "@/components/dashboard/my-properties-section";
import { OverviewSection } from "@/components/dashboard/overview-section";
import { SavedSection } from "@/components/dashboard/saved-section";
import { ApplicationStatusSection, ProfileSection } from "@/components/dashboard/profile-sections";
import { RequirementsSection } from "@/components/dashboard/requirements-section";
import { EnquiriesSection, LeadsSection } from "@/components/dashboard/lead-sections";
import { PostPropertySection } from "@/components/dashboard/post-property-section";
import { AccountStatusBanner } from "@/components/dashboard/account-status-banner";
import {
  canRenderDashboardTab,
  getAllowedDashboardTabs,
  resolveDashboardTab,
} from "@/components/dashboard/dashboard-tab-access";
import { getNavItems } from "@/components/dashboard/navigation";
import type { DashboardTab as Tab } from "@/components/dashboard/types";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("enquiries");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?intent=buyer&redirect=/dashboard");
    }
  }, [user, loading, router]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const navCtx = {
    role: user.role,
    brokerStatus: user.brokerStatus,
    canList: profileCanList(user),
    hasBrokerApplication: user.hasBrokerApplication,
  };
  const caps = deriveAuthCapabilities(navCtx);
  const navItems = getNavItems(navCtx);
  const allowedTabs = getAllowedDashboardTabs(navCtx);
  const showTab = (tab: Tab) => activeTab === tab && canRenderDashboardTab(tab, navCtx);

  return (
    <div className="min-h-screen bg-surface">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-background border-r border-border flex flex-col transition-transform duration-200 shadow-card lg:top-[76px] lg:z-30 lg:h-[calc(100vh-76px)] lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-5 border-b border-border bg-primary-light">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary text-white shadow-sm flex items-center justify-center font-semibold text-sm shrink-0">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate">{user.name || "User"}</p>
              <Badge variant={caps.accountBadgeVariant}>{caps.accountLabel}</Badge>
            </div>
            <button
              type="button"
              className="ml-auto lg:hidden p-1 hover:bg-surface rounded-btn"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} className="text-text-secondary" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) =>
            item.href ? (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-semibold transition-colors border",
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
                  if (allowedTabs.includes(item.id as Tab)) {
                    setActiveTab(item.id as Tab);
                  }
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-colors border border-transparent",
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

      <div className="lg:ml-64">
        {caps.canList && (
          <div className="hidden items-center justify-center gap-3 bg-primary-light px-4 py-4 text-sm font-semibold text-foreground lg:flex">
            <AlertTriangle size={20} className="text-primary" />
            <span>Post property for free. KrrishJazz charges one month brokerage only after a successful closure.</span>
            {allowedTabs.includes("post") && (
              <button type="button" onClick={() => setActiveTab("post")} className="font-bold text-accent hover:underline">
                Post Free
              </button>
            )}
          </div>
        )}

        <div className="lg:hidden sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
          <button type="button" onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-surface rounded-btn">
            <Menu size={24} className="text-foreground" />
          </button>
          <h1 className="font-semibold text-foreground">Dashboard</h1>
        </div>

        <main className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:px-8 lg:py-6">
          <AccountStatusBanner user={user} />
          {showTab("overview") && <OverviewSection />}
          {showTab("properties") && <MyPropertiesSection />}
          {showTab("post") && <PostPropertySection onPosted={() => setActiveTab("properties")} />}
          {showTab("leads") && <LeadsSection />}
          {showTab("enquiries") && <EnquiriesSection />}
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
        </main>
      </div>
    </div>
  );
}
