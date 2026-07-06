"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BUYER_DASHBOARD_PATH } from "@/lib/dashboard-paths";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center bg-surface">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <DashboardShell
        basePath={BUYER_DASHBOARD_PATH}
        loginRedirect={`${BUYER_DASHBOARD_PATH}?tab=enquiries`}
        mode="buyer"
      />
    </Suspense>
  );
}
