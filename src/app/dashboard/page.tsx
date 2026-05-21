"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useAuth } from "@/lib/auth-context";
import { profileCanList } from "@/lib/capabilities";
import { BUYER_DASHBOARD_PATH, OWNER_DASHBOARD_PATH } from "@/lib/dashboard-paths";

function BuyerDashboardRouter() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    if (profileCanList(user)) {
      const tab = searchParams.get("tab");
      const dest = tab ? `${OWNER_DASHBOARD_PATH}?tab=${tab}` : OWNER_DASHBOARD_PATH;
      router.replace(dest);
    }
  }, [user, loading, router, searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-surface">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (profileCanList(user)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-surface">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardShell
      basePath={BUYER_DASHBOARD_PATH}
      loginRedirect={`${BUYER_DASHBOARD_PATH}?tab=enquiries`}
    />
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center bg-surface">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <BuyerDashboardRouter />
    </Suspense>
  );
}
