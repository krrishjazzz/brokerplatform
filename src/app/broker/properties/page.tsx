"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BellRing,
  Building2,
  Filter,
  Loader2,
  MessageCircle,
  Network,
  Search,
  Target,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BrokerWorkflowCard, ChipButton, FilterBlock, MetricCard } from "@/components/broker/broker-primitives";
import { getFreshness, getRequirementBudget } from "@/components/broker/formatters";
import { BrokerPropertyDetailsModal, BrokerPropertyCard, MatchingRequirementsDrawer } from "@/components/broker/property-workflow";
import type {
  BrokerMatchedRequirement as MatchedRequirement,
  BrokerPagination as Pagination,
  BrokerProperty as Property,
} from "@/components/broker/types";
import { useToast } from "@/components/ui/toast";
import { cn, formatPrice } from "@/lib/utils";
import { PROPERTY_TYPES, INDIAN_CITIES } from "@/lib/constants";

const QUICK_FILTERS = [
  { label: "High match", action: "matches" },
  { label: "Fresh", action: "fresh" },
  { label: "Office", action: "office" },
  { label: "Warehouse", action: "warehouse" },
  { label: "Rent", action: "rent" },
];

export default function BrokerPropertiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  const propertyMetrics = useMemo(() => {
    let freshListings = 0;
    let hotMatches = 0;
    let highMatchListings = 0;
    let onHold = 0;
    let followUpCount = 0;

    properties.forEach((property) => {
      const freshness = getFreshness(property.updatedAt);
      if (freshness.isFresh) freshListings += 1;
      if (!freshness.isFresh || property.matchingRequirementsCount > 0) followUpCount += 1;
      if (property.matchingRequirementsCount > 0) highMatchListings += 1;
      if (property.listingStatus === "ON_HOLD") onHold += 1;
      hotMatches += property.matchingRequirementsCount;
    });

    return { freshListings, hotMatches, highMatchListings, onHold, followUpCount };
  }, [properties]);

  const visibleProperties = useMemo(() => properties.filter((property) => {
    if (clientFocus === "matches") return property.matchingRequirementsCount > 0;
    if (clientFocus === "fresh") return getFreshness(property.updatedAt).isFresh;
    return true;
  }), [clientFocus, properties]);

  const activeFiltersCount = useMemo(
    () => [searchQuery, selectedListingType, selectedCategory, selectedPropertyType, selectedLocality, selectedCity, minPrice, maxPrice, selectedSort].filter(Boolean).length,
    [maxPrice, minPrice, searchQuery, selectedCategory, selectedCity, selectedListingType, selectedLocality, selectedPropertyType, selectedSort]
  );

  if (!user || user.role !== "BROKER" || user.brokerStatus !== "APPROVED") {
    return null;
  }

  const { freshListings, hotMatches, highMatchListings, onHold, followUpCount } = propertyMetrics;

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

      {filtersOpen && (
        <div className="fixed inset-0 z-30 bg-foreground/35 backdrop-blur-[2px] lg:hidden" onClick={() => setFiltersOpen(false)} />
      )}

      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 lg:flex-row lg:px-6">
        <aside className={cn(
          "h-fit shrink-0 overflow-y-auto rounded-card border border-border bg-white p-4 shadow-card lg:sticky lg:top-20 lg:w-72",
          filtersOpen ? "fixed inset-x-0 bottom-0 top-0 z-40 block rounded-none pb-28 pt-5 lg:static lg:rounded-card lg:pb-4 lg:pt-4" : "hidden"
        )}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Deal filters</h2>
              <p className="text-xs text-text-secondary">Narrow inventory for matching</p>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={clearFilters} className="text-xs font-semibold text-primary hover:text-accent">
                Clear
              </button>
              <button type="button" onClick={() => setFiltersOpen(false)} className="rounded-btn border border-border p-2 text-text-secondary lg:hidden" aria-label="Close filters">
                <X size={16} />
              </button>
            </div>
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

            <div className="sticky bottom-0 -mx-4 -mb-4 border-t border-border bg-white p-4 lg:static lg:m-0 lg:border-0 lg:p-0">
              <Button onClick={() => { setFiltersOpen(false); fetchProperties(); }} className="w-full" size="sm">
                Show Broker Inventory
              </Button>
            </div>
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
        <div className="mb-2 flex items-center justify-between px-1">
          <div>
            <p className="text-xs text-text-secondary">Broker action desk</p>
            <p className="text-sm font-bold text-foreground">{visibleProperties.length} supply, {hotMatches} matches</p>
          </div>
          <button type="button" onClick={clearFilters} className="text-xs font-semibold text-primary">Clear</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => setFiltersOpen(!filtersOpen)} variant="outline" className="w-full">
            <Filter size={16} className="mr-2" />
            Filters{activeFiltersCount ? ` (${activeFiltersCount})` : ""}
          </Button>
          <Button onClick={() => { setPage(1); fetchProperties(); }} variant="accent" className="w-full">
            Refresh
          </Button>
        </div>
      </div>
    </main>
  );
}
