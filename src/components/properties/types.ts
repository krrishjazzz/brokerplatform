export interface Property {
  id: string;
  slug: string;
  title: string;
  listingType: string;
  category: string;
  propertyType: string;
  price: number;
  area: number;
  areaUnit: string;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  totalFloors: number | null;
  locality: string;
  city: string;
  address: string;
  images: string[];
  coverImage: string | null;
  furnishing: string | null;
  amenities: string[];
  listingStatus: string;
  status: string;
  visibilityType: string;
  createdAt: string;
  updatedAt: string;
  publicBrokerName: string;
  verified: boolean;
  ownerListed?: boolean;
  readyToVisit?: boolean;
  postedBy: { name: string | null; role: string };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SearchRequirementForm {
  name: string;
  phone: string;
  requirementType: string;
  locality: string;
  city: string;
  budgetMax: string;
  urgency: string;
  note: string;
}
