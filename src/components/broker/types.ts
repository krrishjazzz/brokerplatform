export type BadgeVariant = "default" | "success" | "warning" | "error" | "blue" | "accent";

export interface BrokerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BrokerProperty {
  id: string;
  slug: string;
  title: string;
  description: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  price: number;
  listingType: string;
  category: string;
  propertyType: string;
  coverImage: string | null;
  images: string[];
  amenities: string[];
  assignedBrokerId: string | null;
  assignedBroker?: {
    id?: string;
    name: string;
    phone?: string;
  } | null;
  postedById?: string;
  postedBy?: {
    id: string;
    name: string | null;
    role?: string;
    phone?: string;
  };
  publicBrokerName: string;
  sourceType?: string;
  sourceLabel?: string;
  sourceName?: string;
  sourcePhone?: string;
  verified?: boolean;
  area: number;
  areaUnit: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  floor?: number | null;
  totalFloors?: number | null;
  ageYears?: number | null;
  furnishing: string | null;
  visibilityType?: string;
  listingStatus: string;
  status: string;
  matchingRequirementsCount: number;
  createdAt?: string;
  updatedAt: string;
}

export interface BrokerRequirement {
  id: string;
  description: string;
  propertyType: string;
  locality: string;
  city: string;
  budgetMin: number | null;
  budgetMax: number | null;
  status: string;
  urgency: string;
  clientSeriousness: string;
  matchedPropertiesCount: number;
  createdAt: string;
  broker: {
    id: string;
    name: string;
    phone?: string;
  };
}

export interface BrokerMatchedRequirement extends BrokerRequirement {
  match?: { score: number; label: string; variant: BadgeVariant; reasons: string[] };
}

export interface BrokerMatchedProperty extends BrokerProperty {
  match?: { score: number; label: string; variant: BadgeVariant; reasons: string[] };
}

export type MatchFocus = "all" | "matched" | "unmatched";
