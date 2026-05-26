import {
  LayoutDashboard,
  Building,
  Clock,
  Users,
  UserCheck,
  MessageSquare,
  Settings,
  MapPin,
  ClipboardList,
} from "lucide-react";

export type AdminTab =
  | "dashboard"
  | "pending-properties"
  | "all-properties"
  | "all-requirements"
  | "pending-brokers"
  | "all-users"
  | "all-leads"
  | "locations"
  | "settings";

export const ADMIN_NAV_ITEMS: { label: string; value: AdminTab; icon: React.ReactNode }[] = [
  { label: "Dashboard", value: "dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Pending Properties", value: "pending-properties", icon: <Clock size={18} /> },
  { label: "All Properties", value: "all-properties", icon: <Building size={18} /> },
  { label: "All Requirements", value: "all-requirements", icon: <ClipboardList size={18} /> },
  { label: "Pending Brokers", value: "pending-brokers", icon: <UserCheck size={18} /> },
  { label: "All Users", value: "all-users", icon: <Users size={18} /> },
  { label: "All Leads", value: "all-leads", icon: <MessageSquare size={18} /> },
  { label: "Locations", value: "locations", icon: <MapPin size={18} /> },
  { label: "Settings", value: "settings", icon: <Settings size={18} /> },
];
