"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  ChevronDown,
  Home,
  IndianRupee,
  Key,
  LayoutGrid,
  Map,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  applySearchLocationParams,
  SEARCH_LOCATION_OPTIONS,
} from "@/lib/search-location";

type SearchTabId = "buy" | "rent" | "commercial" | "projects" | "plots";

type PropertyTypeOption = {
  id: string;
  label: string;
  apiTypes: string[];
  searchQuery?: string;
};

type SearchTab = {
  id: SearchTabId;
  label: string;
  icon: typeof Home;
  params: Record<string, string>;
};

const SEARCH_TABS: SearchTab[] = [
  { id: "buy", label: "Buy", icon: Home, params: { listingType: "BUY", category: "RESIDENTIAL" } },
  { id: "rent", label: "Rent", icon: Key, params: { listingType: "RENT", category: "RESIDENTIAL" } },
  { id: "commercial", label: "Commercial", icon: Building2, params: { category: "COMMERCIAL" } },
  { id: "projects", label: "Projects", icon: LayoutGrid, params: { listingType: "BUY", category: "RESIDENTIAL" } },
  { id: "plots", label: "Plots", icon: Map, params: {} },
];

const TAB_PROPERTY_TYPES: Record<SearchTabId, PropertyTypeOption[]> = {
  buy: [
    { id: "apartment", label: "Flat / Apartment", apiTypes: ["Apartment"] },
    { id: "builder-floor", label: "Builder Floor", apiTypes: ["Builder Floor"] },
    { id: "house-villa", label: "House / Villa", apiTypes: ["Independent House", "Villa"] },
    { id: "residential-land", label: "Plot", apiTypes: ["Residential Plot"] },
    { id: "studio", label: "1 RK / Studio", apiTypes: ["Studio Apartment"] },
    { id: "farm-house", label: "Farm House", apiTypes: ["Farm House"] },
    { id: "serviced", label: "Serviced Apt", apiTypes: ["Serviced Apartment"] },
    { id: "projects", label: "Projects", apiTypes: [], searchQuery: "project" },
  ],
  rent: [
    { id: "apartment", label: "Flat / Apartment", apiTypes: ["Apartment"] },
    { id: "builder-floor", label: "Builder Floor", apiTypes: ["Builder Floor"] },
    { id: "house-villa", label: "House / Villa", apiTypes: ["Independent House", "Villa"] },
    { id: "pg", label: "PG", apiTypes: ["PG / Co-living"] },
    { id: "serviced", label: "Serviced Apt", apiTypes: ["Serviced Apartment"] },
    { id: "studio", label: "Studio / 1 RK", apiTypes: ["Studio Apartment"] },
    { id: "penthouse", label: "Penthouse", apiTypes: ["Penthouse"] },
  ],
  commercial: [
    { id: "office", label: "Office", apiTypes: ["Office Space"] },
    { id: "shop", label: "Shop", apiTypes: ["Shop"] },
    { id: "showroom", label: "Showroom", apiTypes: ["Showroom"] },
    { id: "coworking", label: "Co-working", apiTypes: ["Co-working Space"] },
    { id: "warehouse", label: "Warehouse", apiTypes: ["Warehouse / Godown"] },
    { id: "commercial-land", label: "Land", apiTypes: ["Commercial Land"] },
  ],
  projects: [
    { id: "apartment", label: "Apartment", apiTypes: ["Apartment"] },
    { id: "villa", label: "Villa", apiTypes: ["Villa"] },
    { id: "house", label: "House", apiTypes: ["Independent House"] },
    { id: "builder-floor", label: "Builder Floor", apiTypes: ["Builder Floor"] },
    { id: "township", label: "Township", apiTypes: [], searchQuery: "project" },
  ],
  plots: [
    { id: "residential-plot", label: "Residential", apiTypes: ["Residential Plot"] },
    { id: "commercial-land", label: "Commercial", apiTypes: ["Commercial Land"] },
    { id: "agricultural", label: "Agricultural", apiTypes: ["Agricultural Land"] },
    { id: "industrial-plot", label: "Industrial", apiTypes: ["Industrial Plot"] },
    { id: "farm-land", label: "Farm Land", apiTypes: ["Farm Land"] },
  ],
};

const BUDGET_OPTIONS = [
  { label: "Any Budget", value: "" },
  { label: "Under 25K / month", value: "25000", forRent: true },
  { label: "Under 50K / month", value: "50000", forRent: true },
  { label: "Under 50L", value: "5000000", forBuy: true },
  { label: "Under 1Cr", value: "10000000", forBuy: true },
  { label: "Under 2Cr", value: "20000000", forBuy: true },
  { label: "Under 5Cr", value: "50000000", forBuy: true },
];

