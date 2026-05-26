"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, ShieldCheck, X, LogOut } from "lucide-react";
import { AllLeadsSection } from "@/components/admin/leads-section";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  ADMIN_NAV_ITEMS,
  AllPropertiesSection,
  AllRequirementsSection,
  AllUsersSection,
  DashboardSection,
  PendingBrokersSection,
  PendingPropertiesSection,
  SettingsSection,
  LocationsSection,
  type AdminTab,
} from "@/features/admin";

export default function AdminPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 bg-surface">
      <button
        onClick={() => setSideOpen(true)}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-primary p-3 text-white shadow-lg lg:hidden"
        aria-label="Open admin menu"
      >
        <Menu size={20} />
      </button>

      {sideOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSideOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed top-0 z-50 flex h-screen w-72 shrink-0 flex-col border-r border-border bg-white shadow-card transition-transform lg:sticky lg:translate-x-0 lg:shadow-none",
          sideOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">KrrishJazz Admin</p>
              <p className="text-xs text-text-secondary">{user.name || "Admin"} workspace</p>
            </div>
            <button
              onClick={() => setSideOpen(false)}
              className="rounded-full p-1 text-text-secondary hover:bg-surface lg:hidden"
              aria-label="Close admin menu"
            >
              <X size={18} />
            </button>
          </div>
          <div className="mt-4 rounded-card bg-primary p-4 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck size={17} />
              Trust operations
            </div>
            <p className="mt-2 text-xs leading-5 text-white/80">
              Verify listings, brokers, and managed leads before users feel the rough edges.
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {ADMIN_NAV_ITEMS.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                setActiveTab(item.value);
                setSideOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-sm transition-colors",
                activeTab === item.value
                  ? "bg-primary-light font-semibold text-primary"
                  : "text-text-secondary hover:bg-surface"
              )}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium text-error transition-colors hover:bg-error/5"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        {activeTab === "dashboard" && <DashboardSection />}
        {activeTab === "pending-properties" && <PendingPropertiesSection />}
        {activeTab === "all-properties" && <AllPropertiesSection />}
        {activeTab === "all-requirements" && <AllRequirementsSection />}
        {activeTab === "pending-brokers" && <PendingBrokersSection />}
        {activeTab === "all-users" && <AllUsersSection />}
        {activeTab === "all-leads" && <AllLeadsSection />}
        {activeTab === "locations" && <LocationsSection />}
        {activeTab === "settings" && <SettingsSection />}
      </main>
    </div>
  );
}
