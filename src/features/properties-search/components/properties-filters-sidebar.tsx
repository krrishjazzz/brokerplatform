"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterChip, FilterGroup } from "@/components/properties/filter-primitives";
import { CATEGORY_OPTIONS, LISTING_TABS } from "@/components/properties/search-options";
import { FURNISHING_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PropertiesSearchFiltersState } from "@/features/properties-search/types/filters-state";

type PropertiesFiltersSidebarProps = PropertiesSearchFiltersState & {
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  availablePropertyTypes: string[];
  shownTotal: number;
  onApply: () => void;
};

export function PropertiesFiltersSidebar({
  filtersOpen,
  setFiltersOpen,
  listingType,
  setListingType,
  category,
  setCategory,
  propertyType,
  setPropertyType,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  bedrooms,
  setBedrooms,
  city,
  setCity,
  locality,
  setLocality,
  furnishing,
  setFurnishing,
  freshOnly,
  setFreshOnly,
  verifiedOnly,
  setVerifiedOnly,
  readyToVisitOnly,
  setReadyToVisitOnly,
  ownerListedOnly,
  setOwnerListedOnly,
  budgetMatchOnly,
  applyQuickFilter,
  setPage,
  clearFilters,
  availablePropertyTypes,
  shownTotal,
  onApply,
}: PropertiesFiltersSidebarProps) {
  return (
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
            <Button onClick={() => { setFiltersOpen(false); onApply(); }} className="w-full" size="sm">
              Show {shownTotal || ""} Properties
            </Button>
          </div>
        </aside>
  );
}
