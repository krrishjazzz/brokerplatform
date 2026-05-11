"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  BellRing,
  Building2,
  Eye,
  Filter,
  Loader2,
  MapPin,
  MessageCircle,
  Network,
  Phone,
  Search,
  Share,
  Target,
  UserCheck,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { cn, formatPrice } from "@/lib/utils";
import { PROPERTY_TYPES, INDIAN_CITIES } from "@/lib/constants";
import { getVisibilityLabel } from "@/lib/visibility";

interface Property {
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
    name: string;
    phone?: string;
  } | null;
  publicBrokerName: string;
  sourceType?: string;
  sourceLabel?: string;
  sourceName?: string;
  sourcePhone?: string;
  verified: boolean;
  area: number;
  areaUnit: string;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  totalFloors: number | null;
  ageYears: number | null;
  furnishing: string | null;
  visibilityType: string;
  listingStatus: string;
  status: string;
  matchingRequirementsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface MatchedRequirement {
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
  match?: { score: number; label: string; variant: BadgeVariant; reasons: string[] };
  matchedPropertiesCount: number;
  createdAt: string;
  broker: {
    id: string;
    name: string;
    phone?: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type BadgeVariant = "default" | "success" | "warning" | "error" | "blue" | "accent";

const QUICK_FILTERS = [
  { label: "High match", action: "matches" },
  { label: "Fresh", action: "fresh" },
  { label: "Office", action: "office" },
  { label: "Warehouse", action: "warehouse" },
  { label: "Rent", action: "rent" },
];

function getBrokerSpecs(property: Property) {
  const type = property.propertyType.toLowerCase();
  const specs: { label: string; value: string }[] = [
    { label: "Area", value: `${Math.round(property.area).toLocaleString()} ${property.areaUnit}` },
  ];

  if (/(apartment|villa|house|penthouse|studio|row)/.test(type)) {
    if (property.bedrooms) specs.push({ label: "Beds", value: `${property.bedrooms} BHK` });
    if (property.bathrooms) specs.push({ label: "Bath", value: `${property.bathrooms}` });
    if (property.floor != null) specs.push({ label: "Floor", value: property.totalFloors != null ? `${property.floor}/${property.totalFloors}` : `${property.floor}` });
  } else if (/(office|co-working|shop|showroom)/.test(type)) {
    specs.push({ label: "Use", value: property.propertyType });
    specs.push({ label: "Fit-out", value: property.furnishing || "Ask" });
    specs.push({ label: "Parking", value: property.amenities.includes("Parking") ? "Yes" : "Ask" });
  } else if (/(warehouse|industrial|factory)/.test(type)) {
    specs.push({ label: "Access", value: "Truck Ask" });
    specs.push({ label: "Power", value: property.amenities.includes("Power Backup") ? "Backup" : "Check" });
    specs.push({ label: "Use", value: property.propertyType });
  } else if (/(plot|land)/.test(type)) {
    specs.push({ label: "Plot", value: property.propertyType });
    specs.push({ label: "Road", value: "Ask" });
    specs.push({ label: "Facing", value: "Ask" });
  } else {
    if (property.furnishing) specs.push({ label: "Furnishing", value: property.furnishing });
    specs.push({ label: "Type", value: property.propertyType });
  }

  return specs.slice(0, 4);
}

function getFreshness(updatedAt: string) {
  const days = Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return { label: "Updated today", variant: "success" as const, isFresh: true };
  if (days < 7) return { label: `${days}d fresh`, variant: "success" as const, isFresh: true };
  if (days < 21) return { label: `${days}d old`, variant: "warning" as const, isFresh: false };
  return { label: "Needs check", variant: "error" as const, isFresh: false };
}

function getAvailability(property: Property) {
  const availability = property.listingStatus || property.status;
  const label = availability === "ON_HOLD" ? "On Hold" : availability.replaceAll("_", " ");
  const variant: BadgeVariant =
    availability === "AVAILABLE" || availability === "LIVE"
      ? "success"
      : availability === "ON_HOLD" || availability === "PENDING"
      ? "warning"
      : "default";
  return { label, variant };
}

function getListingVariant(type: string): BadgeVariant {
  if (type === "BUY") return "blue";
  if (type === "RENT") return "success";
  if (type === "LEASE") return "accent";
  return "default";
}

export default function BrokerPropertiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListingType, setSelectedListingType] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>("");
  const [selectedLocality, setSelectedLocality] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<string>("");
  const [clientFocus, setClientFocus] = useState<"all" | "matches" | "fresh">("all");
  const [page, setPage] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [matchProperty, setMatchProperty] = useState<Property | null>(null);
  const [matchedRequirements, setMatchedRequirements] = useState<MatchedRequirement[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextCity = params.get("city") || "";
    const nextLocality = params.get("locality") || "";
    const nextPropertyType = params.get("propertyType") || "";
    const nextMinPrice = params.get("minPrice") || "";
    const nextMaxPrice = params.get("maxPrice") || "";

    if (nextCity) setSelectedCity(nextCity);
    if (nextLocality) setSelectedLocality(nextLocality);
    if (nextPropertyType) setSelectedPropertyType(nextPropertyType);
    if (nextMinPrice) setMinPrice(nextMinPrice);
    if (nextMaxPrice) setMaxPrice(nextMaxPrice);
  }, []);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedListingType) params.set("listingType", selectedListingType);
      if (selectedCategory) params.set("category", selectedCategory);
      if (selectedPropertyType) params.set("propertyType", selectedPropertyType);
      if (selectedLocality) params.set("locality", selectedLocality);
      if (selectedCity) params.set("city", selectedCity);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (selectedSort) params.set("sort", selectedSort);
      params.set("page", String(page));

      const res = await fetch(`/api/broker/properties?${params}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
        setPagination(data.pagination || null);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedListingType, selectedCategory, selectedPropertyType, selectedLocality, selectedCity, minPrice, maxPrice, selectedSort, page]);

  useEffect(() => {
    if (user?.role === "BROKER" && user.brokerStatus === "APPROVED") {
      fetchProperties();
    } else {
      router.push("/login");
    }
  }, [user, router, fetchProperties]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedListingType("");
    setSelectedCategory("");
    setSelectedPropertyType("");
    setSelectedLocality("");
    setSelectedCity("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedSort("");
    setClientFocus("all");
    setPage(1);
  };

  const trackBrokerAction = async (payload: Record<string, unknown>) => {
    await fetch("/api/broker/collaborations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }).catch(() => {});
  };

  const handleContactBroker = (phone: string, property?: Property) => {
    if (property) {
      trackBrokerAction({
        propertyId: property.id,
        eventType: "BROKER_CALL_CLICKED",
        recipientId: property.assignedBrokerId || undefined,
        metadata: { source: "BROKER_PROPERTY_LIST" },
      });
    }
    if (!phone || phone.includes("XXXX")) {
      toast("Broker phone is not available.", "error");
      return;
    }
    window.open(`tel:${phone}`, "_self");
  };

  const handleWhatsApp = (phone: string, property: Property) => {
    if (!phone || phone.includes("XXXX")) {
      toast("Broker WhatsApp is not available.", "error");
      return;
    }
    trackBrokerAction({
      propertyId: property.id,
      eventType: "BROKER_WHATSAPP_CLICKED",
      recipientId: property.assignedBrokerId || undefined,
      metadata: { source: "BROKER_PROPERTY_LIST" },
    });
    const message = [
      `KrrishJazz Broker Network`,
      `${property.title}`,
      `Location: ${property.city}`,
      `Type: ${property.propertyType}`,
      `Price: ${formatPrice(property.price)}`,
      `Area: ${Math.round(property.area).toLocaleString()} ${property.areaUnit}`,
      `Availability: ${(property.listingStatus || property.status).replaceAll("_", " ")}`,
      `Matches: ${property.matchingRequirementsCount} requirement(s)`,
      ``,
      `Please confirm availability, brokerage terms, and site visit possibility.`,
    ].join("\n");
    window.open(`https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleShare = (property: Property) => {
    trackBrokerAction({
      propertyId: property.id,
      eventType: "PROPERTY_SHARED",
      recipientId: property.assignedBrokerId || undefined,
      metadata: { channel: typeof navigator.share === "function" ? "NATIVE_SHARE" : "CLIPBOARD", source: "BROKER_PROPERTY_LIST" },
    });
    const shareText = [
      `${property.title} - ${formatPrice(property.price)}`,
      `${property.propertyType} in ${property.city}`,
      `${Math.round(property.area).toLocaleString()} ${property.areaUnit}`,
      `Availability: ${(property.listingStatus || property.status).replaceAll("_", " ")}`,
      `Matches: ${property.matchingRequirementsCount} requirement(s)`,
      `${window.location.origin}/properties/${property.slug}`,
    ].join("\n");

    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: shareText,
        url: `${window.location.origin}/properties/${property.slug}`,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast("Broker share text copied.", "success");
    }
  };

  const handleFindRequirements = async (property: Property) => {
    setSelectedProperty(null);
    setMatchProperty(property);
    setMatchedRequirements([]);
    setMatchesLoading(true);
    const params = new URLSearchParams({
      mode: "property",
      id: property.id,
      limit: "8",
    });

    try {
      const res = await fetch(`/api/broker/matches?${params}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setMatchedRequirements(data.requirements || []);
      }
    } catch (error) {
      console.error("Failed to fetch matching requirements:", error);
    } finally {
      setMatchesLoading(false);
    }
  };

  const handleSendPropertyToRequirement = (requirement: MatchedRequirement, property: Property) => {
    const message = [
      "KrrishJazz Property Match",
      `${property.title}`,
      `Location: ${property.city}`,
      `Type: ${property.propertyType}`,
      `Price: ${formatPrice(property.price)}`,
      `Area: ${Math.round(property.area).toLocaleString()} ${property.areaUnit}`,
      "",
      `Matching requirement: ${requirement.description}`,
      `Requirement budget: ${getRequirementBudget(requirement)}`,
      "",
      "This looks like a match. Please confirm client seriousness, brokerage terms, and site visit timing.",
    ].join("\n");

    trackBrokerAction({
      propertyId: property.id,
      requirementId: requirement.id,
      eventType: "PROPERTY_SHARED",
      recipientId: requirement.broker.id,
      metadata: { channel: "WHATSAPP", matchScore: requirement.match?.score || null },
    });

    const brokerPhone = requirement.broker.phone || "";
    if (!brokerPhone || brokerPhone.includes("XXXX")) {
      toast("Requirement broker phone is not available yet.", "error");
      return;
    }
    window.open(`https://wa.me/${brokerPhone.replace(/^\+/, "")}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const applyQuickFilter = (action: string) => {
    setPage(1);
    if (action === "matches") setClientFocus(clientFocus === "matches" ? "all" : "matches");
    if (action === "fresh") setClientFocus(clientFocus === "fresh" ? "all" : "fresh");
    if (action === "office") {
      setSelectedCategory("COMMERCIAL");
      setSelectedPropertyType("Office");
      setClientFocus("all");
    }
    if (action === "warehouse") {
      setSelectedCategory("COMMERCIAL");
      setSelectedPropertyType("Warehouse");
      setClientFocus("all");
    }
    if (action === "rent") {
      setSelectedListingType("RENT");
      setClientFocus("all");
    }
  };

  if (!user || user.role !== "BROKER" || user.brokerStatus !== "APPROVED") {
    return null;
  }

  const freshListings = properties.filter((property) => getFreshness(property.updatedAt).isFresh).length;
  const hotMatches = properties.reduce((sum, property) => sum + property.matchingRequirementsCount, 0);
  const highMatchListings = properties.filter((property) => property.matchingRequirementsCount > 0).length;
  const onHold = properties.filter((property) => property.listingStatus === "ON_HOLD").length;
  const followUpCount = properties.filter((property) => property.matchingRequirementsCount > 0 || getFreshness(property.updatedAt).isFresh === false).length;
  const activeFiltersCount = [searchQuery, selectedListingType, selectedCategory, selectedPropertyType, selectedLocality, selectedCity, minPrice, maxPrice, selectedSort].filter(Boolean).length;

  const visibleProperties = properties.filter((property) => {
    if (clientFocus === "matches") return property.matchingRequirementsCount > 0;
    if (clientFocus === "fresh") return getFreshness(property.updatedAt).isFresh;
    return true;
  });

  return (
    <main className="min-h-screen bg-surface pb-20 lg:pb-8">
      <section className="bg-primary text-white">
        <div className="mx-auto max-w-7xl px-4 py-7 lg:px-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-pill border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85">
                <Network size={14} />
                Broker inventory exchange
              </div>
              <h1 className="text-3xl font-semibold sm:text-4xl">Broker Network Properties</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                Scan broker-visible inventory, match requirements, and contact verified brokers directly while customers still see KrrishJazz.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => router.push("/broker/requirements")}>
                  <Target size={15} className="mr-2" />
                  View demand desk
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setClientFocus("matches")} className="border border-white/20 text-white hover:bg-white/10">
                  <BellRing size={15} className="mr-2" />
                  Show hot matches
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="Inventory" value={properties.length} tone="default" />
              <MetricCard label="Fresh" value={freshListings} tone="success" />
              <MetricCard label="Matched" value={hotMatches} tone="accent" />
              <MetricCard label="On hold" value={onHold} tone="warning" />
            </div>
          </div>

          <div className="mt-5 rounded-card border border-white/15 bg-white p-2 shadow-card">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <div className="relative min-h-12 flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      setPage(1);
                      fetchProperties();
                    }
                  }}
                  placeholder="Search title, locality, city, property type..."
                  className="h-12 w-full rounded-btn bg-surface pl-10 pr-3 text-sm outline-none placeholder:text-text-secondary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { setPage(1); fetchProperties(); }} variant="accent" className="flex-1 lg:flex-none">
                  Search
                </Button>
                <Button onClick={() => setFiltersOpen(!filtersOpen)} variant="ghost" className="flex-1 lg:flex-none">
                  <Filter size={16} className="mr-2" />
                  Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </Button>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2 border-t border-border pt-2">
              {QUICK_FILTERS.map((filter) => (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => applyQuickFilter(filter.action)}
                  className={cn(
                    "rounded-pill border px-3 py-1.5 text-xs font-medium transition-colors",
                    (filter.action === clientFocus || (filter.action === "rent" && selectedListingType === "RENT") || (filter.action === "office" && selectedPropertyType === "Office") || (filter.action === "warehouse" && selectedPropertyType === "Warehouse"))
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-surface text-text-secondary hover:border-primary/40 hover:text-primary"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-primary lg:grid-cols-3">
            <BrokerWorkflowCard icon={<Search size={16} />} title="Find inventory" text="Use city, type, and budget filters before sharing." />
            <BrokerWorkflowCard icon={<Target size={16} />} title="Match demand" text="Open matching requirements from every property card." />
            <BrokerWorkflowCard icon={<MessageCircle size={16} />} title="Close faster" text="Call or WhatsApp verified brokers with ready-to-send property context." />
          </div>

          <div className="mt-3 rounded-card border border-white/15 bg-white/10 p-3 text-white">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Broker CRM cue</p>
                <p className="mt-1 text-xs leading-5 text-white/75">
                  {followUpCount} listing{followUpCount === 1 ? "" : "s"} need follow-up from matches or freshness checks.
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setClientFocus("matches")} className="border border-white/20 text-white hover:bg-white/10">
                Open follow-ups
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 lg:flex-row lg:px-6">
        <aside className={cn("h-fit shrink-0 rounded-card border border-border bg-white p-4 shadow-card lg:sticky lg:top-20 lg:w-72", filtersOpen ? "block" : "hidden")}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Deal filters</h2>
              <p className="text-xs text-text-secondary">Narrow inventory for matching</p>
            </div>
            <button type="button" onClick={clearFilters} className="text-xs font-semibold text-primary hover:text-accent">
              Clear
            </button>
          </div>

          <div className="space-y-5">
            <FilterBlock label="Listing Type">
              <div className="flex flex-wrap gap-1.5">
                {["BUY", "RENT", "LEASE"].map((type) => (
                  <ChipButton key={type} active={selectedListingType === type} onClick={() => { setSelectedListingType(selectedListingType === type ? "" : type); setPage(1); }}>
                    {type}
                  </ChipButton>
                ))}
              </div>
            </FilterBlock>

            <FilterBlock label="Category">
              <select
                value={selectedCategory}
                onChange={(event) => {
                  setSelectedCategory(event.target.value);
                  setSelectedPropertyType("");
                  setPage(1);
                }}
                className="w-full rounded-btn border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Categories</option>
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="INDUSTRIAL">Industrial</option>
                <option value="AGRICULTURAL">Agricultural</option>
                <option value="HOSPITALITY">Hospitality</option>
              </select>
            </FilterBlock>

            <FilterBlock label="Property Type">
              <select
                value={selectedPropertyType}
                onChange={(event) => { setSelectedPropertyType(event.target.value); setPage(1); }}
                className="w-full rounded-btn border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Property Types</option>
                {selectedCategory && PROPERTY_TYPES[selectedCategory as keyof typeof PROPERTY_TYPES]?.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
                {!selectedCategory && Object.values(PROPERTY_TYPES).flat().map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </FilterBlock>

            <FilterBlock label="City">
              <select
                value={selectedCity}
                onChange={(event) => { setSelectedCity(event.target.value); setPage(1); }}
                className="w-full rounded-btn border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Cities</option>
                {INDIAN_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </FilterBlock>

            <FilterBlock label="Locality">
              <Input
                placeholder="Salt Lake, Park Street..."
                value={selectedLocality}
                onChange={(event) => { setSelectedLocality(event.target.value); setPage(1); }}
              />
            </FilterBlock>

            <FilterBlock label="Budget">
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" placeholder="Min" value={minPrice} onChange={(event) => { setMinPrice(event.target.value); setPage(1); }} />
                <Input type="number" placeholder="Max" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value); setPage(1); }} />
              </div>
            </FilterBlock>

            <FilterBlock label="Sort">
              <select
                value={selectedSort}
                onChange={(event) => { setSelectedSort(event.target.value); setPage(1); }}
                className="w-full rounded-btn border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Newest first</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </FilterBlock>

            <Button onClick={() => { setFiltersOpen(false); fetchProperties(); }} className="w-full" size="sm">
              Apply Filters
            </Button>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-4 rounded-card border border-border bg-white p-4 shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {visibleProperties.length} properties ready for broker action
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {highMatchListings} with matching requirements, {freshListings} fresh this week.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="accent">{hotMatches} total matches</Badge>
                <Badge variant="success">{freshListings} fresh</Badge>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex h-96 items-center justify-center rounded-card border border-border bg-white shadow-card">
              <Loader2 size={38} className="animate-spin text-primary" />
            </div>
          ) : visibleProperties.length === 0 ? (
            <div className="rounded-card border border-dashed border-border bg-white p-8 shadow-card">
              <div className="mx-auto max-w-xl text-center">
                <Building2 size={54} className="mx-auto mb-4 text-primary" />
                <h3 className="mb-2 text-lg font-semibold text-foreground">No broker-visible inventory yet</h3>
                <p className="text-sm leading-6 text-text-secondary">Try a broader locality, remove tight budget filters, or post your own supply with the right visibility mode.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Button onClick={clearFilters} variant="outline">Clear filters</Button>
                  <Button onClick={() => router.push("/dashboard?tab=post")}>Post supply</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {visibleProperties.map((property) => (
                <BrokerPropertyCard
                  key={property.id}
                  property={property}
                  onViewDetails={setSelectedProperty}
                  onContactBroker={handleContactBroker}
                  onWhatsApp={handleWhatsApp}
                  onShare={handleShare}
                  onFindRequirements={handleFindRequirements}
                />
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && clientFocus === "all" && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((next) => next - 1)}>
                Previous
              </Button>
              <span className="text-sm text-text-secondary">Page {page} of {pagination.totalPages}</span>
              <Button variant="ghost" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((next) => next + 1)}>
                Next
              </Button>
            </div>
          )}
        </section>
      </div>

      <BrokerPropertyDetailsModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onFindRequirements={handleFindRequirements}
        onWhatsApp={handleWhatsApp}
      />

      <MatchingRequirementsDrawer
        property={matchProperty}
        requirements={matchedRequirements}
        loading={matchesLoading}
        onClose={() => setMatchProperty(null)}
        onCallBroker={handleContactBroker}
        onSendProperty={handleSendPropertyToRequirement}
        onShareProperty={handleShare}
        onTrackAction={trackBrokerAction}
      />

      <div className="fixed inset-x-3 bottom-3 z-30 rounded-card border border-border bg-white p-2 shadow-modal lg:hidden">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => setFiltersOpen(!filtersOpen)} variant="outline" className="w-full">
            <Filter size={16} className="mr-2" />
            Filters
          </Button>
          <Button onClick={() => { setPage(1); fetchProperties(); }} variant="accent" className="w-full">
            Search
          </Button>
        </div>
      </div>
    </main>
  );
}

