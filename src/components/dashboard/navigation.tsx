import { Briefcase, Building2, ClipboardList, Heart, LayoutDashboard, MessageSquare, PlusCircle, User, Users } from "lucide-react";
import type { DashboardNavItem, DashboardTab } from "./types";

export function getNavItems(role: string, brokerStatus?: string | null): DashboardNavItem[] {
  const iconSize = 20;
  if (role === "CUSTOMER") {
    return [
      { id: "enquiries", label: "My Enquiries", icon: <MessageSquare size={iconSize} /> },
      { id: "saved", label: "Saved Properties", icon: <Heart size={iconSize} /> },
      { id: "post", label: "Post Property", icon: <PlusCircle size={iconSize} /> },
      { id: "apply-broker", label: "Become a Broker", icon: <Briefcase size={iconSize} /> },
      { id: "profile", label: "Profile", icon: <User size={iconSize} /> },
    ];
  }
  if (role === "BROKER" && brokerStatus !== "APPROVED") {
    return [
      { id: "application", label: "Application Status", icon: <ClipboardList size={iconSize} /> },
      { id: "profile", label: "Profile", icon: <User size={iconSize} /> },
    ];
  }
  const items: DashboardNavItem[] = [
    { id: "overview", label: "Today's Work", icon: <LayoutDashboard size={iconSize} /> },
    { id: "properties", label: "My Properties", icon: <Building2 size={iconSize} /> },
    { id: "post", label: "Post Property", icon: <PlusCircle size={iconSize} /> },
    { id: "leads", label: "Leads", icon: <Users size={iconSize} /> },
  ];
  if (role === "OWNER") {
    items.push(
      { id: "enquiries", label: "My Enquiries", icon: <MessageSquare size={iconSize} /> },
      { id: "saved", label: "Saved Properties", icon: <Heart size={iconSize} /> },
      { id: "apply-broker", label: "Become a Broker", icon: <Briefcase size={iconSize} /> }
    );
  }
  if (role === "BROKER") {
    items.push({ id: "requirements", label: "Requirements", icon: <ClipboardList size={iconSize} /> });
  }
  items.push({ id: "profile", label: "Profile", icon: <User size={iconSize} /> });
  return items;
}

export function getDefaultTab(role: string, brokerStatus?: string | null): DashboardTab {
  if (role === "CUSTOMER") return "enquiries";
  if (role === "BROKER" && brokerStatus !== "APPROVED") return "application";
  return "overview";
}

export const validTabs: DashboardTab[] = [
  "overview",
  "properties",
  "post",
  "leads",
  "enquiries",
  "saved",
  "profile",
  "application",
  "requirements",
  "apply-broker",
];
