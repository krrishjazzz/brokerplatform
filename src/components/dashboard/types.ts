import type { ReactNode } from "react";

export type DashboardTab =
  | "overview"
  | "properties"
  | "post"
  | "leads"
  | "enquiries"
  | "visits"
  | "closure-support"
  | "saved"
  | "profile"
  | "application"
  | "requirements";

export interface DashboardNavItem {
  id: DashboardTab | "broker-workspace";
  label: string;
  icon: ReactNode;
  href?: string;
  emphasis?: boolean;
}

export interface OwnerListingAnalytics {
  views7d: number;
  searchImpressions7d: number;
  clicks7d: number;
  saves7d: number;
  enquiries7d: number;
  visits7d: number;
  viewToEnquiryRate: number;
  viewToVisitRate: number;
  avgQualityScore: number;
}

export interface DashboardStats {
  totalProperties: number;
  liveProperties: number;
  pendingReview?: number;
  totalLeads: number;
  newLeads: number;
  visitRequests?: number;
  analytics?: OwnerListingAnalytics;
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
  listingQualityScore?: number;
  listingQualityBreakdown?: string | Record<string, number>;
  viewCount?: number;
  searchImpressionCount?: number;
  clickCount?: number;
  enquiryCount?: number;
  visitCount?: number;
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
