"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BellRing,
  Building2,
  Clock,
  FileText,
  Filter,
  Flame,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Share2,
  Target,
  UserCheck,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { cn, formatPrice } from "@/lib/utils";
import { PROPERTY_TYPES, INDIAN_CITIES } from "@/lib/constants";

interface Requirement {
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
    phone: string;
  };
}

interface MatchedProperty {
  id: string;
  slug: string;
  title: string;
  description: string;
  address: string;
  locality: string;
  city: string;
  price: number;
  listingType: string;
  propertyType: string;
  coverImage: string | null;
  images: string[];
  assignedBrokerId: string | null;
  assignedBroker?: {
    id?: string;
    name: string;
    phone: string;
  } | null;
  postedById?: string;
  postedBy?: {
    id: string;
    name: string | null;
    phone: string;
  };
  publicBrokerName: string;
  area: number;
  areaUnit: string;
  furnishing: string | null;
  listingStatus: string;
  status: string;
  matchingRequirementsCount: number;
  match?: { score: number; label: string; variant: "default" | "success" | "warning" | "error" | "blue" | "accent"; reasons: string[] };
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type MatchFocus = "all" | "matched" | "unmatched";

const QUICK_FILTERS = [
  { label: "Hot demand", value: "new" },
  { label: "Has matches", value: "matched" },
  { label: "Unmatched", value: "unmatched" },
  { label: "Office", value: "Office" },
  { label: "Apartment", value: "Apartment" },
];

const REQUIREMENT_TEMPLATES = [
  {
    label: "2BHK buyer",
    description: "Need 2BHK apartment for family. Good locality, lift and parking preferred.",
    propertyType: "Apartment",
  },
  {
    label: "Office lease",
    description: "Need office space for 12-18 seats. Parking and power backup preferred.",
    propertyType: "Office",
  },
  {
    label: "Shop frontage",
    description: "Need shop on main road with good frontage and walk-in visibility.",
    propertyType: "Shop",
  },
];

function getAgeSignal(createdAt: string) {
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return { label: "Today", variant: "accent" as const, tone: "text-accent", days };
  if (days < 7) return { label: `${days}d fresh`, variant: "success" as const, tone: "text-success", days };
  if (days < 30) return { label: `${days}d active`, variant: "blue" as const, tone: "text-primary", days };
  return { label: "Aging", variant: "warning" as const, tone: "text-warning", days };
}

function getBudgetText(requirement: Requirement) {
  if (requirement.budgetMin && requirement.budgetMax) {
    return `${formatPrice(Number(requirement.budgetMin))} - ${formatPrice(Number(requirement.budgetMax))}`;
  }
  if (requirement.budgetMin) return `Above ${formatPrice(Number(requirement.budgetMin))}`;
  if (requirement.budgetMax) return `Up to ${formatPrice(Number(requirement.budgetMax))}`;
  return "Budget open";
}

export default function BrokerRequirementsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
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
    if (requirement) {
      trackBrokerAction({
        requirementId: requirement.id,
        eventType: "BROKER_CALL_CLICKED",
        recipientId: requirement.broker.id,
        metadata: { source: "BROKER_REQUIREMENT_CARD" },
      });
    }
    window.open(`tel:${phone}`, "_self");
  };

  const handleWhatsApp = (phone: string, requirement: Requirement) => {
    trackBrokerAction({
      requirementId: requirement.id,
      eventType: "BROKER_WHATSAPP_CLICKED",
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
      "I may have matching inventory. Please confirm client seriousness and next steps.",
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
      toast("Broker phone is not available for this property.", "error");
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
    if (!phone || phone.includes("XXXX")) return;
    trackBrokerAction({
      propertyId: property.id,
      requirementId: matchRequirement?.id,
      eventType: "BROKER_CALL_CLICKED",
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

  if (!user || user.role !== "BROKER" || user.brokerStatus !== "APPROVED") {
    return null;
  }

  const visibleRequirements = requirements.filter((requirement) => {
    if (matchFocus === "matched") return requirement.matchedPropertiesCount > 0;
    if (matchFocus === "unmatched") return requirement.matchedPropertiesCount === 0;
    return true;
  });

  const freshCount = requirements.filter((requirement) => getAgeSignal(requirement.createdAt).days < 7).length;
  const matchedCount = requirements.filter((requirement) => requirement.matchedPropertiesCount > 0).length;
  const totalMatches = requirements.reduce((sum, requirement) => sum + requirement.matchedPropertiesCount, 0);
  const activeFiltersCount = [searchQuery, selectedPropertyType, selectedLocality, selectedCity, minBudget, maxBudget, selectedUrgency, matchFocus !== "all" ? matchFocus : ""].filter(Boolean).length;

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
            <BrokerWorkflowCard icon={<Phone size={16} />} title="Confirm fast" text="Call brokers with budget, city, and seriousness already packaged." />
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 lg:flex-row lg:px-6">
        <aside className={cn("h-fit shrink-0 rounded-card border border-border bg-white p-4 shadow-card lg:sticky lg:top-20 lg:w-72", filtersOpen ? "block" : "hidden")}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Demand filters</h2>
              <p className="text-xs text-text-secondary">Prioritize serious leads</p>
            </div>
            <button type="button" onClick={clearFilters} className="text-xs font-semibold text-primary hover:text-accent">
              Clear
            </button>
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

            <Button onClick={() => { setFiltersOpen(false); fetchRequirements(); }} className="w-full" size="sm">
              Apply Filters
            </Button>
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
            <div className="rounded-card border border-dashed border-border bg-white p-10 text-center shadow-card">
              <FileText size={54} className="mx-auto mb-4 text-primary" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">No active demand found</h3>
              <p className="text-text-secondary">Try clearing filters or add a new requirement from a client conversation.</p>
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
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => setFiltersOpen(!filtersOpen)} variant="outline" className="w-full">
            <Filter size={16} className="mr-2" />
            Filters
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

interface RequirementCardProps {
  requirement: Requirement;
  onCallBroker: (phone: string, requirement?: Requirement) => void;
  onWhatsApp: (phone: string, requirement: Requirement) => void;
  onShareRequirement: (requirement: Requirement) => void;
  onMatchProperty: (requirement: Requirement) => void;
}

function RequirementCard({ requirement, onCallBroker, onWhatsApp, onShareRequirement, onMatchProperty }: RequirementCardProps) {
  const age = getAgeSignal(requirement.createdAt);
  const budgetText = getBudgetText(requirement);
  const hasMatches = requirement.matchedPropertiesCount > 0;

  return (
    <article className="overflow-hidden rounded-card border border-border bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <div className="grid lg:grid-cols-[1fr_260px]">
        <div className="p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant={age.variant}>
              <BellRing size={11} className="mr-1" />
              {age.label}
            </Badge>
            <Badge variant={hasMatches ? "accent" : "warning"}>
              <Target size={11} className="mr-1" />
              {hasMatches ? `${requirement.matchedPropertiesCount} matches` : "Inventory gap"}
            </Badge>
            <Badge variant="blue">{requirement.propertyType}</Badge>
          </div>

          <h2 className="text-xl font-semibold leading-snug text-foreground">{requirement.description}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} className="text-primary" />
              {requirement.locality ? `${requirement.locality}, ` : ""}{requirement.city}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={14} className={age.tone} />
              Posted {new Date(requirement.createdAt).toLocaleDateString("en-IN")}
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <InfoTile label="Budget" value={budgetText} />
            <InfoTile label="Need" value={requirement.propertyType} />
            <InfoTile label="Network" value={hasMatches ? "Inventory available" : "Find supply"} highlight={hasMatches} />
          </div>
        </div>

        <div className="border-t border-border bg-surface p-5 lg:border-l lg:border-t-0">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <UserCheck size={19} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{requirement.broker.name}</p>
              <p className="text-xs text-text-secondary">{requirement.broker.phone}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <Button variant="accent" size="sm" onClick={() => onMatchProperty(requirement)} className="w-full">
              <Building2 size={14} className="mr-2" />
              View Matches
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => onCallBroker(requirement.broker.phone, requirement)}>
                <Phone size={14} className="mr-1" />
                Call
              </Button>
              <Button variant="outline" size="sm" onClick={() => onWhatsApp(requirement.broker.phone, requirement)}>
                <MessageCircle size={14} className="mr-1" />
                WhatsApp
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onShareRequirement(requirement)} className="w-full">
              <Share2 size={14} className="mr-2" />
              Share Requirement
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function AddRequirementModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  submitting,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  formData: { description: string; propertyType: string; locality: string; city: string; budgetMin: string; budgetMax: string };
  setFormData: (data: { description: string; propertyType: string; locality: string; city: string; budgetMin: string; budgetMax: string }) => void;
  submitting: boolean;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Live Requirement">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="rounded-card border border-primary/20 bg-primary-light p-4">
          <p className="text-sm font-semibold text-primary">Capture demand while it is fresh</p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Add the requirement in the same language brokers use on calls. Clear demand improves matching quality.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {REQUIREMENT_TEMPLATES.map((template) => (
            <button
              key={template.label}
              type="button"
              onClick={() => setFormData({ ...formData, description: template.description, propertyType: template.propertyType })}
              className="rounded-pill border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:border-primary hover:text-primary"
            >
              {template.label}
            </button>
          ))}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Requirement *</label>
          <Textarea
            placeholder="e.g., Need 2BHK apartment in Kolkata under 50 lakhs, lift and parking preferred"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Property Type *</label>
            <select
              value={formData.propertyType}
              onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
              required
              className="w-full rounded-btn border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select Property Type</option>
              {Object.values(PROPERTY_TYPES).flat().map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <Input
            label="Locality"
            placeholder="e.g. Salt Lake"
            value={formData.locality}
            onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">City *</label>
            <select
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
              className="w-full rounded-btn border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select City</option>
              {INDIAN_CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Min Budget"
            type="number"
            placeholder="e.g., 3000000"
            value={formData.budgetMin}
            onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
          />
          <Input
            label="Max Budget"
            type="number"
            placeholder="e.g., 5000000"
            value={formData.budgetMax}
            onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Requirement"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function MatchingPropertiesDrawer({
  requirement,
  properties,
  loading,
  onClose,
  onSendRequirement,
  onCallBroker,
  onShareProperty,
}: {
  requirement: Requirement | null;
  properties: MatchedProperty[];
  loading: boolean;
  onClose: () => void;
  onSendRequirement: (property: MatchedProperty, requirement: Requirement) => void;
  onCallBroker: (property: MatchedProperty) => void;
  onShareProperty: (property: MatchedProperty, requirement: Requirement) => void;
}) {
  if (!requirement) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-modal sm:border-l sm:border-border">
        <div className="border-b border-border bg-primary p-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-pill border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">
                <Target size={13} />
                Property matches
              </div>
              <h2 className="line-clamp-2 text-xl font-semibold">{requirement.description}</h2>
              <p className="mt-1 text-sm text-white/70">
                {requirement.locality || requirement.city} - {requirement.propertyType} - {getBudgetText(requirement)}
              </p>
            </div>
            <button type="button" onClick={onClose} className="rounded-btn p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white" aria-label="Close matches">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4 grid grid-cols-3 gap-2">
            <RequirementMatchSignal label="Matched supply" value={properties.length} />
            <RequirementMatchSignal label="Broker" value={requirement.broker.name} />
            <RequirementMatchSignal label="Posted" value={new Date(requirement.createdAt).toLocaleDateString("en-IN")} />
          </div>

          {loading ? (
            <div className="flex h-72 items-center justify-center rounded-card border border-border bg-surface">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-card border border-dashed border-border bg-surface p-8 text-center">
              <Building2 size={46} className="mx-auto mb-3 text-primary" />
              <h3 className="font-semibold text-foreground">No matching property yet</h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                This is a supply gap. Use it to source inventory from the network or post a matching property when you get one.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {properties.map((property) => {
                const score = getPropertyFit(requirement, property);
                const brokerName = getMatchedPropertyBrokerName(property);
                const imageUrl = property.coverImage || property.images?.[0] || "";

                return (
                  <div key={property.id} className="overflow-hidden rounded-card border border-border bg-surface">
                    <div className="grid gap-0 sm:grid-cols-[150px_1fr]">
                      <div className="h-36 bg-white sm:h-full">
                        {imageUrl ? (
                          <img src={imageUrl} alt={property.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-primary">
                            <Building2 size={34} />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={score.variant}>{score.label}</Badge>
                          <Badge variant="blue">{property.listingType}</Badge>
                          <Badge variant="accent">{formatPrice(property.price)}</Badge>
                        </div>
                        <h3 className="mt-3 line-clamp-1 font-semibold text-foreground">{property.title}</h3>
                        <p className="mt-1 line-clamp-1 text-sm text-text-secondary">{property.locality ? `${property.locality}, ` : ""}{property.address}, {property.city}</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                          <InfoTile label="Area" value={`${Math.round(property.area).toLocaleString()} ${property.areaUnit}`} />
                          <InfoTile label="Broker" value={brokerName} />
                          <InfoTile label="Freshness" value={getMatchedPropertyFreshness(property.updatedAt)} highlight />
                        </div>
                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                          <Button size="sm" variant="accent" onClick={() => onSendRequirement(property, requirement)}>
                            <MessageCircle size={14} className="mr-2" />
                            Send Demand
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onCallBroker(property)}>
                            <Phone size={14} className="mr-2" />
                            Call Broker
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => onShareProperty(property, requirement)}>
                            <Share2 size={14} className="mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
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

function getMatchedPropertyBrokerName(property: MatchedProperty) {
  if (!property.assignedBrokerId) return "KrrishJazz";
  return property.assignedBroker?.name || property.publicBrokerName || "Network Broker";
}

function getMatchedPropertyBrokerId(property: MatchedProperty) {
  return property.assignedBrokerId || property.postedById || property.postedBy?.id || null;
}

function getMatchedPropertyBrokerPhone(property: MatchedProperty) {
  if (!property.assignedBrokerId) return process.env.NEXT_PUBLIC_PLATFORM_PHONE || "+91XXXXXXXXXX";
  return property.assignedBroker?.phone || "";
}

function getMatchedPropertyFreshness(updatedAt: string) {
  const days = Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 1) return "Today";
  if (days < 7) return `${days}d fresh`;
  if (days < 21) return `${days}d old`;
  return "Needs check";
}

function getPropertyFit(requirement: Requirement, property: MatchedProperty) {
  let score = 0;
  const cityMatch = property.city.toLowerCase().includes(requirement.city.toLowerCase()) || requirement.city.toLowerCase().includes(property.city.toLowerCase());
  const typeMatch = property.propertyType === requirement.propertyType;
  const budgetMatch = (!requirement.budgetMin || property.price >= requirement.budgetMin) && (!requirement.budgetMax || property.price <= requirement.budgetMax);

  if (cityMatch) score += 35;
  if (typeMatch) score += 35;
  if (budgetMatch) score += 30;

  if (score >= 90) return { label: "Strong fit", variant: "success" as const };
  if (score >= 65) return { label: "Good fit", variant: "accent" as const };
  return { label: "Review fit", variant: "warning" as const };
}

function RequirementMatchSignal({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card border border-border bg-surface p-3">
      <p className="truncate text-sm font-semibold text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-text-secondary">{label}</p>
    </div>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: number; tone: "default" | "success" | "accent" | "primary" }) {
  const toneClass = {
    default: "border-border bg-surface text-foreground",
    success: "border-success/20 bg-success/10 text-success",
    accent: "border-accent/20 bg-accent/10 text-accent",
    primary: "border-primary/20 bg-primary-light text-primary",
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

function InfoTile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("rounded-btn border px-3 py-2", highlight ? "border-accent/20 bg-accent/10" : "border-border bg-surface")}>
      <p className={cn("text-sm font-semibold", highlight ? "text-accent" : "text-foreground")}>{value}</p>
      <p className="mt-0.5 text-xs text-text-secondary">{label}</p>
    </div>
  );
}
