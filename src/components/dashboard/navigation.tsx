import {
  Briefcase,
  Building2,
  ClipboardList,
  Heart,
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  User,
  Users,
} from "lucide-react";
import type { DashboardNavItem, DashboardTab } from "./types";

type NavContext = {
  role: string;
  brokerStatus?: string | null;
  canList?: boolean;
};

export function getNavItems({ role, brokerStatus, canList }: NavContext): DashboardNavItem[] {
  const iconSize = 20;
  const listingAllowed = Boolean(canList || role === "OWNER" || role === "BROKER" || role === "ADMIN");

  if (brokerStatus === "APPROVED") {
    const items: DashboardNavItem[] = [
      {
        id: "broker-workspace",
        label: "Broker Workspace",
        icon: <Briefcase size={iconSize} />,
        href: "/broker/properties",
        emphasis: true,
      },
      { id: "enquiries", label: "My Enquiries", icon: <MessageSquare size={iconSize} /> },
      { id: "saved", label: "Saved Properties", icon: <Heart size={iconSize} /> },
    ];
    if (listingAllowed) {
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

  if (brokerStatus === "PENDING" || brokerStatus === "REJECTED") {
    const items: DashboardNavItem[] = [
      { id: "application", label: "Broker Application", icon: <ClipboardList size={iconSize} /> },
      { id: "enquiries", label: "My Enquiries", icon: <MessageSquare size={iconSize} /> },
      { id: "saved", label: "Saved Properties", icon: <Heart size={iconSize} /> },
    ];
    if (listingAllowed) {
      items.push(
        { id: "post", label: "Post Property", icon: <PlusCircle size={iconSize} /> },
        { id: "properties", label: "My Properties", icon: <Building2 size={iconSize} /> }
      );
    }
    items.push({ id: "profile", label: "Profile", icon: <User size={iconSize} /> });
    return items;
  }

  if (role === "CUSTOMER") {
    return [
      { id: "enquiries", label: "My Enquiries", icon: <MessageSquare size={iconSize} /> },
      { id: "saved", label: "Saved Properties", icon: <Heart size={iconSize} /> },
      { id: "post", label: "List a Property", icon: <PlusCircle size={iconSize} /> },
      { id: "profile", label: "Profile", icon: <User size={iconSize} /> },
    ];
  }

  return [
    { id: "overview", label: "Today's Work", icon: <LayoutDashboard size={iconSize} /> },
    { id: "properties", label: "My Properties", icon: <Building2 size={iconSize} /> },
    { id: "post", label: "Post Property", icon: <PlusCircle size={iconSize} /> },
    { id: "leads", label: "Leads", icon: <Users size={iconSize} /> },
    { id: "enquiries", label: "My Enquiries", icon: <MessageSquare size={iconSize} /> },
    { id: "saved", label: "Saved Properties", icon: <Heart size={iconSize} /> },
    { id: "apply-broker", label: "Become a Broker", icon: <Briefcase size={iconSize} /> },
    { id: "profile", label: "Profile", icon: <User size={iconSize} /> },
  ];
}

export function getDefaultTab({ role, brokerStatus }: NavContext): DashboardTab {
  if (brokerStatus === "APPROVED") return "enquiries";
  if (brokerStatus === "PENDING" || brokerStatus === "REJECTED") return "application";
  if (role === "CUSTOMER") return "enquiries";
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
