import type { ReactNode } from "react";

export type DashboardTab =
  | "overview"
  | "properties"
  | "post"
  | "leads"
  | "enquiries"
  | "saved"
  | "profile"
  | "application"
  | "requirements";

export interface DashboardNavItem {
  id: DashboardTab;
  label: string;
  icon: ReactNode;
}

export interface DashboardStats {
  totalProperties: number;
  liveProperties: number;
  totalLeads: number;
  newLeads: number;
}

export interface PropertyRow {
  id: string;
  title: string;
  propertyType: string;
  locality?: string;
  city: string;
  address?: string;
  price: number;
  status: string;
  listingStatus?: string;
  visibilityType?: string;
  coverImage?: string | null;
  images?: string[];
  bedrooms?: number | null;
  latestFreshness?: {
    availabilityStatus: string;
    confirmedAt?: string;
    expiresAt?: string | null;
    note?: string | null;
  } | null;
  _count?: { enquiries: number };
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardRequirement {
  id: string;
  description: string;
  propertyType: string;
  locality?: string;
  city: string;
  budgetMin: number | null;
  budgetMax: number | null;
  matchedPropertiesCount: number;
  status?: string;
  urgency?: string;
  clientSeriousness?: string;
  notes?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

export interface LeadRow {
  id: string;
  customerName: string;
  phone: string;
  propertyTitle: string;
  propertySlug?: string;
  message: string;
  date: string;
  status: string;
  visitDate?: string | null;
}

export interface SavedProperty {
  id: string;
  title: string;
  city: string;
  price: number;
  coverImage: string | null;
  images: string[];
  propertyType: string;
  slug: string;
}
