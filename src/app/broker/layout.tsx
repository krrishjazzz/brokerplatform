import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { BrokerMobileNav } from "@/components/broker/broker-mobile-nav";
import { BrokerNavProvider } from "@/components/broker/broker-nav-context";
import { BrokerWorkspaceHeader } from "@/components/workspace/broker-workspace-header";

export default function BrokerLayout({ children }: { children: React.ReactNode }) {
  return (
    <BrokerNavProvider>
      <div
        className="broker-workspace flex min-h-screen flex-col bg-surface [--broker-header-height:7rem]"
      >
        <BrokerWorkspaceHeader />
        <div className="flex-1">{children}</div>
        <DashboardFooter sidebarOffset="" />
        <BrokerMobileNav />
      </div>
    </BrokerNavProvider>
  );
}
