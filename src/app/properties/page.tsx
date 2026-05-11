"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BadgeCheck,
  Bath,
  BedDouble,
  BellRing,
  Building2,
  Eye,
  Heart,
  Home,
  MapPin,
  Maximize,
  MessageCircle,
  Search,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn, formatPrice } from "@/lib/utils";
import { PROPERTY_TYPES, PROPERTY_CATEGORY_OPTIONS, FURNISHING_OPTIONS } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";

interface Property {
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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type BadgeVariant = "default" | "success" | "warning" | "error" | "blue" | "accent";

const LISTING_TABS = [
  { label: "Buy", value: "BUY" },
  { label: "Rent", value: "RENT" },
  { label: "Resale", value: "RESALE" },
  { label: "Lease", value: "LEASE" },
  { label: "Commercial", value: "COMMERCIAL" },
];

const CATEGORY_OPTIONS = PROPERTY_CATEGORY_OPTIONS.map((category) => ({
  label: category.label,
  value: category.value,
}));

const TRUST_FILTERS = [
  { label: "Verified", action: "verified", icon: ShieldCheck },
  { label: "Fresh", action: "fresh", icon: BellRing },
  { label: "Ready to Visit", action: "ready", icon: Eye },
  { label: "Owner Listed", action: "owner", icon: Home },
  { label: "Budget Match", action: "budget", icon: BadgeCheck },
];

const QUICK_FILTERS = [
  { label: "Office", action: "office" },
  { label: "2 BHK", action: "2bhk" },
  { label: "Warehouse", action: "warehouse" },
];

function getFreshness(updatedAt?: string) {
  const days = updatedAt ? Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)) : 99;
  if (days < 1) return { label: "Updated today", variant: "success" as const, score: "high" as const };
  if (days < 7) return { label: `${days}d fresh`, variant: "success" as const, score: "high" as const };
  if (days < 21) return { label: `${days}d old`, variant: "warning" as const, score: "medium" as const };
  return { label: "Needs check", variant: "error" as const, score: "low" as const };
}

function getSmartSpecs(property: Property) {
  const type = property.propertyType.toLowerCase();
  const specs: { label: string; value: string; icon?: ReactNode }[] = [];

  if (/(apartment|villa|house|penthouse|studio|row|floor)/.test(type)) {
    if (property.bedrooms) specs.push({ label: "Beds", value: `${property.bedrooms} BHK`, icon: <BedDouble size={13} /> });
    if (property.bathrooms) specs.push({ label: "Bath", value: `${property.bathrooms}`, icon: <Bath size={13} /> });
    if (property.floor != null) specs.push({ label: "Floor", value: property.totalFloors != null ? `${property.floor}/${property.totalFloors}` : `${property.floor}` });
    if (property.furnishing) specs.push({ label: "Furnishing", value: property.furnishing });
  } else if (/(office|co-working|shop|showroom|mall|restaurant|cafe|sco)/.test(type)) {
    specs.push({ label: "Use", value: property.propertyType });
    if (property.furnishing) specs.push({ label: "Fit-out", value: property.furnishing });
    specs.push({ label: "Power", value: property.amenities.includes("Power Backup") ? "Backup" : "Check" });
    specs.push({ label: "Parking", value: property.amenities.includes("Parking") ? "Yes" : "Ask" });
  } else if (/(warehouse|godown|industrial|factory|shed|storage|logistics)/.test(type)) {
    specs.push({ label: "Use", value: property.propertyType });
    specs.push({ label: "Truck", value: property.amenities.includes("Visitor Parking") ? "Access" : "Ask" });
    specs.push({ label: "Power", value: property.amenities.includes("Power Backup") ? "Backup" : "Check" });
  } else if (/(plot|land|orchard|plantation)/.test(type)) {
    specs.push({ label: "Type", value: property.propertyType });
    specs.push({ label: "Road", value: "Ask" });
    specs.push({ label: "Facing", value: "Ask" });
  } else if (/(pg|co-living|hostel|serviced|guest|hotel|resort)/.test(type)) {
    specs.push({ label: "Use", value: property.propertyType });
    if (property.bedrooms) specs.push({ label: "Rooms", value: `${property.bedrooms}` });
    if (property.furnishing) specs.push({ label: "Setup", value: property.furnishing });
    specs.push({ label: "Food", value: property.amenities.includes("Food Service") ? "Yes" : "Ask" });
  } else {
    if (property.bedrooms) specs.push({ label: "Beds", value: `${property.bedrooms} BHK`, icon: <BedDouble size={13} /> });
    if (property.furnishing) specs.push({ label: "Furnishing", value: property.furnishing });
  }

  specs.unshift({ label: "Area", value: `${Math.round(property.area).toLocaleString()} ${property.areaUnit}`, icon: <Maximize size={13} /> });
  return specs.slice(0, 4);
}

