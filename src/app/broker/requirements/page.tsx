"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  FileText,
  Filter,
  Flame,
  Loader2,
  Phone,
  Plus,
  Search,
  Target,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  BrokerPagination as Pagination,
  BrokerRequirement as Requirement,
  MatchFocus,
} from "@/components/broker/types";
import { useToast } from "@/components/ui/toast";
import { cn, formatPrice } from "@/lib/utils";
import { PROPERTY_TYPES, INDIAN_CITIES } from "@/lib/constants";

const QUICK_FILTERS = [
  { label: "Hot demand", value: "new" },
  { label: "Has matches", value: "matched" },
  { label: "Unmatched", value: "unmatched" },
  { label: "Office", value: "Office" },
  { label: "Apartment", value: "Apartment" },
];

export default function BrokerRequirementsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
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
  const [matchedProperties, setMatchedProperties] = useState<MatchedProperty[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    propertyType: "",
    locality: "",
    city: "",
    budgetMin: "",
    budgetMax: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextCity = params.get("city") || "";
    const nextLocality = params.get("locality") || "";
    const nextPropertyType = params.get("propertyType") || "";
    const nextMinBudget = params.get("minBudget") || "";
    const nextMaxBudget = params.get("maxBudget") || "";

    if (nextCity) setSelectedCity(nextCity);
    if (nextLocality) setSelectedLocality(nextLocality);
    if (nextPropertyType) setSelectedPropertyType(nextPropertyType);
    if (nextMinBudget) setMinBudget(nextMinBudget);
    if (nextMaxBudget) setMaxBudget(nextMaxBudget);
  }, []);

  const fetchRequirements = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedPropertyType) params.set("propertyType", selectedPropertyType);
      if (selectedLocality) params.set("locality", selectedLocality);
      if (selectedCity) params.set("city", selectedCity);
      if (minBudget) params.set("minBudget", minBudget);
      if (maxBudget) params.set("maxBudget", maxBudget);
      if (selectedUrgency) params.set("urgency", selectedUrgency);

      const res = await fetch(`/api/broker/requirements?${params}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setRequirements(data.requirements || []);
        setPagination(data.pagination || null);
      }
    } catch (error) {
      console.error("Failed to fetch requirements:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedPropertyType, selectedLocality, selectedCity, minBudget, maxBudget, selectedUrgency]);

  useEffect(() => {
    if (user?.role === "BROKER" && user.brokerStatus === "APPROVED") {
      fetchRequirements();
    } else {
      router.push("/login");
    }
  }, [user, router, fetchRequirements]);

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
    window.open(`tel:${phone}`, "_self");
  };

  const handleWhatsApp = (phone: string, requirement: Requirement) => {
    if (!phone || phone.includes("XXXX")) {
      toast("Broker WhatsApp number is not available yet.", "error");
      return;
    }
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
    window.open(`https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(message)}`, "_blank");
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

  async function trackBrokerAction(payload: Record<string, unknown>) {
    await fetch("/api/broker/collaborations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }).catch(() => {});
  }

  const handleMatchProperty = async (requirement: Requirement) => {
    setMatchRequirement(requirement);
    setMatchedProperties([]);
    setMatchesLoading(true);
    const params = new URLSearchParams({
      mode: "requirement",
      id: requirement.id,
      limit: "8",
    });

    try {
      const res = await fetch(`/api/broker/matches?${params}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setMatchedProperties(data.properties || []);
      }
    } catch (error) {
      console.error("Failed to fetch matching properties:", error);
    } finally {
      setMatchesLoading(false);
    }
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
        fetchRequirements();
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

  if (!user || user.role !== "BROKER" || user.brokerStatus !== "APPROVED") {
    return null;
  }

  const { freshCount, matchedCount, totalMatches } = requirementMetrics;

  return (
    <main className="min-h-screen bg-surface pb-20 lg:pb-8">
      <section className="bg-primary text-white">
        <div className="mx-auto max-w-7xl px-4 py-7 lg:px-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-pill border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85">
                <Flame size={14} />
                Active demand desk
              </div>
              <h1 className="text-3xl font-semibold sm:text-4xl">Broker Requirements</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                Track live demand, match inventory fast, and coordinate directly with brokers before opportunities go cold.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => router.push("/broker/properties")}>
                  <Building2 size={15} className="mr-2" />
                  View inventory
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAddModal(true)} className="border border-white/20 text-white hover:bg-white/10">
                  <Plus size={15} className="mr-2" />
                  Add demand
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="Demand" value={requirements.length} tone="default" />
              <MetricCard label="Fresh" value={freshCount} tone="success" />
              <MetricCard label="Matched" value={matchedCount} tone="accent" />
              <MetricCard label="Total Matches" value={totalMatches} tone="primary" />
            </div>
          </div>

          <div className="mt-5 rounded-card border border-white/15 bg-white p-2 shadow-card">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <div className="relative min-h-12 flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && fetchRequirements()}
                  placeholder="Search requirement, city, property type..."
                  className="h-12 w-full rounded-btn bg-surface pl-10 pr-3 text-sm outline-none placeholder:text-text-secondary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => fetchRequirements()} variant="accent" className="flex-1 lg:flex-none">
                  Search
                </Button>
                <Button onClick={() => setFiltersOpen(!filtersOpen)} variant="ghost" className="flex-1 lg:flex-none">
                  <Filter size={16} className="mr-2" />
                  Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </Button>
                <Button onClick={() => setShowAddModal(true)} className="hidden lg:inline-flex">
                  <Plus size={16} className="mr-2" />
                  Add
                </Button>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2 border-t border-border pt-2">
              {QUICK_FILTERS.map((filter) => (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => applyQuickFilter(filter.value)}
                  className={cn(
                    "rounded-pill border px-3 py-1.5 text-xs font-medium transition-colors",
                    (filter.value === selectedUrgency || filter.value === selectedPropertyType || filter.value === matchFocus)
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
            <BrokerWorkflowCard icon={<Plus size={16} />} title="Capture demand" text="Add buyer or tenant requirements while the client is warm." />
            <BrokerWorkflowCard icon={<Target size={16} />} title="Match supply" text="Open matching properties and share only the best-fit options." />
            <BrokerWorkflowCard icon={<Phone size={16} />} title="Confirm fast" text="Call or WhatsApp brokers with budget, city, and seriousness already packaged." />
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
              <Button onClick={() => { setFiltersOpen(false); fetchRequirements(); }} className="w-full" size="sm">
                Show Requirements
              </Button>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-4 rounded-card border border-border bg-white p-4 shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {visibleRequirements.length} active requirement{visibleRequirements.length === 1 ? "" : "s"} ready for matching
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {matchedCount} have matching inventory. Unmatched demand is an inventory opportunity.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="accent">{totalMatches} property matches</Badge>
                <Badge variant="success">{freshCount} fresh</Badge>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex h-96 items-center justify-center rounded-card border border-border bg-white shadow-card">
              <Loader2 size={38} className="animate-spin text-primary" />
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

          {pagination && pagination.totalPages > 1 && (
            <p className="mt-6 text-center text-sm text-text-secondary">
              Showing page {pagination.page} of {pagination.totalPages}
            </p>
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

      <div className="fixed inset-x-3 bottom-3 z-30 rounded-card border border-border bg-white p-2 shadow-modal lg:hidden">
        <div className="mb-2 flex items-center justify-between px-1">
          <div>
            <p className="text-xs text-text-secondary">Demand action desk</p>
            <p className="text-sm font-bold text-foreground">{visibleRequirements.length} requirements, {totalMatches} matches</p>
          </div>
          <button type="button" onClick={clearFilters} className="text-xs font-semibold text-primary">Clear</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => setFiltersOpen(!filtersOpen)} variant="outline" className="w-full">
            <Filter size={16} className="mr-2" />
            Filters{activeFiltersCount ? ` (${activeFiltersCount})` : ""}
          </Button>
          <Button onClick={() => setShowAddModal(true)} variant="accent" className="w-full">
            <Plus size={16} className="mr-2" />
            Add Demand
          </Button>
        </div>
      </div>
    </main>
  );
}
