"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterGroup } from "@/components/properties/filter-primitives";
import { FURNISHING_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  INTENT_LISTING_TABS,
  isCommercialIntent,
} from "@/components/properties/search-options";
import type { PropertiesSearchFiltersState } from "@/features/properties-search/types/filters-state";

type PropertiesFiltersSidebarProps = PropertiesSearchFiltersState & {
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  availablePropertyTypes: string[];
  shownTotal: number;
  onApply: () => void;
};

const BHK_OPTIONS = ["1", "2", "3", "4", "5"] as const;

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
  verifiedOnly,
  setVerifiedOnly,
  ownerListedOnly,
  setOwnerListedOnly,
  setPage,
  clearFilters,
  availablePropertyTypes,
  shownTotal,
  onApply,
}: PropertiesFiltersSidebarProps) {
  const commercialActive = isCommercialIntent(category, listingType);

  const setIntentTab = (value: string) => {
    setPage(1);
    if (value === "COMMERCIAL") {
      setCategory("COMMERCIAL");
      setListingType("");
      return;
    }
    setCategory("");
    setListingType(value);
  };

  const activeIntent = commercialActive
    ? "COMMERCIAL"
    : listingType === "RENT"
      ? "RENT"
      : listingType === "BUY"
        ? "BUY"
        : "";

  const panel = (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-foreground">Filters</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={() => setFiltersOpen(false)}
            className="rounded-lg border border-border p-2 text-text-secondary lg:hidden"
            aria-label="Close filters"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <FilterGroup label="Listing Type">
          <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-border bg-surface p-1">
            {INTENT_LISTING_TABS.map((tab) => {
              const active = activeIntent === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setIntentTab(tab.value)}
                  className={cn(
                    "rounded-lg px-2 py-2.5 text-xs font-bold transition-colors sm:text-sm",
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "text-text-secondary hover:bg-white hover:text-primary"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </FilterGroup>

        <FilterGroup label="Property Type">
          <select
            value={propertyType}
            onChange={(e) => {
              setPropertyType(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">All Types</option>
            {availablePropertyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FilterGroup>

        <FilterGroup label="Budget">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </FilterGroup>

        <FilterGroup label="BHK">
          <div className="flex flex-wrap gap-1.5">
            {BHK_OPTIONS.map((bhk) => (
              <button
                key={bhk}
                type="button"
                onClick={() => {
                  setBedrooms(bedrooms === bhk ? "" : bhk);
                  setPage(1);
                }}
                className={cn(
                  "h-10 min-w-[2.5rem] flex-1 rounded-xl border text-sm font-bold transition-colors",
                  bedrooms === bhk
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-text-secondary hover:border-primary/40 hover:text-primary"
                )}
              >
                {bhk === "5" ? "5+" : bhk}
              </button>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup label="Furnishing">
          <select
            value={furnishing}
            onChange={(e) => {
              setFurnishing(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">Any</option>
            {FURNISHING_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FilterGroup>

        <FilterGroup label="Locality">
          <input
            type="text"
            placeholder="e.g. Salt Lake, New Town"
            value={locality}
            onChange={(e) => {
              setLocality(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </FilterGroup>

        <FilterGroup label="Verified Status">
          <div className="space-y-2.5">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => {
                  setVerifiedOnly(e.target.checked);
                  setPage(1);
                }}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              Verified Listings
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={ownerListedOnly}
                onChange={(e) => {
                  setOwnerListedOnly(e.target.checked);
                  setPage(1);
                }}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              Owner Listed
            </label>
          </div>
        </FilterGroup>
      </div>

      <div className="mt-6 border-t border-border pt-5 lg:border-0 lg:pt-5">
        <Button
          onClick={() => {
            setFiltersOpen(false);
            if (!city.trim()) setCity("Kolkata");
            onApply();
          }}
          className="w-full"
        >
          Apply Filters{shownTotal > 0 ? ` (${shownTotal})` : ""}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop: always visible, sticky */}
      <aside className="hidden w-[280px] shrink-0 lg:block">
        <div className="sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-card">
          {panel}
        </div>
      </aside>

      {/* Mobile: drawer */}
      {filtersOpen && (
        <aside className="fixed inset-0 z-40 flex flex-col bg-white lg:hidden">
          <div className="flex-1 overflow-y-auto p-4 pb-28 pt-5">{panel}</div>
        </aside>
      )}
    </>
  );
}
