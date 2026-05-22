import { DashboardFooter } from "@/components/dashboard/dashboard-footer";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <div className="flex flex-1">{children}</div>
      <DashboardFooter sidebarOffset="" />
    </div>
  );
}
