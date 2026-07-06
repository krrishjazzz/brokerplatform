"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BellRing,
  Building2,
  Filter,
  Search,
  Target,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BrokerPropertyCardSkeleton } from "@/components/broker/broker-skeletons";
import { BrokerWorkflowCard, ChipButton, FilterBlock, MetricCard } from "@/components/broker/broker-primitives";
import { getFreshness, getRequirementBudget } from "@/components/broker/formatters";
import { BrokerPropertyDetailsModal, BrokerPropertyCard, MatchingRequirementsDrawer } from "@/components/broker/property-workflow";
import type { BrokerMatchedRequirement as MatchedRequirement, BrokerProperty as Property } from "@/features/broker-exchange/types";
import {
  buildPropertyShareText,
  buildPropertyWhatsAppMessage,
  openPhone,
  openWhatsApp,
  trackBrokerAction,
  useBrokerAuthGuard,
  useBrokerInventory,
  useBrokerMatches,
  useBrokerUrlFilters,
} from "@/features/broker-exchange";
import { PaginationBar } from "@/shared/components/pagination-bar";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { dismissWorkflowTips as dismissTips, recordWorkflowTipsVisit, shouldShowWorkflowTips } from "@/lib/broker-storage";
import { useToast } from "@/components/ui/toast";
import { cn, formatPrice } from "@/lib/utils";
import { BROKER_QUICK_FILTER_TYPES, PROPERTY_TYPES, INDIAN_CITIES } from "@/lib/constants";
import { MessageCircle } from "lucide-react";

const QUICK_FILTERS = [
  { label: "High match", action: "matches" },
  { label: "Fresh", action: "fresh" },
  { label: "Office", action: "office" },
  { label: "Warehouse", action: "warehouse" },
  { label: "Rent", action: "rent" },
];

const TIPS_PAGE_KEY = "inventory";

function isQuickFilterActive(
  action: string,
  clientFocus: string,
  selectedListingType: string,
  selectedPropertyType: string
) {
  if (action === clientFocus) return true;
  if (action === "rent" && selectedListingType === "RENT") return true;
  if (action === "office" && selectedPropertyType === BROKER_QUICK_FILTER_TYPES.OFFICE) return true;
  if (action === "warehouse" && selectedPropertyType === BROKER_QUICK_FILTER_TYPES.WAREHOUSE) return true;
  return false;
}

