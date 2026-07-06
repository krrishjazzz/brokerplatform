import {
  Briefcase,
  Building2,
  Calendar,
  ClipboardList,
  Handshake,
  Heart,
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  Shield,
  User,
} from "lucide-react";
import { deriveAuthCapabilities } from "@/lib/capabilities";
import type { DashboardMode } from "@/components/dashboard/dashboard-mode";
import type { DashboardNavItem, DashboardTab } from "./types";

export type NavContext = {
  role: string;
  brokerStatus?: string | null;
  canList?: boolean;
  ownerStatus?: string | null;
  hasBrokerApplication?: boolean;
  mode?: DashboardMode;
};

const iconSize = 20;

/** Owner listing command center — no broker CRM or buyer saved-search noise. */
export function getOwnerNavItems(): DashboardNavItem[] {
  return [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={iconSize} /> },
    { id: "properties", label: "My Properties", icon: <Building2 size={iconSize} /> },
    { id: "post", label: "Post Property", icon: <PlusCircle size={iconSize} /> },
    { id: "enquiries", label: "Enquiries", icon: <MessageSquare size={iconSize} /> },
    { id: "visits", label: "Visits", icon: <Calendar size={iconSize} /> },
    { id: "closure-support", label: "Closure Support", icon: <Handshake size={iconSize} /> },
    { id: "profile", label: "Profile", icon: <User size={iconSize} /> },
  ];
}

function getBuyerNavItems(): DashboardNavItem[] {
  return [
    { id: "enquiries", label: "My Enquiries", icon: <MessageSquare size={iconSize} /> },
    { id: "saved", label: "Saved Properties", icon: <Heart size={iconSize} /> },
    { id: "requirements", label: "My Requirements", icon: <ClipboardList size={iconSize} /> },
    { id: "post", label: "List a Property", icon: <PlusCircle size={iconSize} /> },
    { id: "profile", label: "Profile", icon: <User size={iconSize} /> },
  ];
}

export function getNavItems(ctx: NavContext): DashboardNavItem[] {
  const caps = deriveAuthCapabilities(ctx);
  const mode = ctx.mode ?? "buyer";

  if (caps.isAdmin) {
    return [
      { id: "profile", label: "Profile", icon: <User size={iconSize} /> },
      {
        id: "overview",
        label: "Admin Panel",
        icon: <Shield size={iconSize} />,
        href: "/admin",
        emphasis: true,
      },
    ];
  }

  if (mode === "owner" && caps.canList) {
    return getOwnerNavItems();
  }

  let items = getBuyerNavItems();

  if (caps.isApprovedBroker) {
    items = [
      {
        id: "broker-workspace",
        label: "Partner workspace",
        icon: <Briefcase size={iconSize} />,
        href: "/broker/properties",
        emphasis: true,
      },
      ...items,
    ];
  } else if (caps.isPendingBroker || caps.isRejectedBroker) {
    items = [
      { id: "application", label: "Broker Application", icon: <ClipboardList size={iconSize} /> },
      ...items.filter((i) => i.id !== "post"),
      { id: "post", label: "List a Property", icon: <PlusCircle size={iconSize} /> },
    ];
  }

  return items;
}

export function getDefaultTab(ctx: NavContext): DashboardTab {
  const caps = deriveAuthCapabilities(ctx);
  const mode = ctx.mode ?? "buyer";

  if (mode === "owner" && caps.canList) return "properties";
  if (caps.isPendingBroker || caps.isRejectedBroker) return "application";
  return "enquiries";
}
