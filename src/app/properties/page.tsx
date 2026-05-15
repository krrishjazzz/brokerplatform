"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Bell,
  BookmarkPlus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn, formatPrice } from "@/lib/utils";
import { PROPERTY_TYPES, FURNISHING_OPTIONS } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { FilterChip, FilterGroup } from "@/components/properties/filter-primitives";
import { GuidedSearchStart } from "@/components/properties/guided-search-start";
import { NoMatchRequirementCapture } from "@/components/properties/no-match-requirement-capture";
import { PropertyCard } from "@/components/properties/property-card";
import { getFreshness } from "@/components/properties/property-display";
import { CATEGORY_OPTIONS, LISTING_TABS, QUICK_FILTERS, TRUST_FILTERS } from "@/components/properties/search-options";
import type { Pagination, Property } from "@/components/properties/types";

const SAVED_SEARCH_KEY = "krrishjazz:saved-searches:v1";

type SavedSearchFilters = {
  listingType: string;
  category: string;
  propertyType: string;
  locality: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  furnishing: string;
  freshOnly: boolean;
  verifiedOnly: boolean;
  readyToVisitOnly: boolean;
  ownerListedOnly: boolean;
  budgetMatchOnly: boolean;
  availability: string;
  sort: string;
  query: string;
};

type SavedSearch = {
  id: string;
  label: string;
  filters: SavedSearchFilters;
  savedAt: number;
};

function buildSearchLabel(filters: SavedSearchFilters) {
  const parts: string[] = [];
  if (filters.bedrooms) parts.push(`${filters.bedrooms} BHK`);
  if (filters.propertyType) parts.push(filters.propertyType);
  else if (filters.category) parts.push(filters.category);
  if (filters.locality) parts.push(`in ${filters.locality}`);
  else if (filters.city) parts.push(`in ${filters.city}`);
  else if (filters.query) parts.push(filters.query);
  if (filters.listingType) parts.push(`(${filters.listingType})`);
  return parts.join(" ").trim();
}

