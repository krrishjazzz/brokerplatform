export type CrmStage = "NEW" | "CONTACTED" | "VISIT_SCHEDULED" | "NEGOTIATION" | "WON" | "LOST";
export type CrmSeriousness = "HOT" | "WARM" | "COLD";
export type CrmIntent = "BUY" | "RENT" | "LEASE" | "SELL";

export type BrokerCrmClient = {
  id: string;
  name: string;
  phone: string;
  altPhone: string | null;
  email: string | null;
  intent: CrmIntent;
  city: string;
  localities: string[];
  propertyTypes: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  bhk: number | null;
  stage: CrmStage;
  seriousness: CrmSeriousness;
  source: string;
  notes: string;
  shortlistedIds: string[];
  nextFollowUpAt: string | null;
  lastContactAt: string | null;
  enquiryId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BrokerCrmTask = {
  id: string;
  clientId: string | null;
  propertyId: string | null;
  type: string;
  title: string;
  note: string | null;
  dueAt: string;
  status: string;
  client: { id: string; name: string; phone: string } | null;
  createdAt: string;
};

export type BrokerCrmListing = {
  id: string;
  slug: string;
  title: string;
  city: string;
  locality: string;
  propertyType: string;
  listingType: string;
  price: number;
  area: number;
  areaUnit: string;
  coverImage: string | null;
  listingStatus: string;
  status: string;
  enquiryCount: number;
  viewCount: number;
  updatedAt: string;
};

export type BrokerCrmShare = {
  id: string;
  clientId: string;
  propertyId: string | null;
  propertyIds: string[];
  messageBody: string;
  templateKey: string | null;
  channel: string;
  createdAt: string;
};

export const CRM_STAGE_OPTIONS: { value: CrmStage; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "VISIT_SCHEDULED", label: "Visit" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
];