interface BrokerPropertyCardProps {
  property: Property;
  onViewDetails: (property: Property) => void;
  onContactBroker: (phone: string, property?: Property) => void;
  onWhatsApp: (phone: string, property: Property) => void;
  onShare: (property: Property) => void;
  onFindRequirements: (property: Property) => void;
}

function BrokerPropertyCard({ property, onViewDetails, onContactBroker, onWhatsApp, onShare, onFindRequirements }: BrokerPropertyCardProps) {
  const sourceLabel = property.sourceLabel || property.publicBrokerName || "Broker Network Property";
  const sourceName = property.sourceName || sourceLabel;
  const sourcePhone = property.sourcePhone || "";
  const sourceTone = property.sourceType === "YOUR_PROPERTY" ? "success" : property.sourceType === "KRRISHJAZZ_OWNER_PROPERTY" ? "blue" : "accent";
  const pricePerUnit = property.area ? Math.round(property.price / property.area) : 0;
  const freshness = getFreshness(property.updatedAt);
  const availability = getAvailability(property);
  const imageUrl = property.coverImage || property.images?.[0] || "";

  return (
    <article className="group overflow-hidden rounded-card border border-border bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <div className="grid lg:grid-cols-[260px_1fr]">
        <div className="relative h-56 overflow-hidden bg-surface lg:h-full">
          {imageUrl ? (
            <img src={imageUrl} alt={property.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          ) : (
            <div className="flex h-full items-center justify-center text-primary">
              <Building2 size={48} />
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <Badge variant={getListingVariant(property.listingType)}>{property.listingType}</Badge>
            <Badge variant={freshness.variant}>
              <BellRing size={11} className="mr-1" />
              {freshness.label}
            </Badge>
          </div>
          <button
            type="button"
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-card transition-colors hover:bg-primary-light"
            onClick={() => onContactBroker(sourcePhone, property)}
            aria-label="Call broker"
          >
            <Phone size={18} />
          </button>
          {property.matchingRequirementsCount > 0 && (
            <div className="absolute bottom-3 left-3 rounded-card bg-foreground/85 px-3 py-2 text-white backdrop-blur">
              <p className="text-xs text-white/70">Demand signal</p>
              <p className="text-sm font-semibold">{property.matchingRequirementsCount} matching req</p>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col p-4 lg:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_210px]">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant={availability.variant}>{availability.label}</Badge>
                {property.verified && (
                  <Badge variant="success">
                    <BadgeCheck size={11} className="mr-1" />
                    Verified
                  </Badge>
                )}
                <Badge variant={sourceTone as any}>{sourceLabel}</Badge>
                <Badge>{property.propertyType}</Badge>
              </div>
              <h2 className="line-clamp-2 text-xl font-semibold text-foreground">{property.title}</h2>
              <p className="mt-2 flex items-center gap-1 text-sm text-text-secondary">
                <MapPin size={14} className="shrink-0 text-primary" />
                <span className="line-clamp-1">{property.locality ? `${property.locality}, ` : ""}{property.address}, {property.city}</span>
              </p>
            </div>

            <div className="rounded-card border border-primary/15 bg-primary-light p-3 lg:text-right">
              <p className="text-xs font-semibold uppercase text-text-secondary">Broker price</p>
              <p className="mt-1 text-2xl font-bold text-primary">{formatPrice(property.price)}</p>
              {pricePerUnit > 0 && <p className="mt-1 text-xs text-text-secondary">Rs {pricePerUnit.toLocaleString()}/sqft</p>}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {getBrokerSpecs(property).map((spec) => (
              <div key={spec.label} className="rounded-btn border border-border bg-surface px-3 py-2">
                <p className="truncate text-sm font-semibold text-foreground">{spec.value}</p>
                <p className="mt-0.5 text-xs text-text-secondary">{spec.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 rounded-card border border-border bg-surface p-3 lg:grid-cols-[1fr_1fr_1fr]">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {sourceLabel.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{sourceName}</p>
                <p className="text-xs text-text-secondary">{sourceLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Target size={16} className="text-accent" />
              {property.matchingRequirementsCount} matching requirement{property.matchingRequirementsCount === 1 ? "" : "s"}
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <UserCheck size={16} className="text-success" />
              {sourcePhone || "Contact via KrrishJazz"}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-[1.4fr_1fr_auto] gap-2">
            <Button variant="accent" size="sm" onClick={() => onContactBroker(sourcePhone, property)} className="w-full">
              <Phone size={14} className="mr-2" />
              Call Broker
            </Button>
            <Button variant="outline" size="sm" onClick={() => onWhatsApp(sourcePhone, property)} className="w-full">
              <MessageCircle size={14} className="mr-2" />
              WhatsApp
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onViewDetails(property)} className="w-full" aria-label="Details">
              <Eye size={14} />
            </Button>
          </div>
          <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
            <Button variant="outline" size="sm" onClick={() => onFindRequirements(property)} className="w-full">
              <Target size={14} className="mr-2" />
              Match Requirement
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onShare(property)} className="w-full" aria-label="Share">
              <Share size={14} />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function BrokerPropertyDetailsModal({
  property,
  onClose,
  onFindRequirements,
  onWhatsApp,
}: {
  property: Property | null;
  onClose: () => void;
  onFindRequirements: (property: Property) => void;
  onWhatsApp: (phone: string, property: Property) => void;
}) {
  if (!property) return null;

  const images = property.images.length > 0 ? property.images : property.coverImage ? [property.coverImage] : [];
  const sourceLabel = property.sourceLabel || property.publicBrokerName || "Broker Network Property";
  const sourceName = property.sourceName || sourceLabel;
  const brokerPhone = property.sourcePhone || "";
  const freshness = getFreshness(property.updatedAt);
  const availability = getAvailability(property);
  const detailRows = [
    ["Listing Type", property.listingType],
    ["Category", property.category],
    ["Property Type", property.propertyType],
    ["Area", `${Math.round(property.area).toLocaleString()} ${property.areaUnit}`],
    ["Bedrooms", property.bedrooms ?? "N/A"],
    ["Bathrooms", property.bathrooms ?? "N/A"],
    ["Floor", property.floor != null && property.totalFloors != null ? `${property.floor} / ${property.totalFloors}` : "N/A"],
    ["Furnishing", property.furnishing || "N/A"],
    ["Age", property.ageYears != null ? `${property.ageYears} years` : "N/A"],
    ["Listing Reach", getVisibilityLabel(property.visibilityType)],
    ["Status", property.listingStatus || property.status],
    ["Matching Requirements", property.matchingRequirementsCount],
    ["Last Updated", new Date(property.updatedAt).toLocaleDateString("en-IN")],
  ];

  return (
    <Modal isOpen={Boolean(property)} onClose={onClose} title="Broker Property Details" className="max-w-5xl">
      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant={getListingVariant(property.listingType)}>{property.listingType}</Badge>
              <Badge variant={availability.variant}>{availability.label}</Badge>
              <Badge variant={freshness.variant}>{freshness.label}</Badge>
              {property.matchingRequirementsCount > 0 && <Badge variant="accent">{property.matchingRequirementsCount} matches</Badge>}
            </div>
            <h2 className="text-2xl font-semibold text-foreground">{property.title}</h2>
            <p className="mt-2 flex items-start gap-1 text-sm text-text-secondary">
              <MapPin size={14} className="mt-0.5 shrink-0" />
              {property.locality ? `${property.locality}, ` : ""}{property.address}, {property.city}, {property.state} {property.pincode}
            </p>
          </div>
          <div className="rounded-card border border-primary/20 bg-primary-light p-4 lg:text-right">
            <p className="text-xs font-semibold uppercase text-text-secondary">Network price</p>
            <p className="mt-1 text-2xl font-bold text-primary">{formatPrice(property.price)}</p>
            {property.area > 0 && (
              <p className="text-sm text-text-secondary">
                Rs {Math.round(property.price / property.area).toLocaleString()}/sqft
              </p>
            )}
          </div>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {images.slice(0, 6).map((image, index) => (
              <img key={`${image}-${index}`} src={image} alt={`${property.title} ${index + 1}`} className="h-36 w-full rounded-card border border-border object-cover" />
            ))}
          </div>
        )}

        <div className="grid gap-3 rounded-card border border-border bg-surface p-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-text-secondary">Supply Source</p>
            <p className="mt-1 font-semibold text-foreground">{sourceName}</p>
            <p className="text-xs text-text-secondary">{sourceLabel} · {brokerPhone || "Phone unavailable"}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Deal action</p>
            <p className="mt-1 font-semibold text-foreground">Call, WhatsApp, match requirements</p>
            <p className="text-xs text-text-secondary">Broker-to-broker contact is available here</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Demand signal</p>
            <p className="mt-1 font-semibold text-accent">{property.matchingRequirementsCount} requirement matches</p>
            <p className="text-xs text-text-secondary">Use Match to filter demand</p>
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-semibold text-foreground">Description</h3>
          <p className="text-sm leading-6 text-text-secondary">{property.description}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {detailRows.map(([label, value]) => (
            <div key={label} className="rounded-card border border-border bg-surface px-3 py-2">
              <p className="text-xs text-text-secondary">{label}</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {property.amenities.length > 0 && (
          <div>
            <h3 className="mb-2 font-semibold text-foreground">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity) => (
                <Badge key={amenity} variant="default">{amenity}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-3 pt-2 sm:grid-cols-3">
          <Button onClick={() => window.open(`tel:${brokerPhone}`, "_self")} disabled={!brokerPhone}>
            <Phone size={14} className="mr-2" />
            Call Broker
          </Button>
          <Button variant="outline" onClick={() => onWhatsApp(brokerPhone, property)}>
            <MessageCircle size={14} className="mr-2" />
            WhatsApp
          </Button>
          <Button variant="accent" onClick={() => onFindRequirements(property)}>
            <Target size={14} className="mr-2" />
            Match Requirements
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function MatchingRequirementsDrawer({
  property,
  requirements,
  loading,
  onClose,
  onCallBroker,
  onSendProperty,
  onShareProperty,
  onTrackAction,
}: {
  property: Property | null;
  requirements: MatchedRequirement[];
  loading: boolean;
  onClose: () => void;
  onCallBroker: (phone: string) => void;
  onSendProperty: (requirement: MatchedRequirement, property: Property) => void;
  onShareProperty: (property: Property) => void;
  onTrackAction: (payload: Record<string, unknown>) => void;
}) {
  if (!property) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-modal sm:border-l sm:border-border">
        <div className="border-b border-border bg-primary p-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-pill border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">
                <Target size={13} />
                Requirement matches
              </div>
              <h2 className="line-clamp-1 text-xl font-semibold">{property.title}</h2>
              <p className="mt-1 text-sm text-white/70">
                {property.locality || property.city} - {property.propertyType} - {formatPrice(property.price)}
              </p>
            </div>
            <button type="button" onClick={onClose} className="rounded-btn p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white" aria-label="Close matches">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4 grid grid-cols-3 gap-2">
            <MatchSignal label="Matched demand" value={requirements.length} />
            <MatchSignal label="Area" value={Math.round(property.area).toLocaleString()} />
            <MatchSignal label="Freshness" value={getFreshness(property.updatedAt).label} />
          </div>

          {loading ? (
            <div className="flex h-72 items-center justify-center rounded-card border border-border bg-surface">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : requirements.length === 0 ? (
            <div className="rounded-card border border-dashed border-border bg-surface p-8 text-center">
              <Target size={46} className="mx-auto mb-3 text-primary" />
              <h3 className="font-semibold text-foreground">No exact requirement match yet</h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                This inventory is still useful. Share it in broker groups or adjust budget/location filters from the requirements desk.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => onShareProperty(property)}>
                <Share size={14} className="mr-2" />
                Share Property
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {requirements.map((requirement) => {
                const score = requirement.match || getRequirementFit(property, requirement);
                return (
                  <div key={requirement.id} className="rounded-card border border-border bg-surface p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={score.variant}>{score.label}</Badge>
                      <Badge variant="blue">{requirement.propertyType}</Badge>
                      <Badge variant="accent">{getRequirementBudget(requirement)}</Badge>
                    </div>
                    <p className="mt-3 text-sm font-semibold leading-6 text-foreground">{requirement.description}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <InfoPill label="City" value={requirement.city} />
                      <InfoPill label="Broker" value={requirement.broker.name} />
                      <InfoPill label="Posted" value={new Date(requirement.createdAt).toLocaleDateString("en-IN")} />
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      <Button size="sm" variant="accent" onClick={() => onSendProperty(requirement, property)}>
                        <MessageCircle size={14} className="mr-2" />
                        Send Property
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        onTrackAction({
                          propertyId: property.id,
                          requirementId: requirement.id,
                          eventType: "BROKER_REQUIREMENT_CALL_CLICKED",
                          recipientId: requirement.broker.id,
                          metadata: { matchScore: score.score },
                        });
                        onCallBroker(requirement.broker.phone || "");
                      }}>
                        <Phone size={14} className="mr-2" />
                        Call Broker
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => {
                        onTrackAction({
                          propertyId: property.id,
                          requirementId: requirement.id,
                          eventType: "PROPERTY_SHARED",
                          recipientId: requirement.broker.id,
                          metadata: { channel: "NATIVE_SHARE", matchScore: score.score },
                        });
                        onShareProperty(property);
                      }}>
                        <Share size={14} className="mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function getRequirementBudget(requirement: MatchedRequirement) {
  if (requirement.budgetMin && requirement.budgetMax) return `${formatPrice(requirement.budgetMin)} - ${formatPrice(requirement.budgetMax)}`;
  if (requirement.budgetMin) return `From ${formatPrice(requirement.budgetMin)}`;
  if (requirement.budgetMax) return `Up to ${formatPrice(requirement.budgetMax)}`;
  return "Budget open";
}

function getRequirementFit(property: Property, requirement: MatchedRequirement) {
  let score = 0;
  const cityMatch = property.city.toLowerCase().includes(requirement.city.toLowerCase()) || requirement.city.toLowerCase().includes(property.city.toLowerCase());
  const typeMatch = property.propertyType === requirement.propertyType;
  const budgetMatch = (!requirement.budgetMin || property.price >= requirement.budgetMin) && (!requirement.budgetMax || property.price <= requirement.budgetMax);

  if (cityMatch) score += 35;
  if (typeMatch) score += 35;
  if (budgetMatch) score += 30;

  if (score >= 90) return { score, label: "Strong fit", variant: "success" as const, reasons: [] };
  if (score >= 65) return { score, label: "Good fit", variant: "accent" as const, reasons: [] };
  return { score, label: "Review fit", variant: "warning" as const, reasons: [] };
}

function MatchSignal({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card border border-border bg-surface p-3">
      <p className="truncate text-sm font-semibold text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-text-secondary">{label}</p>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-btn border border-border bg-white px-3 py-2">
      <p className="truncate text-sm font-semibold text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-text-secondary">{label}</p>
    </div>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: number; tone: "default" | "success" | "accent" | "warning" }) {
  const toneClass = {
    default: "border-border bg-surface text-foreground",
    success: "border-success/20 bg-success/10 text-success",
    accent: "border-accent/20 bg-accent/10 text-accent",
    warning: "border-warning/20 bg-warning/10 text-warning",
  }[tone];

  return (
    <div className={cn("rounded-card border px-4 py-3", toneClass)}>
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

function BrokerWorkflowCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-card border border-white/15 bg-white p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">{text}</p>
        </div>
      </div>
    </div>
  );
}

function FilterBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase text-text-secondary">{label}</p>
      {children}
    </div>
  );
}

function ChipButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-pill border px-3 py-1.5 text-xs font-semibold transition-colors",
        active ? "border-primary bg-primary text-white" : "border-border bg-surface text-text-secondary hover:border-primary hover:text-primary"
      )}
    >
      {children}
    </button>
  );
}