function getInitialPage(value: string | null) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function resolveIntentPreset(intent: string | null) {
  if (intent === "buy") return { listingType: "BUY", category: "" };
  if (intent === "rent") return { listingType: "RENT", category: "" };
  if (intent === "commercial") return { listingType: "", category: "COMMERCIAL" };
  if (intent === "land") return { listingType: "", category: "", propertyType: "Residential Plot" };
  return { listingType: "", category: "" };
}

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const intentPreset = useMemo(() => resolveIntentPreset(searchParams.get("intent")), [searchParams]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [listingType, setListingType] = useState(searchParams.get("listingType") || intentPreset.listingType || "");
  const [category, setCategory] = useState(searchParams.get("category") || intentPreset.category || "");
  const [propertyType, setPropertyType] = useState(searchParams.get("propertyType") || intentPreset.propertyType || "");
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
  const [page, setPage] = useState(getInitialPage(searchParams.get("page")));
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

  const specificIntentCount = useMemo(
    () =>
      [
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
      ].filter(Boolean).length,
    [
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
    ]
  );
  const broadIntentCount = useMemo(() => [listingType, category].filter(Boolean).length, [listingType, category]);
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

  const availablePropertyTypes = useMemo(
    () => (category ? PROPERTY_TYPES[category] || [] : Object.values(PROPERTY_TYPES).flat()),
    [category]
  );

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

  const activeFilters = useMemo(
    () =>
      [
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
      ].filter(Boolean) as { label: string; clear: () => void }[],
    [
      listingType,
      category,
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
    ]
  );

  const propertySummary = useMemo(
    () => ({
      freshCount: properties.filter((property) => getFreshness(property.updatedAt).score === "high").length,
      verifiedCount: properties.filter((property) => property.verified).length,
      readyCount: properties.filter((property) => property.readyToVisit).length,
      ownerListedCount: properties.filter((property) => property.ownerListed).length,
    }),
    [properties]
  );

  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [savedOpen, setSavedOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SAVED_SEARCH_KEY);
      if (stored) setSavedSearches(JSON.parse(stored));
    } catch {
      // ignore storage errors
    }
  }, []);

  const persistSaved = (next: SavedSearch[]) => {
    setSavedSearches(next);
    try {
      localStorage.setItem(SAVED_SEARCH_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  const currentFiltersObject = useMemo<SavedSearchFilters>(() => ({
    listingType, category, propertyType, locality, city,
    minPrice, maxPrice, bedrooms, furnishing,
    freshOnly, verifiedOnly, readyToVisitOnly, ownerListedOnly, budgetMatchOnly,
    availability, sort, query,
  }), [
    listingType, category, propertyType, locality, city,
    minPrice, maxPrice, bedrooms, furnishing,
    freshOnly, verifiedOnly, readyToVisitOnly, ownerListedOnly, budgetMatchOnly,
    availability, sort, query,
  ]);

  const saveCurrentSearch = () => {
    if (!hasSearchIntent) {
      toast("Add at least one filter or search term before saving.", "info");
      return;
    }
    const label = buildSearchLabel(currentFiltersObject) || "Saved search";
    const next: SavedSearch = {
      id: `${Date.now()}`,
      label,
      filters: currentFiltersObject,
      savedAt: Date.now(),
    };
    const deduped = [next, ...savedSearches.filter((item) => item.label !== label)].slice(0, 10);
    persistSaved(deduped);
    toast("Search saved. Reopen anytime from Saved.", "success");
  };

  const applySavedSearch = (item: SavedSearch) => {
    const f = item.filters;
    setListingType(f.listingType || "");
    setCategory(f.category || "");
    setPropertyType(f.propertyType || "");
    setLocality(f.locality || "");
    setCity(f.city || "");
    setMinPrice(f.minPrice || "");
    setMaxPrice(f.maxPrice || "");
    setBedrooms(f.bedrooms || "");
    setFurnishing(f.furnishing || "");
    setFreshOnly(Boolean(f.freshOnly));
    setVerifiedOnly(Boolean(f.verifiedOnly));
    setReadyToVisitOnly(Boolean(f.readyToVisitOnly));
    setOwnerListedOnly(Boolean(f.ownerListedOnly));
    setBudgetMatchOnly(Boolean(f.budgetMatchOnly));
    setAvailability(f.availability || "");
    setSort(f.sort || "");
    setQuery(f.query || "");
    setPage(1);
    setSavedOpen(false);
    toast(`Applied: ${item.label}`, "success");
  };

  const deleteSavedSearch = (id: string) => {
    persistSaved(savedSearches.filter((item) => item.id !== id));
  };

  const visibleProperties = useMemo(
    () =>
      properties.filter((property) => {
        if (budgetMatchOnly && !isBudgetMatched(property)) return false;
        return true;
      }),
    [properties, budgetMatchOnly, minPrice, maxPrice]
  );

  const { freshCount, verifiedCount, readyCount, ownerListedCount } = propertySummary;

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

      {filtersOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/35 backdrop-blur-[2px] lg:hidden"
          onClick={() => setFiltersOpen(false)}
        />
      )}

      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 lg:flex-row lg:px-6">
        <aside
          className={cn(
            "shrink-0 space-y-4 overflow-y-auto rounded-card border border-border bg-white p-4 shadow-card lg:sticky lg:top-20 lg:block lg:h-fit lg:w-72",
            filtersOpen && "fixed inset-x-0 bottom-0 top-0 z-40 rounded-none pb-28 pt-5 lg:static lg:rounded-card lg:pb-4 lg:pt-4",
            filtersOpen ? "block" : "hidden"
          )}
        >
            <div className="flex items-center justify-between">
              <div>
              <h2 className="text-sm font-semibold text-foreground">Filters</h2>
              <p className="text-xs text-text-secondary">Pick what matters first</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={clearFilters} className="text-xs font-semibold text-accent hover:text-primary">Clear</button>
              <button type="button" onClick={() => setFiltersOpen(false)} className="rounded-btn border border-border p-2 text-text-secondary lg:hidden" aria-label="Close filters">
                <X size={16} />
              </button>
            </div>
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

          <div className="sticky bottom-0 -mx-4 -mb-4 border-t border-border bg-white p-4 lg:static lg:m-0 lg:border-0 lg:p-0">
            <Button onClick={() => { setFiltersOpen(false); fetchProperties(); }} className="w-full" size="sm">
              Show {shownTotal || ""} Properties
            </Button>
          </div>
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
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={() => setFiltersOpen(!filtersOpen)} variant="ghost" size="sm" className="hidden lg:inline-flex">
                  <SlidersHorizontal size={14} className="mr-2" />
                  Filters
                </Button>
                <Button
                  onClick={saveCurrentSearch}
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex"
                  disabled={!hasSearchIntent}
                  title={hasSearchIntent ? "Save these filters" : "Add filters to save"}
                >
                  <BookmarkPlus size={14} className="mr-2" />
                  Save Search
                </Button>
                <div className="relative">
                  <Button
                    onClick={() => setSavedOpen((open) => !open)}
                    variant="ghost"
                    size="sm"
                  >
                    <Bell size={14} className="mr-2" />
                    Saved
                    {savedSearches.length > 0 && (
                      <span className="ml-1.5 rounded-pill bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                        {savedSearches.length}
                      </span>
                    )}
                  </Button>
                  {savedOpen && (
                    <SavedSearchesDropdown
                      items={savedSearches}
                      onApply={applySavedSearch}
                      onDelete={deleteSavedSearch}
                      onClose={() => setSavedOpen(false)}
                    />
                  )}
                </div>
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
                  isLoggedIn={Boolean(user)}
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
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="min-w-0">
            <p className="truncate text-xs text-text-secondary">{hasSearchIntent ? "Matching properties" : "Start with filters"}</p>
            <p className="truncate text-sm font-bold text-foreground">{hasSearchIntent ? shownTotal : activeFilters.length} {hasSearchIntent ? "results" : "selected"}</p>
          </div>
          {activeFilters.length > 0 && (
            <button type="button" onClick={clearFilters} className="text-xs font-semibold text-primary">
              Clear
            </button>
          )}
        </div>
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
            Show
          </Button>
        </div>
      </div>
    </main>
  );
}

function SavedSearchesDropdown({
  items,
  onApply,
  onDelete,
  onClose,
}: {
  items: SavedSearch[];
  onApply: (item: SavedSearch) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} aria-hidden />
      <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-72 overflow-hidden rounded-card border border-border bg-white shadow-modal">
        <div className="border-b border-border px-3 py-2">
          <p className="text-sm font-semibold text-foreground">Saved Searches</p>
          <p className="text-[11px] text-text-secondary">Quickly reload your filter combos.</p>
        </div>
        {items.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs text-text-secondary">
            No saved searches yet. Tap <span className="font-semibold text-primary">Save Search</span> to add one.
          </div>
        ) : (
          <ul className="max-h-72 overflow-y-auto py-1">
            {items.map((item) => (
              <li key={item.id} className="group flex items-center gap-2 px-2 py-1.5 hover:bg-surface">
                <button
                  type="button"
                  onClick={() => onApply(item)}
                  className="min-w-0 flex-1 rounded-btn px-2 py-1 text-left text-xs"
                >
                  <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-[11px] text-text-secondary">
                    {new Date(item.savedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="rounded-btn p-1.5 text-text-secondary hover:text-error"
                  aria-label="Delete saved search"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense>
      <PropertiesContent />
    </Suspense>
  );
}
