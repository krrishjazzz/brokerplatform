"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { SearchWorkspaceHeader } from "@/components/workspace/search-workspace-header";
import { useDashboardPath } from "@/components/dashboard/dashboard-path-context";
import { OWNER_DASHBOARD_PATH } from "@/lib/dashboard-paths";

export function OwnerWorkspaceHeader() {
  const dashboardPath = useDashboardPath();
  const postHref = `${dashboardPath}?tab=post`;

  return (
    <SearchWorkspaceHeader
      logoHref={OWNER_DASHBOARD_PATH}
      workspaceMode="owner"
      trailingActions={
        <Link
          href={postHref}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-accent/90 sm:px-3 sm:py-2 sm:text-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Post Property</span>
          <span className="sm:hidden">Post</span>
        </Link>
      }
    />
  );
}
