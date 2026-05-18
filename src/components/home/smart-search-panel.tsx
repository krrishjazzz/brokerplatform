"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
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
  { id: "plots", label: "Plots / Land", icon: Map, params: {} },
];

const TAB_PROPERTY_TYPES: Record<SearchTabId, PropertyTypeOption[]> = {
  buy: [
    { id: "apartment", label: "Flat / Apartment", apiTypes: ["Apartment"] },
    { id: "builder-floor", label: "Builder Floor", apiTypes: ["Builder Floor"] },
    { id: "house-villa", label: "Independent House / Villa", apiTypes: ["Independent House", "Villa"] },
    { id: "residential-land", label: "Residential Land", apiTypes: ["Residential Plot"] },
    { id: "studio", label: "1 RK / Studio Apartment", apiTypes: ["Studio Apartment"] },
    { id: "farm-house", label: "Farm House", apiTypes: ["Farm House"] },
    { id: "serviced", label: "Serviced Apartments", apiTypes: ["Serviced Apartment"] },
    { id: "projects", label: "Projects", apiTypes: [], searchQuery: "project" },
    { id: "other", label: "Other", apiTypes: [] },
  ],
  rent: [
    { id: "apartment", label: "Flat / Apartment", apiTypes: ["Apartment"] },
    { id: "builder-floor", label: "Builder Floor", apiTypes: ["Builder Floor"] },
    { id: "house-villa", label: "Independent House / Villa", apiTypes: ["Independent House", "Villa"] },
    { id: "pg", label: "PG / Co-living", apiTypes: ["PG / Co-living"] },
    { id: "serviced", label: "Serviced Apartments", apiTypes: ["Serviced Apartment"] },
    { id: "studio", label: "Studio / 1 RK", apiTypes: ["Studio Apartment"] },
    { id: "rooms", label: "Rooms", apiTypes: ["PG / Co-living", "Hostel"] },
    { id: "penthouse", label: "Penthouse", apiTypes: ["Penthouse"] },
    { id: "other", label: "Other", apiTypes: [] },
  ],
  commercial: [
    { id: "office", label: "Office Space", apiTypes: ["Office Space"] },
    { id: "coworking", label: "Co-working Space", apiTypes: ["Co-working Space"] },
    { id: "shop", label: "Shop", apiTypes: ["Shop"] },
    { id: "showroom", label: "Showroom", apiTypes: ["Showroom"] },
    { id: "sco", label: "SCO Plot", apiTypes: ["SCO Plot"] },
    { id: "commercial-land", label: "Commercial Land", apiTypes: ["Commercial Land"] },
    { id: "mall", label: "Mall Space", apiTypes: ["Mall Space"] },
    { id: "warehouse", label: "Warehouse", apiTypes: ["Warehouse / Godown"] },
    { id: "other", label: "Other", apiTypes: [] },
  ],
  projects: [
    { id: "apartment", label: "Flat / Apartment", apiTypes: ["Apartment"] },
    { id: "villa", label: "Villa", apiTypes: ["Villa"] },
    { id: "house", label: "Independent House", apiTypes: ["Independent House"] },
    { id: "builder-floor", label: "Builder Floor", apiTypes: ["Builder Floor"] },
    { id: "row-house", label: "Row House", apiTypes: ["Row House"] },
    { id: "studio", label: "Studio Apartment", apiTypes: ["Studio Apartment"] },
    { id: "penthouse", label: "Penthouse", apiTypes: ["Penthouse"] },
    { id: "township", label: "Township / Project", apiTypes: [], searchQuery: "project" },
    { id: "other", label: "Other", apiTypes: [], searchQuery: "project" },
  ],
  plots: [
    { id: "residential-plot", label: "Residential Plot", apiTypes: ["Residential Plot"] },
    { id: "commercial-land", label: "Commercial Land", apiTypes: ["Commercial Land"] },
    { id: "agricultural", label: "Agricultural Land", apiTypes: ["Agricultural Land"] },
    { id: "farm-land", label: "Farm Land", apiTypes: ["Farm Land"] },
    { id: "industrial-plot", label: "Industrial Plot", apiTypes: ["Industrial Plot"] },
    { id: "farm-house", label: "Farm House", apiTypes: ["Farm House"] },
    { id: "plantation", label: "Plantation Land", apiTypes: ["Plantation Land"] },
    { id: "orchard", label: "Orchard", apiTypes: ["Orchard"] },
    { id: "other", label: "Other", apiTypes: [] },
  ],
};

