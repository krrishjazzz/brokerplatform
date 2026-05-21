"use client";

import { createContext, useContext } from "react";
import { BUYER_DASHBOARD_PATH } from "@/lib/dashboard-paths";

const DashboardPathContext = createContext(BUYER_DASHBOARD_PATH);

export function DashboardPathProvider({
  basePath,
  children,
}: {
  basePath: string;
  children: React.ReactNode;
}) {
  return <DashboardPathContext.Provider value={basePath}>{children}</DashboardPathContext.Provider>;
}

export function useDashboardPath(): string {
  return useContext(DashboardPathContext);
}

export function useDashboardTabHref(tab: string): string {
  const base = useDashboardPath();
  return `${base}?tab=${tab}`;
}
