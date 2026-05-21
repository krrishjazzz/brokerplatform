import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OWNER_DASHBOARD_PATH } from "@/lib/dashboard-paths";

export const metadata = {
  title: "Owner Dashboard | KrrishJazz",
  description: "Manage listings, enquiries, visits, and closure support.",
};

export default function OwnerDashboardPage() {
  return (
    <DashboardShell
      basePath={OWNER_DASHBOARD_PATH}
      loginRedirect={`${OWNER_DASHBOARD_PATH}?tab=overview`}
    />
  );
}