function getTabTypeIds(tabId: SearchTabId) {
  return TAB_PROPERTY_TYPES[tabId].map((type) => type.id);
}

function getTabApiTypes(tabId: SearchTabId) {
  return Array.from(new Set(TAB_PROPERTY_TYPES[tabId].flatMap((type) => type.apiTypes)));
}

function collectApiTypes(selectedIds: Set<string>, options: PropertyTypeOption[]) {
  const types: string[] = [];
  options.forEach((item) => {
    if (selectedIds.has(item.id)) types.push(...item.apiTypes);
  });
  return Array.from(new Set(types));
}

function collectSearchQueries(selectedIds: Set<string>, options: PropertyTypeOption[]) {
  return options
    .filter((item) => selectedIds.has(item.id) && item.searchQuery)
    .map((item) => item.searchQuery as string);
}

export function SmartSearchPanel() {
  const router = useRouter();
  const locationRef = useRef<HTMLDivElement>(null);
  const [activeTabId, setActiveTabId] = useState<SearchTabId>("buy");
  const [location, setLocation] = useState("Kolkata");
  const [locationOpen, setLocationOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [budget, setBudget] = useState("");
  const [selectedTypeIds, setSelectedTypeIds] = useState<Set<string>>(() => new Set(getTabTypeIds("buy")));

  const activeTab = SEARCH_TABS.find((tab) => tab.id === activeTabId) ?? SEARCH_TABS[0];
  const activeTypeOptions = TAB_PROPERTY_TYPES[activeTabId];
  const allTypeIds = getTabTypeIds(activeTabId);
  const allApiTypes = getTabApiTypes(activeTabId);
  const allSelected = selectedTypeIds.size === allTypeIds.length;

  const budgetOptions = useMemo(() => {
    const isRentLike = activeTabId === "rent";
    return BUDGET_OPTIONS.filter((option) => {
      if (!option.value) return true;
      if (isRentLike) return option.forRent;
      return option.forBuy ?? !option.forRent;
    });
  }, [activeTabId]);

  useEffect(() => {
    setBudget("");
    setSelectedTypeIds(new Set(getTabTypeIds(activeTabId)));
  }, [activeTabId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setLocationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buildParams = (overrides: Record<string, string> = {}) => {
    const params = new URLSearchParams();
    Object.entries(activeTab.params).forEach(([key, value]) => {
      if (key === "q" && search.trim()) return;
      if (value) params.set(key, value);
    });

    applySearchLocationParams(params, location);
    if (search.trim()) params.set("q", search.trim());
    if (budget) params.set("maxPrice", budget);

    const apiTypes = collectApiTypes(selectedTypeIds, activeTypeOptions);
    const isFullTypeSelection = apiTypes.length === allApiTypes.length;
    if (apiTypes.length > 0 && !isFullTypeSelection) {
      apiTypes.forEach((type) => params.append("propertyType", type));
    }

    const typeQueries = collectSearchQueries(selectedTypeIds, activeTypeOptions);
    if (!allSelected && !search.trim() && !params.get("q") && typeQueries.length > 0) {
      const uniqueQueries = Array.from(new Set(typeQueries));
      if (uniqueQueries.length === 1) params.set("q", uniqueQueries[0]);
    }

    if (activeTabId === "projects" && !search.trim() && !params.get("q")) {
      params.set("q", "project");
    }

    if (activeTabId === "plots" && !params.get("category") && apiTypes.length > 0 && !isFullTypeSelection) {
      const plotCategories = new Set<string>();
      if (apiTypes.some((t) => ["Residential Plot", "Farm House"].includes(t))) plotCategories.add("RESIDENTIAL");
      if (apiTypes.some((t) => t === "Commercial Land")) plotCategories.add("COMMERCIAL");
      if (apiTypes.some((t) => ["Agricultural Land", "Farm Land", "Plantation Land", "Orchard"].includes(t))) {
        plotCategories.add("AGRICULTURAL");
      }
      if (apiTypes.some((t) => t === "Industrial Plot")) plotCategories.add("INDUSTRIAL");
      if (plotCategories.size === 1) params.set("category", Array.from(plotCategories)[0]);
    }

    Object.entries(overrides).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    return params;
  };

  const runSearch = (overrides: Record<string, string> = {}) => {
    router.push(`/properties?${buildParams(overrides).toString()}`);
  };

  const toggleType = (id: string) => {
    setSelectedTypeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size === 1) return prev;
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllTypes = () => setSelectedTypeIds(new Set(allTypeIds));

  return (
    <div className="mx-auto mt-6 w-full max-w-4xl">
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_16px_48px_rgba(0,92,168,0.14)]">
        {/* Intent tabs — 99acres-style top bar */}
        <div className="flex border-b border-border bg-[#f7fafc]">
          {SEARCH_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={cn(
                  "relative flex flex-1 flex-col items-center gap-1 border-b-2 px-2 py-3 transition-colors sm:flex-row sm:justify-center sm:gap-2 sm:px-4",
                  isActive
                    ? "border-primary bg-white text-primary"
                    : "border-transparent text-text-secondary hover:bg-white/70 hover:text-primary"
                )}
              >
                <Icon size={17} strokeWidth={isActive ? 2.25 : 2} />
                <span className="text-[11px] font-bold uppercase tracking-wide sm:text-xs sm:normal-case sm:tracking-normal">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-4 sm:p-5">
          {/* Primary hero search row */}
          <div className="overflow-hidden rounded-xl border-2 border-primary/25 shadow-[0_6px_20px_rgba(0,92,168,0.12)]">
            <div className="flex flex-col sm:flex-row">
              <div ref={locationRef} className="relative border-b border-border sm:w-[9.5rem] sm:shrink-0 sm:border-b-0 sm:border-r">
                <button
                  type="button"
                  onClick={() => setLocationOpen((open) => !open)}
                  className="flex h-full w-full items-center gap-2 bg-surface px-3 py-3.5 text-left text-sm font-semibold text-foreground hover:bg-primary-light/40"
                >
                  <MapPin size={17} className="shrink-0 text-primary" />
                  <span className="truncate">{location || "City"}</span>
                  <ChevronDown size={15} className={cn("ml-auto shrink-0 text-text-tertiary transition-transform", locationOpen && "rotate-180")} />
                </button>
                {locationOpen && (
                  <div className="absolute left-0 right-0 top-full z-40 max-h-52 overflow-y-auto rounded-b-xl border border-border bg-white py-1 shadow-card sm:min-w-[11rem]">
                    {SEARCH_LOCATION_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setLocation(option);
                          setLocationOpen(false);
                        }}
                        className={cn(
                          "block w-full px-3 py-2 text-left text-sm font-medium transition-colors",
                          location === option ? "bg-primary-light text-primary" : "text-foreground hover:bg-surface"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 items-center gap-2 border-b border-border px-3 py-2 sm:border-b-0 sm:border-r sm:py-0">
                <Search size={20} className="shrink-0 text-primary" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && runSearch()}
                  placeholder="Search locality, project, landmark..."
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-medium text-foreground outline-none placeholder:font-normal placeholder:text-text-secondary"
                  aria-label="Search locality, project, or landmark"
                />
              </div>

              <button
                type="button"
                onClick={() => runSearch()}
                className="flex items-center justify-center gap-2 bg-primary px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark sm:min-w-[7.5rem]"
              >
                <Search size={18} strokeWidth={2.5} />
                Search
              </button>
            </div>
          </div>

          {/* Secondary row: budget + property types */}
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Budget</span>
              <div className="relative flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2">
                <IndianRupee size={15} className="text-primary" />
                <select
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  className="cursor-pointer bg-transparent pr-6 text-sm font-semibold text-foreground outline-none"
                  aria-label="Budget"
                >
                  {budgetOptions.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {!allSelected && (
                <span className="rounded-pill bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">
                  {selectedTypeIds.size} type{selectedTypeIds.size > 1 ? "s" : ""} selected
                </span>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Property type</span>
                <button type="button" onClick={selectAllTypes} className="text-xs font-semibold text-primary hover:underline">
                  {allSelected ? "All types" : "Select all"}
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {activeTypeOptions.map((type) => {
                  const selected = selectedTypeIds.has(type.id);
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => toggleType(type.id)}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-pill border px-3 py-2 text-xs font-semibold transition-colors",
                        selected
                          ? "border-primary bg-primary text-white shadow-sm"
                          : "border-border bg-white text-foreground hover:border-primary/30 hover:bg-primary-light/50"
                      )}
                    >
                      {selected && <Check size={12} strokeWidth={3} />}
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/properties?${buildParams().toString()}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary-light/40 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-light"
            >
              <SlidersHorizontal size={16} />
              More filters on results page
            </Link>
            {activeTabId === "projects" && (
              <Link
                href="/projects"
                className="flex items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface"
              >
                Browse projects hub
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
