"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  FileText,
  Filter,
  Phone,
  Plus,
  Search,
  Target,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrokerWorkflowCard, ChipButton, FilterBlock, MetricCard } from "@/components/broker/broker-primitives";
import { AddRequirementModal, MatchingPropertiesDrawer, RequirementCard } from "@/components/broker/requirement-workflow";
import {
  getAgeSignal,
  getBudgetText,
  getMatchedPropertyBrokerId,
  getMatchedPropertyBrokerPhone,
} from "@/components/broker/formatters";
import type {
  BrokerMatchedProperty as MatchedProperty,
  BrokerRequirement as Requirement,
  MatchFocus,
} from "@/features/broker-exchange/types";
import {
  openPhone,
  openWhatsApp,
  trackBrokerAction,
  useBrokerAuthGuard,
  useBrokerMatches,
  useBrokerRequirementsList,
  useBrokerUrlFilters,
} from "@/features/broker-exchange";
import { PaginationBar } from "@/shared/components/pagination-bar";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { dismissWorkflowTips as dismissTips, recordWorkflowTipsVisit, shouldShowWorkflowTips } from "@/lib/broker-storage";
import { useToast } from "@/components/ui/toast";
import { cn, formatPrice } from "@/lib/utils";
import { BROKER_QUICK_FILTER_TYPES, PROPERTY_TYPES, INDIAN_CITIES } from "@/lib/constants";
import { BrokerRequirementCardSkeleton } from "@/components/broker/broker-skeletons";

const QUICK_FILTERS = [
  { label: "Hot demand", value: "new" },
  { label: "Has matches", value: "matched" },
  { label: "Unmatched", value: "unmatched" },
  { label: "Office", value: BROKER_QUICK_FILTER_TYPES.OFFICE },
  { label: "Apartment", value: "Apartment" },
];

const TIPS_PAGE_KEY = "requirements";

