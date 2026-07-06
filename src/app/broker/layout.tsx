import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { BrokerWorkspaceHeader } from "@/components/workspace/broker-workspace-header";

export default function BrokerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <BrokerWorkspaceHeader />
      <div className="flex-1">{children}</div>
      <DashboardFooter sidebarOffset="" />
    </div>
  );
}