export default function BrokerPropertiesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading, isReady } = useBrokerAuthGuard();
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
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [matchProperty, setMatchProperty] = useState<Property | null>(null);
  const [showWorkflowTips, setShowWorkflowTips] = useState(false);

  useEffect(() => {
    recordWorkflowTipsVisit(TIPS_PAGE_KEY);
    setShowWorkflowTips(shouldShowWorkflowTips(TIPS_PAGE_KEY));
  }, []);

  const handleDismissTips = () => {
    dismissTips(TIPS_PAGE_KEY);
    setShowWorkflowTips(false);
  };

  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  useBrokerUrlFilters({
    city: setSelectedCity,
    locality: setSelectedLocality,
    propertyType: setSelectedPropertyType,
    minPrice: setMinPrice,
    maxPrice: setMaxPrice,
  });

  const apiFilters = useMemo(
    () => ({
      q: debouncedSearch || undefined,
      listingType: selectedListingType || undefined,
      category: selectedCategory || undefined,
      propertyType: selectedPropertyType || undefined,
      locality: selectedLocality || undefined,
      city: selectedCity || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      sort: selectedSort || undefined,
    }),
    [debouncedSearch, selectedListingType, selectedCategory, selectedPropertyType, selectedLocality, selectedCity, minPrice, maxPrice, selectedSort]
  );

  const { properties, loading, page, setPage, pagination, refetch } = useBrokerInventory(apiFilters, isReady);
  const {
    loading: matchesLoading,
    matchedRequirements,
    loadMatches,
    clearMatches,
  } = useBrokerMatches();

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

  const handleContactBroker = (phone: string, property?: Property) => {
    if (property) {
      trackBrokerAction({
        propertyId: property.id,
        eventType: "BROKER_CALL_CLICKED",
        recipientId: property.assignedBrokerId || undefined,
        metadata: { source: "BROKER_PROPERTY_LIST" },
      });
    }
    if (!openPhone(phone)) toast("Broker phone is not available.", "error");
  };

  const handleWhatsApp = (phone: string, property: Property) => {
    trackBrokerAction({
      propertyId: property.id,
      eventType: "BROKER_WHATSAPP_CLICKED",
      recipientId: property.assignedBrokerId || undefined,
      metadata: { source: "BROKER_PROPERTY_LIST" },
    });
    if (!openWhatsApp(phone, buildPropertyWhatsAppMessage(property))) {
      toast("Broker WhatsApp is not available.", "error");
    }
  };

  const handleShare = (property: Property) => {
    trackBrokerAction({
      propertyId: property.id,
      eventType: "PROPERTY_SHARED",
      recipientId: property.assignedBrokerId || undefined,
      metadata: { channel: typeof navigator.share === "function" ? "NATIVE_SHARE" : "CLIPBOARD", source: "BROKER_PROPERTY_LIST" },
    });
    const shareText = buildPropertyShareText(property);

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
    clearMatches();
    await loadMatches("property", property.id);
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
      setSelectedPropertyType(BROKER_QUICK_FILTER_TYPES.OFFICE);
      setClientFocus("all");
    }
    if (action === "warehouse") {
      setSelectedCategory("INDUSTRIAL");
      setSelectedPropertyType(BROKER_QUICK_FILTER_TYPES.WAREHOUSE);
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

  if (authLoading || !user || !isReady) {
    return null;
  }

  const { freshListings, hotMatches, highMatchListings, onHold, followUpCount } = propertyMetrics;

  return (
    <main className="min-h-screen bg-surface pb-20 lg:pb-8">
      {/* Zone A — compact title strip */}
      <section className="border-b border-white/10 bg-primary-dark text-white">
        <div className="mx-auto max-w-7xl px-4 py-5 lg:px-6">
          <h1 className="text-2xl font-semibold sm:text-3xl">Broker inventory</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/75">
            Broker-visible supply — includes listings not on public search.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="inverse" size="sm" onClick={() => router.push("/broker/requirements")}>
              <Target size={15} className="mr-2" />
              Demand desk
            </Button>
            <Button variant="inverse-outline" size="sm" onClick={() => router.push("/properties")}>
              Customer view
            </Button>
            <Button
              variant="inverse-outline"
              size="sm"
              onClick={() => setClientFocus(clientFocus === "matches" ? "all" : "matches")}
            >
              <BellRing size={15} className="mr-2" />
              Hot matches
            </Button>
          </div>
        </div>
      </section>

      {/* Zone B — search toolbar (white) */}
      <section className="sticky z-20 border-b border-border bg-white shadow-sm" style={{ top: "var(--broker-header-height, 7rem)" }}>
        <div className="mx-auto max-w-7xl px-4 py-3 lg:px-6">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="relative min-h-11 flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setPage(1);
                    refetch();
                  }
                }}
                placeholder="Search title, locality, city, property type..."
                className="h-11 w-full rounded-btn border border-border bg-white pl-10 pr-3 text-sm outline-none placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setPage(1);
                  refetch();
                }}
                variant="accent"
                size="sm"
                className="flex-1 lg:flex-none"
              >
                Search
              </Button>
              <Button
                onClick={() => setFiltersOpen(!filtersOpen)}
                variant="outline"
                size="sm"
                className="relative flex-1 lg:flex-none"
              >
                <Filter size={16} className="mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {QUICK_FILTERS.map((filter) => {
              const active = isQuickFilterActive(
                filter.action,
                clientFocus,
                selectedListingType,
                selectedPropertyType
              );
              return (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => applyQuickFilter(filter.action)}
                  className={cn(
                    "cursor-pointer rounded-pill border px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors",
                    active
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-foreground hover:border-primary/50 hover:text-primary"
                  )}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Zone C — metrics + alerts on surface */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl space-y-3 px-4 py-4 lg:px-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MetricCard label="Inventory" value={properties.length} tone="default" />
            <MetricCard label="Fresh" value={freshListings} tone="success" />
            <MetricCard label="Matched" value={hotMatches} tone="accent" />
            <MetricCard label="On hold" value={onHold} tone="warning" />
          </div>

          {followUpCount > 0 && (
            <div className="flex flex-col gap-2 rounded-card border border-warning/30 bg-warning-light/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Follow-ups needed</p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {followUpCount} listing{followUpCount === 1 ? "" : "s"} have matches or freshness checks pending.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setClientFocus("matches")}>
                View matches
              </Button>
            </div>
          )}

          {showWorkflowTips && (
            <div className="rounded-card border border-border bg-white p-4 shadow-card">
              <div className="mb-3 flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">How partner inventory works</p>
                <button
                  type="button"
                  onClick={handleDismissTips}
                  className="rounded-lg p-1 text-text-secondary hover:bg-surface hover:text-foreground"
                  aria-label="Dismiss tips"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="grid gap-2 lg:grid-cols-3">
                <BrokerWorkflowCard
                  icon={<Search size={16} />}
                  title="Find inventory"
                  text="Filter by city, type, and budget before sharing."
                />
                <BrokerWorkflowCard
                  icon={<Target size={16} />}
                  title="Match demand"
                  text="Open matching requirements from any property card."
                />
                <BrokerWorkflowCard
                  icon={<MessageCircle size={16} />}
                  title="Close faster"
                  text="Call or WhatsApp brokers with ready context."
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {filtersOpen && (
        <div className="fixed inset-0 z-30 bg-foreground/35 backdrop-blur-[2px] lg:hidden" onClick={() => setFiltersOpen(false)} />
      )}

      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 lg:flex-row lg:px-6">
        <aside className={cn(
          "h-fit shrink-0 overflow-y-auto rounded-card border border-border bg-white p-4 shadow-card lg:sticky lg:w-72 lg:top-[calc(var(--broker-header-height,7rem)+1rem)]",
          filtersOpen ? "fixed inset-x-0 bottom-0 top-0 z-40 block rounded-none pb-28 pt-5 lg:static lg:rounded-card lg:pb-4 lg:pt-4" : "hidden lg:block"
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
              <Button onClick={() => { setFiltersOpen(false); refetch(); }} className="w-full" size="sm">
                Show Broker Inventory
              </Button>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          {!loading && visibleProperties.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-text-secondary">
                <span className="font-semibold text-foreground">{visibleProperties.length}</span> properties
                {highMatchListings > 0 && (
                  <> · <span className="font-semibold text-accent">{highMatchListings}</span> with matches</>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {hotMatches > 0 && <Badge variant="accent">{hotMatches} matches</Badge>}
                {freshListings > 0 && <Badge variant="success">{freshListings} fresh</Badge>}
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <BrokerPropertyCardSkeleton key={index} />
              ))}
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

          {clientFocus === "all" && pagination && (
            <PaginationBar
              className="mt-8"
              page={page}
              totalPages={pagination.totalPages}
              onPrevious={() => setPage(page - 1)}
              onNext={() => setPage(page + 1)}
            />
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
        onTrackAction={(payload) => {
          void trackBrokerAction(payload as Parameters<typeof trackBrokerAction>[0]);
        }}
      />

    </main>
  );
}