export default function BrokerRequirementsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading, isReady } = useBrokerAuthGuard();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [selectedLocality, setSelectedLocality] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [selectedUrgency, setSelectedUrgency] = useState("");
  const [matchFocus, setMatchFocus] = useState<MatchFocus>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [matchRequirement, setMatchRequirement] = useState<Requirement | null>(null);
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
    minBudget: setMinBudget,
    maxBudget: setMaxBudget,
  });

  const apiFilters = useMemo(
    () => ({
      q: debouncedSearch || undefined,
      propertyType: selectedPropertyType || undefined,
      locality: selectedLocality || undefined,
      city: selectedCity || undefined,
      minBudget: minBudget || undefined,
      maxBudget: maxBudget || undefined,
      urgency: selectedUrgency || undefined,
    }),
    [debouncedSearch, selectedPropertyType, selectedLocality, selectedCity, minBudget, maxBudget, selectedUrgency]
  );

  const { requirements, loading, page, setPage, pagination, refetch } = useBrokerRequirementsList(apiFilters, isReady);
  const {
    loading: matchesLoading,
    matchedProperties,
    loadMatches,
    clearMatches,
  } = useBrokerMatches();

  const [formData, setFormData] = useState({
    description: "",
    propertyType: "",
    locality: "",
    city: "",
    budgetMin: "",
    budgetMax: "",
  });

  const handleCallBroker = (phone: string, requirement?: Requirement) => {
    if (!phone || phone.includes("XXXX")) {
      toast("Broker phone is not available yet.", "error");
      return;
    }
    if (requirement) {
      trackBrokerAction({
        requirementId: requirement.id,
        eventType: "BROKER_REQUIREMENT_CALL_CLICKED",
        recipientId: requirement.broker.id,
        metadata: { source: "BROKER_REQUIREMENT_CARD" },
      });
    }
    if (!openPhone(phone)) toast("Broker phone is not available yet.", "error");
  };

  const handleWhatsApp = (phone: string, requirement: Requirement) => {
    trackBrokerAction({
      requirementId: requirement.id,
      eventType: "BROKER_REQUIREMENT_WHATSAPP_CLICKED",
      recipientId: requirement.broker.id,
      metadata: { source: "BROKER_REQUIREMENT_CARD" },
    });
    const message = [
      "KrrishJazz Requirement Match",
      requirement.description,
      `City: ${requirement.city}`,
      `Type: ${requirement.propertyType}`,
      `Budget: ${getBudgetText(requirement)}`,
      `Current matches: ${requirement.matchedPropertiesCount}`,
      "",
      "I may have matching inventory. Please confirm client seriousness, brokerage terms, and next steps.",
    ].join("\n");
    if (!openWhatsApp(phone, message)) toast("Broker WhatsApp number is not available yet.", "error");
  };

  const handleShareRequirement = async (requirement: Requirement) => {
    trackBrokerAction({
      requirementId: requirement.id,
      eventType: "DEMAND_SHARED",
      recipientId: requirement.broker.id,
      metadata: { channel: typeof navigator.share === "function" ? "NATIVE_SHARE" : "CLIPBOARD", source: "BROKER_REQUIREMENT_CARD" },
    });
    const text = [
      "KrrishJazz Requirement",
      requirement.description,
      `City: ${requirement.city}`,
      `Type: ${requirement.propertyType}`,
      `Budget: ${getBudgetText(requirement)}`,
      `Matches: ${requirement.matchedPropertiesCount}`,
    ].join("\n");

    if (navigator.share) {
      await navigator.share({ title: "KrrishJazz Requirement", text }).catch(() => {});
      return;
    }

    await navigator.clipboard?.writeText(text);
    toast("Requirement share text copied.", "success");
  };

  const handleMatchProperty = async (requirement: Requirement) => {
    setMatchRequirement(requirement);
    clearMatches();
    await loadMatches("requirement", requirement.id);
  };

  const handleSendRequirementToPropertyBroker = (property: MatchedProperty, requirement: Requirement) => {
    const phone = getMatchedPropertyBrokerPhone(property);
    if (!phone || phone.includes("XXXX")) {
      toast("Property broker phone is not available yet.", "error");
      return;
    }

    const message = [
      "KrrishJazz Requirement Match",
      requirement.description,
      `Requirement city: ${requirement.city}`,
      `Requirement type: ${requirement.propertyType}`,
      `Budget: ${getBudgetText(requirement)}`,
      "",
      `Matched property: ${property.title}`,
      `Property price: ${formatPrice(property.price)}`,
      `Property area: ${Math.round(property.area).toLocaleString()} ${property.areaUnit}`,
      "",
      "This looks like a fit. Please confirm availability, brokerage terms, and site visit timing.",
    ].join("\n");

    trackBrokerAction({
      propertyId: property.id,
      requirementId: requirement.id,
      eventType: "DEMAND_SHARED",
      recipientId: getMatchedPropertyBrokerId(property),
      metadata: { channel: "WHATSAPP", matchScore: property.match?.score || null },
    });

    window.open(`https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleCallPropertyBroker = (property: MatchedProperty) => {
    const phone = getMatchedPropertyBrokerPhone(property);
    if (!phone || phone.includes("XXXX")) {
      toast("Property broker phone is not available yet.", "error");
      return;
    }
    trackBrokerAction({
      propertyId: property.id,
      requirementId: matchRequirement?.id,
      eventType: "BROKER_PROPERTY_CALL_CLICKED",
      recipientId: getMatchedPropertyBrokerId(property),
      metadata: { source: "REQUIREMENT_MATCH_DRAWER" },
    });
    window.open(`tel:${phone}`, "_self");
  };

  const handleShareMatchedProperty = async (property: MatchedProperty, requirement: Requirement) => {
    const text = [
      "KrrishJazz Matched Property",
      `${property.title} - ${formatPrice(property.price)}`,
      `${property.propertyType} in ${property.city}`,
      `${Math.round(property.area).toLocaleString()} ${property.areaUnit}`,
      `For requirement: ${requirement.description}`,
      `${window.location.origin}/properties/${property.slug}`,
    ].join("\n");

    if (navigator.share) {
      trackBrokerAction({
        propertyId: property.id,
        requirementId: requirement.id,
        eventType: "PROPERTY_SHARED",
        recipientId: getMatchedPropertyBrokerId(property),
        metadata: { channel: "NATIVE_SHARE" },
      });
      await navigator.share({ title: property.title, text, url: `${window.location.origin}/properties/${property.slug}` }).catch(() => {});
      return;
    }

    trackBrokerAction({
      propertyId: property.id,
      requirementId: requirement.id,
      eventType: "PROPERTY_SHARED",
      recipientId: getMatchedPropertyBrokerId(property),
      metadata: { channel: "CLIPBOARD" },
    });

    await navigator.clipboard?.writeText(text);
    toast("Matched property share text copied.", "success");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedPropertyType("");
    setSelectedLocality("");
    setSelectedCity("");
    setMinBudget("");
    setMaxBudget("");
    setSelectedUrgency("");
    setMatchFocus("all");
    setPage(1);
  };

  const handleSubmitRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.propertyType || !formData.city) {
      toast("Please fill in description, property type, and city.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/broker/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          description: formData.description,
          propertyType: formData.propertyType,
          locality: formData.locality,
          city: formData.city,
          budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : undefined,
          budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : undefined,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          description: "",
          propertyType: "",
          locality: "",
          city: "",
          budgetMin: "",
          budgetMax: "",
        });
        refetch();
        toast("Requirement added.", "success");
      } else {
        const error = await res.json();
        toast(error.error || "Failed to add requirement", "error");
      }
    } catch (error) {
      console.error("Failed to add requirement:", error);
      toast("Failed to add requirement.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const applyQuickFilter = (value: string) => {
    setPage(1);
    if (value === "matched") {
      setMatchFocus(matchFocus === "matched" ? "all" : "matched");
      return;
    }
    if (value === "unmatched") {
      setMatchFocus(matchFocus === "unmatched" ? "all" : "unmatched");
      return;
    }
    if (value === "new") {
      setSelectedUrgency(selectedUrgency === "new" ? "" : "new");
      return;
    }
    setSelectedPropertyType(selectedPropertyType === value ? "" : value);
  };

  const visibleRequirements = useMemo(() => requirements.filter((requirement) => {
    if (matchFocus === "matched") return requirement.matchedPropertiesCount > 0;
    if (matchFocus === "unmatched") return requirement.matchedPropertiesCount === 0;
    return true;
  }), [matchFocus, requirements]);

  const requirementMetrics = useMemo(() => {
    let freshCount = 0;
    let matchedCount = 0;
    let totalMatches = 0;

    requirements.forEach((requirement) => {
      if (getAgeSignal(requirement.createdAt).days < 7) freshCount += 1;
      if (requirement.matchedPropertiesCount > 0) matchedCount += 1;
      totalMatches += requirement.matchedPropertiesCount;
    });

    return { freshCount, matchedCount, totalMatches };
  }, [requirements]);

  const activeFiltersCount = useMemo(
    () => [searchQuery, selectedPropertyType, selectedLocality, selectedCity, minBudget, maxBudget, selectedUrgency, matchFocus !== "all" ? matchFocus : ""].filter(Boolean).length,
    [matchFocus, maxBudget, minBudget, searchQuery, selectedCity, selectedLocality, selectedPropertyType, selectedUrgency]
  );

  if (authLoading || !user || !isReady) {
    return null;
  }

  const { freshCount, matchedCount, totalMatches } = requirementMetrics;

  return (
    <main className="min-h-screen bg-surface pb-20 lg:pb-8">
      <section className="border-b border-white/10 bg-primary-dark text-white">
        <div className="mx-auto max-w-7xl px-4 py-5 lg:px-6">
          <h1 className="text-2xl font-semibold sm:text-3xl">Demand desk</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/75">
            Live buyer and tenant requirements — match inventory before demand goes cold.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="inverse" size="sm" onClick={() => router.push("/broker/properties")}>
              <Building2 size={15} className="mr-2" />
              View inventory
            </Button>
            <Button variant="inverse-outline" size="sm" onClick={() => setShowAddModal(true)}>
              <Plus size={15} className="mr-2" />
              Add demand
            </Button>
          </div>
        </div>
      </section>

      <section className="sticky z-20 border-b border-border bg-white shadow-sm" style={{ top: "var(--broker-header-height, 7rem)" }}>
        <div className="mx-auto max-w-7xl px-4 py-3 lg:px-6">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="relative min-h-11 flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && refetch()}
                placeholder="Search requirement, city, property type..."
                className="h-11 w-full rounded-btn border border-border bg-white pl-10 pr-3 text-sm outline-none placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => refetch()} variant="accent" size="sm" className="flex-1 lg:flex-none">
                Search
              </Button>
              <Button
                onClick={() => setFiltersOpen(!filtersOpen)}
                variant="outline"
                size="sm"
                className="flex-1 lg:flex-none"
              >
                <Filter size={16} className="mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
              <Button onClick={() => setShowAddModal(true)} variant="primary" size="sm" className="hidden lg:inline-flex">
                <Plus size={16} className="mr-2" />
                Add
              </Button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {QUICK_FILTERS.map((filter) => {
              const active =
                filter.value === selectedUrgency ||
                filter.value === selectedPropertyType ||
                filter.value === matchFocus;
              return (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => applyQuickFilter(filter.value)}
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

      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl space-y-3 px-4 py-4 lg:px-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MetricCard label="Demand" value={requirements.length} tone="default" />
            <MetricCard label="Fresh" value={freshCount} tone="success" />
            <MetricCard label="Matched" value={matchedCount} tone="accent" />
            <MetricCard label="Total matches" value={totalMatches} tone="primary" />
          </div>

          {showWorkflowTips && (
            <div className="rounded-card border border-border bg-white p-4 shadow-card">
              <div className="mb-3 flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">How demand desk works</p>
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
                <BrokerWorkflowCard icon={<Plus size={16} />} title="Capture demand" text="Add requirements while the client is warm." />
                <BrokerWorkflowCard icon={<Target size={16} />} title="Match supply" text="Share only the best-fit inventory options." />
                <BrokerWorkflowCard icon={<Phone size={16} />} title="Confirm fast" text="Call or WhatsApp with budget and city packaged." />
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
              <h2 className="text-sm font-semibold text-foreground">Demand filters</h2>
              <p className="text-xs text-text-secondary">Prioritize serious leads</p>
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
            <FilterBlock label="Property Type">
              <select
                value={selectedPropertyType}
                onChange={(event) => setSelectedPropertyType(event.target.value)}
                className="w-full rounded-btn border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Property Types</option>
                {Object.values(PROPERTY_TYPES).flat().map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </FilterBlock>

            <FilterBlock label="City">
              <select
                value={selectedCity}
                onChange={(event) => setSelectedCity(event.target.value)}
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
                onChange={(event) => setSelectedLocality(event.target.value)}
              />
            </FilterBlock>

            <FilterBlock label="Urgency">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "New", value: "new" },
                  { label: "Recent", value: "recent" },
                  { label: "Aging", value: "old" },
                ].map((item) => (
                  <ChipButton key={item.value} active={selectedUrgency === item.value} onClick={() => setSelectedUrgency(selectedUrgency === item.value ? "" : item.value)}>
                    {item.label}
                  </ChipButton>
                ))}
              </div>
            </FilterBlock>

            <FilterBlock label="Match Status">
              <div className="flex flex-wrap gap-1.5">
                <ChipButton active={matchFocus === "all"} onClick={() => setMatchFocus("all")}>All</ChipButton>
                <ChipButton active={matchFocus === "matched"} onClick={() => setMatchFocus("matched")}>Matched</ChipButton>
                <ChipButton active={matchFocus === "unmatched"} onClick={() => setMatchFocus("unmatched")}>Unmatched</ChipButton>
              </div>
            </FilterBlock>

            <FilterBlock label="Budget">
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" placeholder="Min" value={minBudget} onChange={(event) => setMinBudget(event.target.value)} />
                <Input type="number" placeholder="Max" value={maxBudget} onChange={(event) => setMaxBudget(event.target.value)} />
              </div>
            </FilterBlock>

            <div className="sticky bottom-0 -mx-4 -mb-4 border-t border-border bg-white p-4 lg:static lg:m-0 lg:border-0 lg:p-0">
              <Button onClick={() => { setFiltersOpen(false); refetch(); }} className="w-full" size="sm">
                Show Requirements
              </Button>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          {!loading && visibleRequirements.length > 0 && (
            <p className="mb-4 text-sm text-text-secondary">
              <span className="font-semibold text-foreground">{visibleRequirements.length}</span> requirements
              {matchedCount > 0 && (
                <> · <span className="font-semibold text-accent">{matchedCount}</span> with inventory</>
              )}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <BrokerRequirementCardSkeleton key={index} />
              ))}
            </div>
          ) : visibleRequirements.length === 0 ? (
            <div className="rounded-card border border-dashed border-border bg-white p-8 text-center shadow-card">
              <FileText size={54} className="mx-auto mb-4 text-primary" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">No active demand found</h3>
              <p className="mx-auto max-w-xl text-sm leading-6 text-text-secondary">Add real buyer or tenant demand from client conversations. KrrishJazz will help match it against protected network inventory.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button onClick={clearFilters} variant="outline">Clear filters</Button>
                <Button onClick={() => setShowAddModal(true)}>Add Requirement</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {visibleRequirements.map((requirement) => (
                <RequirementCard
                  key={requirement.id}
                  requirement={requirement}
                  onCallBroker={handleCallBroker}
                  onWhatsApp={handleWhatsApp}
                  onShareRequirement={handleShareRequirement}
                  onMatchProperty={handleMatchProperty}
                />
              ))}
            </div>
          )}

          {matchFocus === "all" && pagination && (
            <PaginationBar
              page={page}
              totalPages={pagination.totalPages}
              onPrevious={() => setPage(page - 1)}
              onNext={() => setPage(page + 1)}
            />
          )}
        </section>
      </div>

      <AddRequirementModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        formData={formData}
        setFormData={setFormData}
        submitting={submitting}
        onSubmit={handleSubmitRequirement}
      />

      <MatchingPropertiesDrawer
        requirement={matchRequirement}
        properties={matchedProperties}
        loading={matchesLoading}
        onClose={() => setMatchRequirement(null)}
        onSendRequirement={handleSendRequirementToPropertyBroker}
        onCallBroker={handleCallPropertyBroker}
        onShareProperty={handleShareMatchedProperty}
      />

    </main>
  );
}