function badgeVariant(type: string): BadgeVariant {
  switch (type) {
    case "BUY":
      return "blue";
    case "RENT":
      return "success";
    case "RESALE":
      return "warning";
    case "LEASE":
      return "accent";
    default:
      return "default";
  }
}

function listingLabel(type: string) {
  if (type === "BUY") return "For sale";
  if (type === "RENT") return "For rent";
  if (type === "LEASE") return "Lease";
  return type;
}

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [listingType, setListingType] = useState(searchParams.get("listingType") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [propertyType, setPropertyType] = useState(searchParams.get("propertyType") || "");
  const [locality, setLocality] = useState(searchParams.get("locality") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
  const [furnishing, setFurnishing] = useState(searchParams.get("furnishing") || "");
  const [freshOnly, setFreshOnly] = useState(searchParams.get("fresh") === "true");
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("verified") === "true");
  const [readyToVisitOnly, setReadyToVisitOnly] = useState(searchParams.get("readyToVisit") === "true");
  const [ownerListedOnly, setOwnerListedOnly] = useState(searchParams.get("ownerListed") === "true");
  const [budgetMatchOnly, setBudgetMatchOnly] = useState(searchParams.get("budgetMatch") === "true");
  const [availability, setAvailability] = useState(searchParams.get("availability") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [requirementForm, setRequirementForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    requirementType: searchParams.get("propertyType") || "",
    locality: searchParams.get("locality") || searchParams.get("q") || "",
    city: searchParams.get("city") || "",
    budgetMax: searchParams.get("maxPrice") || "",
    urgency: "THIS_WEEK",
    note: "",
  });
  const [requirementSubmitting, setRequirementSubmitting] = useState(false);
  const [requirementSent, setRequirementSent] = useState(false);

  const specificIntentCount = [
    propertyType,
    locality,
    city,
    minPrice,
    maxPrice,
    bedrooms,
    furnishing,
    freshOnly,
    verifiedOnly,
    readyToVisitOnly,
    ownerListedOnly,
    budgetMatchOnly,
    availability,
    query,
  ].filter(Boolean).length;
  const broadIntentCount = [listingType, category].filter(Boolean).length;
  const hasSearchIntent = specificIntentCount > 0 || broadIntentCount >= 2;
  const needsMoreFilters = broadIntentCount > 0 && !hasSearchIntent;

  const fetchProperties = useCallback(async () => {
    if (!hasSearchIntent) {
      setProperties([]);
      setPagination(null);
      setLoading(false);
      if (needsMoreFilters) {
        const params = new URLSearchParams();
        if (listingType) params.set("listingType", listingType);
        if (category) params.set("category", category);
        router.replace(`/properties?${params.toString()}`, { scroll: false });
      } else {
        router.replace("/properties", { scroll: false });
      }
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();
    if (listingType) params.set("listingType", listingType);
    if (category) params.set("category", category);
    if (propertyType) params.set("propertyType", propertyType);
    if (locality) params.set("locality", locality);
    if (city) params.set("city", city);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (furnishing) params.set("furnishing", furnishing);
    if (freshOnly) params.set("fresh", "true");
    if (verifiedOnly) params.set("verified", "true");
    if (readyToVisitOnly) params.set("readyToVisit", "true");
    if (ownerListedOnly) params.set("ownerListed", "true");
    if (budgetMatchOnly) params.set("budgetMatch", "true");
    if (availability) params.set("availability", availability);
    if (sort) params.set("sort", sort);
    if (query) params.set("q", query);
    params.set("page", page.toString());

    try {
      router.replace(`/properties?${params.toString()}`, { scroll: false });
      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      setProperties(data.properties || []);
      setPagination(data.pagination || null);
    } catch {
      console.error("Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  }, [hasSearchIntent, needsMoreFilters, listingType, category, propertyType, locality, city, minPrice, maxPrice, bedrooms, furnishing, freshOnly, verifiedOnly, readyToVisitOnly, ownerListedOnly, budgetMatchOnly, availability, sort, query, page, router]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleSaveProperty = async (propertyId: string) => {
    if (!user) {
      router.push("/login?redirect=/properties");
      return;
    }
    await fetch("/api/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId }),
    });
    toast("Property saved.", "success");
  };

  const shareProperty = async (property: Property) => {
    const url = `${window.location.origin}/properties/${property.slug}`;
    const text = [
      `${property.title} - ${formatPrice(Number(property.price))}`,
      `${property.propertyType} in ${property.city}`,
      `${Math.round(property.area).toLocaleString()} ${property.areaUnit}`,
      url,
    ].join("\n");

    if (navigator.share) {
      await navigator.share({ title: property.title, text, url });
      return;
    }

    await navigator.clipboard?.writeText(text);
    toast("Property share text copied.", "success");
  };

  const clearFilters = () => {
    setListingType("");
    setCategory("");
    setPropertyType("");
    setLocality("");
    setCity("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setFurnishing("");
    setFreshOnly(false);
    setVerifiedOnly(false);
    setReadyToVisitOnly(false);
    setOwnerListedOnly(false);
    setBudgetMatchOnly(false);
    setAvailability("");
    setSort("");
    setQuery("");
    setPage(1);
  };

  const applyQuickFilter = (action: string) => {
    setPage(1);
    if (action === "office") {
      setCategory("COMMERCIAL");
      setPropertyType("Office Space");
    }
    if (action === "2bhk") {
      setCategory("RESIDENTIAL");
      setBedrooms("2");
    }
    if (action === "warehouse") {
      setCategory("INDUSTRIAL");
      setPropertyType("Warehouse / Godown");
    }
    if (action === "verified") setVerifiedOnly((value) => !value);
    if (action === "fresh") setFreshOnly((value) => !value);
    if (action === "ready") setReadyToVisitOnly((value) => !value);
    if (action === "owner") setOwnerListedOnly((value) => !value);
    if (action === "budget") {
      setBudgetMatchOnly((value) => !value);
      if (!minPrice && !maxPrice) setMaxPrice(listingType === "RENT" ? "50000" : "10000000");
    }
  };

  const isBudgetMatched = (property: Property) => {
    const price = Number(property.price);
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    if (min != null && price < min) return false;
    if (max != null && price > max) return false;
    return min != null || max != null;
  };

  const availablePropertyTypes = category
    ? PROPERTY_TYPES[category] || []
    : Object.values(PROPERTY_TYPES).flat();

  const submitSearchRequirement = async () => {
    setRequirementSubmitting(true);
    try {
      const res = await fetch("/api/search-requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...requirementForm,
          requirementType: requirementForm.requirementType || propertyType || category || "Property",
          locality: requirementForm.locality || locality || query,
          city: requirementForm.city || city || "Kolkata",
          budgetMax: requirementForm.budgetMax ? Number(requirementForm.budgetMax) : undefined,
          sourceUrl: typeof window !== "undefined" ? window.location.href : "",
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const firstError = data?.error && typeof data.error === "object"
          ? Object.values(data.error).flat().filter(Boolean)[0]
          : data?.error;
        toast(String(firstError || "Could not submit your requirement."), "error");
        return;
      }
      setRequirementSent(true);
      toast("Requirement shared. KrrishJazz will look for matching options.", "success");
    } catch {
      toast("Could not submit your requirement.", "error");
    } finally {
      setRequirementSubmitting(false);
    }
  };

  const activeFilters = [
    listingType && { label: listingType, clear: () => setListingType("") },
    category && { label: category, clear: () => { setCategory(""); setPropertyType(""); } },
    propertyType && { label: propertyType, clear: () => setPropertyType("") },
    locality && { label: locality, clear: () => setLocality("") },
    city && { label: city, clear: () => setCity("") },
    minPrice && { label: `Min ${formatPrice(Number(minPrice))}`, clear: () => setMinPrice("") },
    maxPrice && { label: `Max ${formatPrice(Number(maxPrice))}`, clear: () => setMaxPrice("") },
    bedrooms && { label: `${bedrooms} BHK`, clear: () => setBedrooms("") },
    furnishing && { label: furnishing, clear: () => setFurnishing("") },
    freshOnly && { label: "Fresh", clear: () => setFreshOnly(false) },
    verifiedOnly && { label: "Verified", clear: () => setVerifiedOnly(false) },
    readyToVisitOnly && { label: "Ready to Visit", clear: () => setReadyToVisitOnly(false) },
    ownerListedOnly && { label: "Owner Listed", clear: () => setOwnerListedOnly(false) },
    budgetMatchOnly && { label: "Budget Match", clear: () => setBudgetMatchOnly(false) },
    availability && { label: availability.replaceAll("_", " "), clear: () => setAvailability("") },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const freshCount = properties.filter((property) => getFreshness(property.updatedAt).score === "high").length;
  const verifiedCount = properties.filter((property) => property.verified).length;
  const readyCount = properties.filter((property) => property.readyToVisit).length;
  const ownerListedCount = properties.filter((property) => property.ownerListed).length;

  const visibleProperties = properties.filter((property) => {
    if (budgetMatchOnly && !isBudgetMatched(property)) return false;
    return true;
  });

  const shownTotal = budgetMatchOnly ? visibleProperties.length : pagination?.total ?? properties.length;

  return (
    <main className="min-h-screen bg-surface pb-20 lg:pb-8">
      <section className="border-b border-border bg-primary-light">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_300px] lg:items-end">
            <div className="text-center lg:text-left">
              <div className="mb-3 inline-flex items-center gap-2 rounded-pill border border-primary/20 bg-white px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
                <Sparkles size={14} />
                Search before you browse
              </div>
              <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Choose filters. See better matches.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                Start with location, budget, or property type so you only see listings that match your intent.
              </p>
            </div>

            <div className={cn("grid grid-cols-3 gap-2", !hasSearchIntent && "hidden lg:grid")}>
              <div className="rounded-card border border-border bg-surface p-3">
                <p className="text-xs text-text-secondary">Results</p>
                <p className="mt-1 text-xl font-semibold text-foreground">{shownTotal}</p>
              </div>
              <div className="rounded-card border border-success/20 bg-success/10 p-3">
                <p className="text-xs text-text-secondary">Fresh</p>
                <p className="mt-1 text-xl font-semibold text-success">{freshCount}</p>
              </div>
              <div className="rounded-card border border-primary/20 bg-primary-light p-3">
                <p className="text-xs text-text-secondary">Verified</p>
                <p className="mt-1 text-xl font-semibold text-primary">{verifiedCount}</p>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-5 max-w-5xl rounded-card border border-primary/15 bg-white p-2 shadow-card">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex min-h-12 flex-1 items-center gap-3 rounded-btn border border-border bg-surface px-3 focus-within:border-primary">
                <Search size={20} className="shrink-0 text-primary" />
                <input
                  type="text"
                  placeholder="Search city, locality, project, office, flat..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setPage(1);
                      fetchProperties();
                    }
                  }}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-text-secondary"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { setPage(1); fetchProperties(); }} className="flex-1 lg:flex-none">
                  Search
                </Button>
                <Button onClick={() => setFiltersOpen(!filtersOpen)} variant="ghost" className="lg:hidden">
                  <SlidersHorizontal size={16} className="mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2 border-t border-border pt-2">
              {TRUST_FILTERS.map((filter) => {
                const Icon = filter.icon;
                const active =
                  (filter.action === "fresh" && freshOnly) ||
                  (filter.action === "verified" && verifiedOnly) ||
                  (filter.action === "ready" && readyToVisitOnly) ||
                  (filter.action === "owner" && ownerListedOnly) ||
                  (filter.action === "budget" && budgetMatchOnly);
                return (
                  <button
                    key={filter.label}
                    type="button"
                    onClick={() => applyQuickFilter(filter.action)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-xs font-semibold transition-colors",
                      active
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-surface text-text-secondary hover:border-primary/40 hover:text-primary"
                    )}
                  >
                    <Icon size={13} />
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {QUICK_FILTERS.map((filter) => (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => applyQuickFilter(filter.action)}
                  className={cn(
                    "rounded-pill border px-3 py-1.5 text-xs font-medium transition-colors",
                    "border-border bg-white text-text-secondary hover:border-primary/40 hover:text-primary"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 lg:flex-row lg:px-6">
        <aside
          className={cn(
            "shrink-0 space-y-4 overflow-y-auto rounded-card border border-border bg-white p-4 shadow-card lg:sticky lg:top-20 lg:block lg:h-fit lg:w-72",
            filtersOpen && "fixed inset-x-3 bottom-20 top-24 z-40 lg:static",
            filtersOpen ? "block" : "hidden"
          )}
        >
            <div className="flex items-center justify-between">
              <div>
              <h2 className="text-sm font-semibold text-foreground">Filters</h2>
              <p className="text-xs text-text-secondary">Pick what matters first</p>
            </div>
            <button onClick={clearFilters} className="text-xs font-semibold text-accent hover:text-primary">Clear</button>
          </div>

          <FilterGroup label="Listing Type">
            <div className="flex flex-wrap gap-1.5">
              {LISTING_TABS.map((tab) => (
                <FilterChip
                  key={tab.value}
                  active={listingType === tab.value}
                  onClick={() => { setListingType(listingType === tab.value ? "" : tab.value); setPage(1); }}
                >
                  {tab.label}
                </FilterChip>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label="Category">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_OPTIONS.map((option) => (
                <FilterChip
                  key={option.value}
                  active={category === option.value}
                  onClick={() => {
                    setCategory(category === option.value ? "" : option.value);
                    setPropertyType("");
                    setPage(1);
                  }}
                >
                  {option.label}
                </FilterChip>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label="Property Type">
            <select
              value={propertyType}
              onChange={(e) => { setPropertyType(e.target.value); setPage(1); }}
              className="w-full rounded-btn border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Types</option>
              {availablePropertyTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </FilterGroup>

          <FilterGroup label="Budget">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                className="w-full rounded-btn border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                className="w-full rounded-btn border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </FilterGroup>

          <FilterGroup label="Trust">
            <div className="flex flex-wrap gap-1.5">
              <FilterChip active={freshOnly} onClick={() => { setFreshOnly(!freshOnly); setPage(1); }}>
                Fresh
              </FilterChip>
              <FilterChip active={verifiedOnly} onClick={() => { setVerifiedOnly(!verifiedOnly); setPage(1); }}>
                Verified
              </FilterChip>
              <FilterChip active={readyToVisitOnly} onClick={() => { setReadyToVisitOnly(!readyToVisitOnly); setPage(1); }}>
                Ready to Visit
              </FilterChip>
              <FilterChip active={ownerListedOnly} onClick={() => { setOwnerListedOnly(!ownerListedOnly); setPage(1); }}>
                Owner Listed
              </FilterChip>
              <FilterChip active={budgetMatchOnly} onClick={() => { applyQuickFilter("budget"); setPage(1); }}>
                Budget Match
              </FilterChip>
            </div>
            <p className="mt-2 text-[11px] leading-4 text-text-secondary">
              Trust filters prioritize verified, fresh, visit-ready and owner-listed properties.
            </p>
          </FilterGroup>

          <FilterGroup label="BHK">
            <div className="flex gap-1.5">
              {["1", "2", "3", "4", "5"].map((bhk) => (
                <button
                  key={bhk}
                  type="button"
                  onClick={() => { setBedrooms(bedrooms === bhk ? "" : bhk); setPage(1); }}
                  className={cn(
                    "h-9 w-9 rounded-btn border text-sm font-semibold transition-colors",
                    bedrooms === bhk ? "border-primary bg-primary text-white" : "border-border bg-surface text-text-secondary hover:border-primary hover:text-primary"
                  )}
                >
                  {bhk}
                </button>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label="City">
            <input
              type="text"
              placeholder="Enter city"
              value={city}
              onChange={(e) => { setCity(e.target.value); setPage(1); }}
              className="w-full rounded-btn border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </FilterGroup>

          <FilterGroup label="Locality">
            <input
              type="text"
              placeholder="e.g. Salt Lake, Park Street"
              value={locality}
              onChange={(e) => { setLocality(e.target.value); setPage(1); }}
              className="w-full rounded-btn border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </FilterGroup>

          <FilterGroup label="Furnishing">
            <div className="flex flex-wrap gap-1.5">
              {FURNISHING_OPTIONS.map((option) => (
                <FilterChip
                  key={option}
                  active={furnishing === option}
                  onClick={() => { setFurnishing(furnishing === option ? "" : option); setPage(1); }}
                >
                  {option}
                </FilterChip>
              ))}
            </div>
          </FilterGroup>

          <Button onClick={() => { setFiltersOpen(false); fetchProperties(); }} className="w-full" size="sm">
            Show Properties
          </Button>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-4 rounded-card border border-border bg-white p-3 shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {hasSearchIntent && pagination ? `${shownTotal} matching properties` : "Find your match"}
                  {locality ? ` in ${locality}` : city && ` in ${city}`}
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {hasSearchIntent ? `${freshCount} fresh, ${verifiedCount} verified, ${readyCount} ready to visit, ${ownerListedCount} owner listed.` : "Use search or filters to reveal properties."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => setFiltersOpen(!filtersOpen)} variant="ghost" size="sm" className="hidden lg:inline-flex">
                  <SlidersHorizontal size={14} className="mr-2" />
                  Filters
                </Button>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="rounded-btn border border-border bg-surface px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                >
                  <option value="">Newest first</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                {activeFilters.map((filter) => (
                  <button
                    key={filter.label}
                    onClick={() => { filter.clear(); setPage(1); }}
                    className="inline-flex items-center gap-1 rounded-pill border border-primary/20 bg-primary-light px-3 py-1 text-xs font-medium text-primary hover:bg-primary-light/80"
                  >
                    {filter.label}
                    <X size={12} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {!hasSearchIntent ? (
            <GuidedSearchStart
              needsMoreFilters={needsMoreFilters}
              onPick={(next) => {
                setPage(1);
                if (next.category !== undefined) setCategory(next.category);
                if (next.propertyType !== undefined) setPropertyType(next.propertyType);
                if (next.listingType !== undefined) setListingType(next.listingType);
                if (next.query !== undefined) setQuery(next.query);
              }}
            />
          ) : loading ? (
            <div className="grid grid-cols-1 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-card border border-border bg-white p-4 shadow-card">
                  <div className="mb-4 h-40 rounded-btn bg-surface" />
                  <div className="mb-2 h-4 w-2/3 rounded bg-surface" />
                  <div className="mb-4 h-3 w-1/3 rounded bg-surface" />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-12 rounded bg-surface" />
                    <div className="h-12 rounded bg-surface" />
                    <div className="h-12 rounded bg-surface" />
                  </div>
                </div>
              ))}
            </div>
          ) : visibleProperties.length === 0 ? (
            <NoMatchRequirementCapture
              form={requirementForm}
              setForm={setRequirementForm}
              submitting={requirementSubmitting}
              sent={requirementSent}
              onSubmit={submitSearchRequirement}
              onClearFilters={clearFilters}
              onRelaxBudget={() => {
                setMinPrice("");
                setMaxPrice("");
                setBudgetMatchOnly(false);
                setPage(1);
              }}
              onShowNearby={() => {
                setLocality("");
                setQuery(city || "Kolkata");
                setPage(1);
              }}
              propertyTypes={availablePropertyTypes}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {visibleProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  user={user}
                  onSave={handleSaveProperty}
                  onShare={shareProperty}
                />
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-text-secondary">Page {page} of {pagination.totalPages}</span>
              <Button variant="ghost" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </section>
      </div>

      <div className="fixed inset-x-3 bottom-3 z-30 rounded-card border border-border bg-white p-2 shadow-modal lg:hidden">
        <div className="grid grid-cols-[1fr_1fr_1.1fr] gap-2">
          <Button onClick={() => setFiltersOpen(!filtersOpen)} variant="outline" className="w-full">
            <SlidersHorizontal size={16} className="mr-2" />
            Filters{activeFilters.length ? ` (${activeFilters.length})` : ""}
          </Button>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="min-h-10 rounded-btn border border-border bg-white px-2 text-xs font-semibold text-foreground outline-none focus:border-primary"
            aria-label="Sort properties"
          >
            <option value="">Newest</option>
            <option value="price_asc">Low price</option>
            <option value="price_desc">High price</option>
          </select>
          <Button onClick={() => { setPage(1); fetchProperties(); }} variant="accent" className="w-full">
            Search
          </Button>
        </div>
      </div>
    </main>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase text-text-secondary">{label}</p>
      {children}
    </div>
  );
}

function NoMatchRequirementCapture({
  form,
  setForm,
  submitting,
  sent,
  onSubmit,
  onClearFilters,
  onRelaxBudget,
  onShowNearby,
  propertyTypes,
}: {
  form: {
    name: string;
    phone: string;
    requirementType: string;
    locality: string;
    city: string;
    budgetMax: string;
    urgency: string;
    note: string;
  };
  setForm: (form: {
    name: string;
    phone: string;
    requirementType: string;
    locality: string;
    city: string;
    budgetMax: string;
    urgency: string;
    note: string;
  }) => void;
  submitting: boolean;
  sent: boolean;
  onSubmit: () => void;
  onClearFilters: () => void;
  onRelaxBudget: () => void;
  onShowNearby: () => void;
  propertyTypes: string[];
}) {
  const update = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });
  const [wizardStep, setWizardStep] = useState(0);
  const wizardLabels = ["Need", "Location", "Budget", "Contact"];

  return (
    <div className="overflow-hidden rounded-card border border-border bg-white shadow-card">
      <div className="grid gap-0 lg:grid-cols-[1fr_390px]">
        <div className="bg-primary-light p-6 lg:p-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-sm">
            <Search size={22} />
          </div>
          <h3 className="mt-5 text-2xl font-semibold text-foreground">No exact match yet</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
            Good search, thin supply. Share what you need and KrrishJazz can manually check owner and broker inventory instead of making you keep refreshing filters.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button type="button" onClick={onRelaxBudget} className="rounded-card border border-primary/15 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-card">
              <p className="text-sm font-semibold text-foreground">Relax budget</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">Remove strict price filters and see near matches.</p>
            </button>
            <button type="button" onClick={onShowNearby} className="rounded-card border border-primary/15 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-card">
              <p className="text-sm font-semibold text-foreground">Try nearby</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">Search broader localities around your preferred area.</p>
            </button>
            <button type="button" onClick={onClearFilters} className="rounded-card border border-primary/15 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-card">
              <p className="text-sm font-semibold text-foreground">Reset filters</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">Start clean with one city, type, or budget.</p>
            </button>
          </div>
        </div>

        <div className="border-t border-border bg-white p-5 lg:border-l lg:border-t-0">
          {sent ? (
            <div className="flex h-full min-h-80 flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-light text-success">
                <BadgeCheck size={24} />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-foreground">Requirement received</h4>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                KrrishJazz ops can now follow up and look for matching supply manually.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Tell KrrishJazz your requirement</p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">This becomes an assisted-search request for admin follow-up.</p>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {wizardLabels.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setWizardStep(index)}
                    className={cn(
                      "rounded-btn border px-2 py-2 text-[11px] font-semibold transition-colors",
                      wizardStep === index ? "border-primary bg-primary text-white" : "border-border bg-surface text-text-secondary"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {wizardStep === 0 && (
                <>
                  <select value={form.requirementType} onChange={(event) => update("requirementType", event.target.value)} className="min-h-11 w-full rounded-btn border border-border bg-surface px-3 text-sm outline-none focus:border-primary">
                    <option value="">Property type</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <textarea value={form.note} onChange={(event) => update("note", event.target.value)} placeholder="Anything important? floor, road, visit timing, furnishing..." className="min-h-24 w-full rounded-btn border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
                </>
              )}

              {wizardStep === 1 && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  <input value={form.locality} onChange={(event) => update("locality", event.target.value)} placeholder="Preferred locality" className="min-h-11 rounded-btn border border-border bg-surface px-3 text-sm outline-none focus:border-primary" />
                  <input value={form.city} onChange={(event) => update("city", event.target.value)} placeholder="City" className="min-h-11 rounded-btn border border-border bg-surface px-3 text-sm outline-none focus:border-primary" />
                </div>
              )}

              {wizardStep === 2 && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  <input type="number" value={form.budgetMax} onChange={(event) => update("budgetMax", event.target.value)} placeholder="Max budget" className="min-h-11 rounded-btn border border-border bg-surface px-3 text-sm outline-none focus:border-primary" />
                  <select value={form.urgency} onChange={(event) => update("urgency", event.target.value)} className="min-h-11 rounded-btn border border-border bg-surface px-3 text-sm outline-none focus:border-primary">
                    <option value="IMMEDIATE">Immediate</option>
                    <option value="THIS_WEEK">This week</option>
                    <option value="THIS_MONTH">This month</option>
                    <option value="EXPLORING">Just exploring</option>
                  </select>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  <input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Your name" className="min-h-11 rounded-btn border border-border bg-surface px-3 text-sm outline-none focus:border-primary" />
                  <input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+91XXXXXXXXXX" className="min-h-11 rounded-btn border border-border bg-surface px-3 text-sm outline-none focus:border-primary" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" disabled={wizardStep === 0} onClick={() => setWizardStep((step) => Math.max(0, step - 1))}>Back</Button>
                <Button type="button" variant="outline" disabled={wizardStep === wizardLabels.length - 1} onClick={() => setWizardStep((step) => Math.min(wizardLabels.length - 1, step + 1))}>Next</Button>
              </div>

              <Button onClick={onSubmit} loading={submitting} className="w-full" disabled={!form.name || !form.phone || !form.city}>
                Send Requirement
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GuidedSearchStart({
  needsMoreFilters,
  onPick,
}: {
  needsMoreFilters: boolean;
  onPick: (next: { category?: string; propertyType?: string; listingType?: string; query?: string }) => void;
}) {
  const starters = [
    { title: "Buy a home", desc: "Flats, villas, independent houses", icon: Home, tone: "bg-primary-light text-primary", next: { category: "RESIDENTIAL", listingType: "BUY" } },
    { title: "Rent a home", desc: "Ready-to-move rental homes", icon: Building2, tone: "bg-accent-light text-accent", next: { category: "RESIDENTIAL", listingType: "RENT" } },
    { title: "Commercial space", desc: "Offices, shops, showrooms", icon: Store, tone: "bg-success-light text-success", next: { category: "COMMERCIAL", propertyType: "Office Space" } },
    { title: "Plots and land", desc: "Investment land and plots", icon: MapPin, tone: "bg-warning-light text-[#9A5B00]", next: { propertyType: "Residential Plot" } },
  ];

  const localities = ["New Town", "Salt Lake", "Rajarhat", "Park Street", "Ballygunge", "Howrah"];

  return (
    <div className="rounded-card border border-border bg-white p-5 shadow-card">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
          <SlidersHorizontal size={22} />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-foreground">{needsMoreFilters ? "Add one more filter" : "Start with a filter"}</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-text-secondary">
          {needsMoreFilters
            ? "Buy, Rent, or Commercial alone is too broad. Add locality, budget, BHK, or property type so the results stay useful."
            : "We will show properties after you choose a need, location, budget, or search term. This keeps the page easy instead of overwhelming."}
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {starters.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => onPick(item.next)}
            className="group rounded-card border border-border bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:shadow-card"
          >
            <div className={cn("mb-4 flex h-11 w-11 items-center justify-center rounded-btn", item.tone)}>
              <item.icon size={21} />
            </div>
            <p className="font-semibold text-foreground group-hover:text-primary">{item.title}</p>
            <p className="mt-1 text-sm text-text-secondary">{item.desc}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <p className="mb-3 text-xs font-semibold uppercase text-text-secondary">Popular localities</p>
        <div className="flex flex-wrap gap-2">
          {localities.map((locality) => (
            <button
              key={locality}
              type="button"
              onClick={() => onPick({ query: locality })}
              className="rounded-pill border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary-light hover:text-primary"
            >
              {locality}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-pill border px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "border-primary bg-primary text-white" : "border-border bg-surface text-text-secondary hover:border-primary/40 hover:text-primary"
      )}
    >
      {children}
    </button>
  );
}

function PropertyCard({
  property,
  user,
  onSave,
  onShare,
}: {
  property: Property;
  user: ReturnType<typeof useAuth>["user"];
  onSave: (propertyId: string) => void;
  onShare: (property: Property) => void;
}) {
  const freshness = getFreshness(property.updatedAt);
  const image = property.coverImage || property.images[0];
  const pricePerUnit = property.area > 0 ? Math.round(property.price / property.area).toLocaleString("en-IN") : null;
  const brokerName = "KrrishJazz";
  const specs = getSmartSpecs(property).slice(0, 3);
  const trustSignals = [
    property.verified ? { label: "Verified", icon: ShieldCheck, tone: "text-success bg-success/10 border-success/20" } : null,
    property.readyToVisit ? { label: "Ready to Visit", icon: Eye, tone: "text-accent bg-accent/10 border-accent/20" } : null,
    getFreshness(property.updatedAt).score === "high" ? { label: "Fresh", icon: BellRing, tone: "text-primary bg-primary-light border-primary/20" } : null,
    property.ownerListed ? { label: "Owner Listed", icon: Home, tone: "text-warning bg-warning-light border-warning/20" } : null,
  ].filter(Boolean).slice(0, 3) as { label: string; icon: typeof ShieldCheck; tone: string }[];

  return (
    <article className="group overflow-hidden rounded-card border border-border bg-white shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lift">
      <div className="grid lg:grid-cols-[310px_1fr]">
        <div className="relative h-64 overflow-hidden bg-surface lg:h-full">
          <Link href={`/properties/${property.slug}`} className="block h-full">
            {image ? (
              <img
                src={image}
                alt={property.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-primary">
                <Building2 size={48} />
              </div>
            )}
          </Link>

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <Badge variant={badgeVariant(property.listingType)}>{listingLabel(property.listingType)}</Badge>
          </div>

          <button
            type="button"
            onClick={() => onSave(property.id)}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/92 text-text-secondary shadow-card transition-colors hover:text-accent"
            aria-label="Save property"
          >
            <Heart size={17} />
          </button>

          <div className="absolute bottom-3 left-3 rounded-pill bg-foreground/82 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            {property.images.length || (property.coverImage ? 1 : 0)} photo{property.images.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="flex min-w-0 flex-col p-4 lg:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <Link href={`/properties/${property.slug}`} className="block">
                <h2 className="line-clamp-2 text-xl font-semibold text-foreground group-hover:text-primary">{property.title}</h2>
              </Link>
              <p className="mt-2 flex items-center gap-1 text-sm text-text-secondary">
                <MapPin size={14} />
                <span className="line-clamp-1">{property.locality ? `${property.locality}, ` : ""}{property.city}</span>
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="blue">{property.propertyType}</Badge>
                <Badge variant={freshness.variant}>
                  <BellRing size={11} className="mr-1" />
                  {freshness.label}
                </Badge>
              </div>
            </div>

            <div className="shrink-0 sm:text-right">
              <p className="text-2xl font-bold text-primary">{formatPrice(Number(property.price))}</p>
              {pricePerUnit && <p className="mt-1 text-xs text-text-secondary">Rs {pricePerUnit}/sqft</p>}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {specs.map((spec) => (
              <span key={spec.label} className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground">
                {spec.icon}
                {spec.value}
              </span>
            ))}
          </div>

          <div className="mt-4 grid gap-2 rounded-card border border-primary/10 bg-primary-light/60 p-3 sm:grid-cols-[1fr_auto]">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-primary text-xs font-bold">
                {brokerName.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{brokerName}</p>
                <p className="text-xs text-text-secondary">KrrishJazz managed contact</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <ShieldCheck size={15} />
              Contact protected
            </div>
          </div>

          {trustSignals.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {trustSignals.map((signal) => {
                const Icon = signal.icon;
                return (
                  <span key={signal.label} className={cn("inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-xs font-semibold", signal.tone)}>
                    <Icon size={13} />
                    {signal.label}
                  </span>
                );
              })}
            </div>
          )}

          <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-2">
            <Link href={user ? `/properties/${property.slug}#enquire` : `/login?redirect=/properties/${property.slug}`} className="min-w-0">
              <Button variant="accent" className="w-full" size="sm">
                <MessageCircle size={14} className="mr-2" />
                Get Callback
              </Button>
            </Link>
            <Link href={`/properties/${property.slug}`}>
              <Button variant="outline" size="sm" aria-label="View details">
                <Eye size={14} className="mr-2" />
                <span className="hidden sm:inline">Details</span>
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => onShare(property)}
              className="inline-flex items-center justify-center rounded-btn border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary-light hover:text-primary"
              aria-label="Share property"
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense>
      <PropertiesContent />
    </Suspense>
  );
}
