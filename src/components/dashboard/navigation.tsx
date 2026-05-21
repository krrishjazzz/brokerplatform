import {
  Briefcase,
  Building2,
  ClipboardList,
  Heart,
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  Shield,
  User,
  Users,
} from "lucide-react";
import { deriveAuthCapabilities } from "@/lib/capabilities";
import type { DashboardNavItem, DashboardTab } from "./types";

export type NavContext = {
  role: string;
  brokerStatus?: string | null;
  canList?: boolean;
  hasBrokerApplication?: boolean;
};

export function getNavItems({ role, brokerStatus, canList, hasBrokerApplication }: NavContext): DashboardNavItem[] {
  const iconSize = 20;
  const caps = deriveAuthCapabilities({ role, brokerStatus, canList, hasBrokerApplication });

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

  if (caps.isApprovedBroker) {
    return [
      {
        id: "broker-workspace",
        label: "Broker Workspace",
        icon: <Briefcase size={iconSize} />,
        href: "/broker/properties",
        emphasis: true,
      },
      { id: "enquiries", label: "My Enquiries", icon: <MessageSquare size={iconSize} /> },
      { id: "saved", label: "Saved Properties", icon: <Heart size={iconSize} /> },
      { id: "profile", label: "Profile", icon: <User size={iconSize} /> },
    ];
  }

  if (caps.isPendingBroker || caps.isRejectedBroker) {
    const items: DashboardNavItem[] = [
      { id: "application", label: "Broker Application", icon: <ClipboardList size={iconSize} /> },
      { id: "enquiries", label: "My Enquiries", icon: <MessageSquare size={iconSize} /> },
      { id: "saved", label: "Saved Properties", icon: <Heart size={iconSize} /> },
    ];
    if (caps.canList) {
      items.push(
        { id: "overview", label: "Today's Work", icon: <LayoutDashboard size={iconSize} /> },
        { id: "properties", label: "My Properties", icon: <Building2 size={iconSize} /> },
        { id: "post", label: "Post Property", icon: <PlusCircle size={iconSize} /> },
        { id: "leads", label: "Leads", icon: <Users size={iconSize} /> }
      );
    }
    items.push({ id: "profile", label: "Profile", icon: <User size={iconSize} /> });
    return items;
  }

  if (caps.canList) {
    return [
      { id: "overview", label: "Overview", icon: <LayoutDashboard size={iconSize} /> },
      { id: "properties", label: "My Properties", icon: <Building2 size={iconSize} /> },
      { id: "post", label: "Post Property", icon: <PlusCircle size={iconSize} /> },
      { id: "leads", label: "Leads", icon: <Users size={iconSize} /> },
      { id: "enquiries", label: "My Enquiries", icon: <MessageSquare size={iconSize} /> },
      { id: "saved", label: "Saved Properties", icon: <Heart size={iconSize} /> },
      { id: "profile", label: "Profile", icon: <User size={iconSize} /> },
    ];
  }

  return [
    { id: "enquiries", label: "My Enquiries", icon: <MessageSquare size={iconSize} /> },
    { id: "saved", label: "Saved Properties", icon: <Heart size={iconSize} /> },
    { id: "requirements", label: "My Requirements", icon: <ClipboardList size={iconSize} /> },
    { id: "post", label: "List a Property", icon: <PlusCircle size={iconSize} /> },
    { id: "profile", label: "Profile", icon: <User size={iconSize} /> },
  ];
}

export function getDefaultTab(ctx: NavContext): DashboardTab {
  const caps = deriveAuthCapabilities(ctx);
  if (caps.isApprovedBroker) return "enquiries";
  if (caps.isPendingBroker || caps.isRejectedBroker) return "application";
  if (caps.canList) return "overview";
  return "enquiries";
}