const BUDGET_OPTIONS = [
  { label: "Any Budget", value: "" },
  { label: "Under 25K / month", value: "25000", forRent: true },
  { label: "Under 50K / month", value: "50000", forRent: true },
  { label: "Under 50L", value: "5000000", forBuy: true },
  { label: "Under 1Cr", value: "10000000", forBuy: true },
  { label: "Under 2Cr", value: "20000000", forBuy: true },
];

const LOCATION_OPTIONS = ["Kolkata", "Howrah", "Salt Lake", "New Town", "Rajarhat", "Ballygunge"];

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

  const buildParams = (overrides: Record<string, string> = {}) => {
    const params = new URLSearchParams();
    Object.entries(activeTab.params).forEach(([key, value]) => {
      if (key === "q" && search.trim()) return;
      if (value) params.set(key, value);
    });

    if (location.trim()) params.set("city", location.trim());
    if (search.trim()) params.set("q", search.trim());
    if (budget) params.set("maxPrice", budget);

    const apiTypes = collectApiTypes(selectedTypeIds, activeTypeOptions);
    const isFullTypeSelection = apiTypes.length === allApiTypes.length;
    if (apiTypes.length > 0 && !isFullTypeSelection) {
      apiTypes.forEach((type) => params.append("propertyType", type));
    }

    const typeQueries = collectSearchQueries(selectedTypeIds, activeTypeOptions);
    if (!search.trim() && !params.get("q") && typeQueries.length > 0) {
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
  const narrowDownLabel = allSelected ? "All Selected" : `${selectedTypeIds.size} Selected`;

  return (
    <div className="mx-auto mt-6 w-full max-w-2xl">
      <div className="overflow-hidden rounded-2xl border border-border-strong/80 bg-white shadow-[0_12px_40px_rgba(0,92,168,0.12)]">
        <div className="border-b border-border bg-surface-elevated/80 px-1 pt-1">
          <div className="flex snap-x snap-mandatory gap-0.5 overflow-x-auto scrollbar-none">
            {SEARCH_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTabId(tab.id)}
                  className={cn(
                    "relative flex min-w-[4.75rem] shrink-0 snap-start flex-col items-center gap-1 rounded-t-xl px-3 py-2.5 transition-all sm:min-w-[5.25rem]",
                    isActive
                      ? "bg-white text-primary shadow-[0_-2px_12px_rgba(0,92,168,0.08)]"
                      : "text-text-secondary hover:bg-white/60 hover:text-primary"
                  )}
                >
                  <Icon size={18} className={cn(isActive ? "text-primary" : "text-text-tertiary")} strokeWidth={isActive ? 2.25 : 2} />
                  <span className="whitespace-nowrap text-[11px] font-semibold leading-none">{tab.label}</span>
                  {isActive && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          <FieldCard
            label="Location"
            icon={<MapPin size={18} className="text-primary" />}
            onClick={() => setLocationOpen((open) => !open)}
            trailing={<ChevronDown size={16} className={cn("text-text-tertiary transition-transform", locationOpen && "rotate-180")} />}
          >
            <span className="text-sm font-semibold text-foreground">{location || "Select city"}</span>
            {locationOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 rounded-xl border border-border bg-white p-1.5 shadow-card">
                {LOCATION_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setLocation(option);
                      setLocationOpen(false);
                    }}
                    className={cn(
                      "flex w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                      location === option ? "bg-primary-light text-primary" : "text-foreground hover:bg-surface"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </FieldCard>

          <FieldCard label="Search" icon={<Search size={18} className="text-primary" />}>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && runSearch()}
              placeholder="Search locality, project, landmark..."
              className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:font-normal placeholder:text-text-secondary"
            />
          </FieldCard>

          <PropertyTypeGrid
            key={activeTabId}
            options={activeTypeOptions}
            selectedIds={selectedTypeIds}
            allSelected={allSelected}
            narrowDownLabel={narrowDownLabel}
            onToggle={toggleType}
            onSelectAll={selectAllTypes}
          />

          <FieldCard
            label="Budget"
            icon={<IndianRupee size={18} className="text-primary" />}
            trailing={
              <select
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                className="max-w-[9rem] cursor-pointer appearance-none bg-transparent text-right text-sm font-semibold text-foreground outline-none"
              >
                {budgetOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            }
          >
            <span className="text-sm font-semibold text-foreground">
              {budgetOptions.find((option) => option.value === budget)?.label ?? "Any Budget"}
            </span>
          </FieldCard>

          <button
            type="button"
            onClick={() => runSearch()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,92,168,0.28)] transition-all hover:bg-primary-dark active:scale-[0.99]"
          >
            <Search size={18} strokeWidth={2.25} />
            Search Properties
          </button>

          <Link
            href={`/properties?${buildParams().toString()}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary-light/50 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-light"
          >
            <SlidersHorizontal size={16} />
            More Filters
          </Link>
        </div>
      </div>
    </div>
  );
}

function PropertyTypeGrid({
  options,
  selectedIds,
  allSelected,
  narrowDownLabel,
  onToggle,
  onSelectAll,
}: {
  options: PropertyTypeOption[];
  selectedIds: Set<string>;
  allSelected: boolean;
  narrowDownLabel: string;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const collapsed = allSelected && !expanded;

  return (
    <div className="rounded-xl border border-border/80 bg-gradient-to-b from-primary-light/40 to-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Property Type</p>
        <button
          type="button"
          onClick={() => {
            if (allSelected && !expanded) setExpanded(true);
            else if (!allSelected) onSelectAll();
            else setExpanded(false);
          }}
          className="text-xs font-semibold text-primary"
        >
          {narrowDownLabel} <span className="text-text-secondary">•</span>{" "}
          <span className="underline-offset-2 hover:underline">
            {allSelected && !expanded ? "Narrow Down" : allSelected ? "Collapse" : "Select All"}
          </span>
        </button>
      </div>
      {collapsed ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-2 flex w-full items-center justify-between rounded-lg border border-dashed border-primary/25 bg-white/80 px-3 py-2.5 text-left text-xs text-text-secondary transition-colors hover:border-primary/40 hover:bg-white"
        >
          <span>All property types included</span>
          <ChevronDown size={14} className="text-primary" />
        </button>
      ) : (
      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((type) => {
          const selected = selectedIds.has(type.id);
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onToggle(type.id)}
              className={cn(
                "flex min-h-[4.25rem] flex-col items-center justify-center gap-1.5 rounded-xl border px-1.5 py-2 text-center transition-all",
                selected
                  ? "border-primary/30 bg-primary-light/70 shadow-sm"
                  : "border-border/80 bg-white hover:border-primary/20 hover:bg-surface"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-md border transition-colors",
                  selected ? "border-primary bg-primary text-white" : "border-border bg-white"
                )}
              >
                {selected && <Check size={12} strokeWidth={3} />}
              </span>
              <span className="text-[10px] font-semibold leading-tight text-foreground">{type.label}</span>
            </button>
          );
        })}
      </div>
      )}
    </div>
  );
}

function FieldCard({
  label,
  icon,
  children,
  trailing,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
}) {
  const className = cn(
    "relative flex w-full items-center gap-3 rounded-xl border border-border/80 bg-white px-3.5 py-3 text-left shadow-[0_2px_10px_rgba(0,31,77,0.04)] transition-colors",
    onClick && "hover:border-primary/25 hover:bg-surface-elevated/50"
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {icon}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-text-secondary">{label}</p>
          <div className="mt-0.5">{children}</div>
        </div>
        {trailing}
      </button>
    );
  }

  return (
    <div className={className}>
      {icon}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-text-secondary">{label}</p>
        <div className="mt-0.5">{children}</div>
      </div>
      {trailing}
    </div>
  );
}