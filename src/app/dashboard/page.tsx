"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock, Loader2, Menu, X, XCircle } from "lucide-react";
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
import { BecomeBrokerSection } from "@/components/dashboard/become-broker-section";
import { getDefaultTab, getNavItems, validTabs } from "@/components/dashboard/navigation";
import type { DashboardTab as Tab } from "@/components/dashboard/types";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// â”€â”€â”€ Nav config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// â”€â”€â”€ Dashboard Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const requestedTab = searchParams.get("tab");
      const allowedTabs = getNavItems(user.role, user.brokerStatus).map((item) => item.id);
      if (requestedTab && validTabs.includes(requestedTab as Tab) && allowedTabs.includes(requestedTab as Tab)) {
        setActiveTab(requestedTab as Tab);
      } else {
        setActiveTab(getDefaultTab(user.role, user.brokerStatus));
      }
    }
  }, [user, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const navItems = getNavItems(user.role, user.brokerStatus);

  return (
    <div className="min-h-screen bg-surface">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-background border-r border-border flex flex-col transition-transform duration-200 shadow-card lg:top-[76px] lg:z-30 lg:h-[calc(100vh-76px)] lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* User section */}
        <div className="p-5 border-b border-border bg-primary-light">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary text-white shadow-sm flex items-center justify-center font-semibold text-sm shrink-0">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate">{user.name || "User"}</p>
              <Badge variant={user.role === "ADMIN" ? "error" : user.role === "BROKER" ? "blue" : user.role === "OWNER" ? "accent" : "default"}>
                {user.role}
              </Badge>
            </div>
            <button
              className="ml-auto lg:hidden p-1 hover:bg-surface rounded-btn"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} className="text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
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
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        <BrokerStatusBanner
          role={user.role}
          brokerStatus={user.brokerStatus ?? null}
          appliedAt={user.brokerApplicationAt ?? null}
          rejectionReason={user.brokerRejectionReason ?? null}
          onView={() => setActiveTab("application")}
        />
        <div className="hidden items-center justify-center gap-3 bg-primary-light px-4 py-4 text-sm font-semibold text-foreground lg:flex">
          <AlertTriangle size={20} className="text-primary" />
          <span>Post property for free. KrrishJazz charges one month brokerage only after a successful closure.</span>
          <button type="button" onClick={() => setActiveTab("post")} className="font-bold text-accent hover:underline">
            Post Free
          </button>
        </div>
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-surface rounded-btn">
            <Menu size={24} className="text-foreground" />
          </button>
          <h1 className="font-semibold text-foreground">Dashboard</h1>
        </div>

        <main className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:px-8 lg:py-6">
          {activeTab === "overview" && <OverviewSection />}
          {activeTab === "properties" && <MyPropertiesSection />}
          {activeTab === "post" && <PostPropertySection onPosted={() => setActiveTab("properties")} />}
          {activeTab === "leads" && <LeadsSection />}
          {activeTab === "enquiries" && <EnquiriesSection />}
          {activeTab === "saved" && <SavedSection />}
          {activeTab === "profile" && <ProfileSection user={user} />}
          {activeTab === "application" && (
            <ApplicationStatusSection
              brokerStatus={user.brokerStatus}
              appliedAt={user.brokerApplicationAt ?? null}
              rejectionReason={user.brokerRejectionReason ?? null}
            />
          )}
          {activeTab === "requirements" && <RequirementsSection />}
          {activeTab === "apply-broker" && <BecomeBrokerSection onSubmitted={() => setActiveTab("application")} />}
        </main>
      </div>
    </div>
  );
}

function BrokerStatusBanner({
  role,
  brokerStatus,
  appliedAt,
  rejectionReason,
  onView,
}: {
  role: string;
  brokerStatus: string | null;
  appliedAt: string | null;
  rejectionReason: string | null;
  onView: () => void;
}) {
  if (role !== "BROKER" || !brokerStatus || brokerStatus === "APPROVED") return null;

  const isPending = brokerStatus === "PENDING";
  const tone = isPending
    ? "border-warning/20 bg-warning/10 text-warning"
    : "border-error/20 bg-error/10 text-error";
  const Icon = isPending ? Clock : XCircle;
  const title = isPending ? "Broker application under review" : "Broker application needs attention";
  const desc = isPending
    ? `${appliedAt ? `Submitted ${formatRelative(appliedAt)}. ` : ""}KrrishJazz ops typically responds within 1 business day.`
    : rejectionReason
    ? `Reason: ${rejectionReason}. Update your details and re-apply.`
    : "Update your details and send a stronger re-application.";

  return (
    <div className={cn("flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between", tone)}>
      <div className="flex items-start gap-3">
        <Icon size={18} className="mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs leading-5 text-text-secondary">{desc}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onView}
        className="inline-flex items-center gap-1.5 self-start rounded-btn border border-current bg-white px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface sm:self-auto"
      >
        <CheckCircle2 size={14} />
        View status
      </button>
    </div>
  );
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  const days = Math.floor(diff / 86_400_000);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}
