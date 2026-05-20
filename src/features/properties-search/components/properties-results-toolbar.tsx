"use client";

import { useState } from "react";
import { Bell, BookmarkPlus, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SavedSearch } from "@/features/properties-search/types";
import type { ActiveFilterChip } from "@/features/properties-search/utils/active-filters";
import { SavedSearchesDropdown } from "@/features/properties-search/components/saved-searches-dropdown";

type PropertiesResultsToolbarProps = {
  hasSearchIntent: boolean;
  shownTotal: number;
  locality: string;
  city: string;
  freshCount: number;
  verifiedCount: number;
  readyCount: number;
  ownerListedCount: number;
  sort: string;
  onSortChange: (value: string) => void;
  onPageReset: () => void;
  onToggleFilters: () => void;
  onSaveSearch: () => void;
  savedSearches: SavedSearch[];
  onApplySavedSearch: (item: SavedSearch) => void;
  onDeleteSavedSearch: (id: string) => void;
  activeFilters: ActiveFilterChip[];
  onClearFilter: (clear: () => void) => void;
};

export function PropertiesResultsToolbar({
  hasSearchIntent,
  shownTotal,
  locality,
  city,
  freshCount,
  verifiedCount,
  sort,
  onSortChange,
  onPageReset,
  onToggleFilters,
  onSaveSearch,
  savedSearches,
  onApplySavedSearch,
  onDeleteSavedSearch,
  activeFilters,
  onClearFilter,
}: PropertiesResultsToolbarProps) {
  const [savedOpen, setSavedOpen] = useState(false);
  const locationLabel = locality || city || "Kolkata";

  return (
    <div className="mb-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-bold text-foreground">
            {shownTotal} {shownTotal === 1 ? "property" : "properties"} found
          </p>
          <p className="mt-0.5 text-sm text-text-secondary">
            {freshCount} fresh, {verifiedCount} verified
            {locationLabel ? ` in ${locationLabel}` : ""}
            {hasSearchIntent ? " — filtered results" : " on this page"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onToggleFilters} variant="outline" size="sm" className="lg:hidden">
            <SlidersHorizontal size={14} className="mr-1.5" />
            Filters
          </Button>
          <Button
            onClick={onSaveSearch}
            variant="outline"
            size="sm"
            disabled={!hasSearchIntent}
            title={hasSearchIntent ? "Save these filters" : "Add filters to save"}
          >
            <BookmarkPlus size={14} className="mr-1.5" />
            Save Search
          </Button>
          <div className="relative">
            <Button onClick={() => setSavedOpen((open) => !open)} variant="outline" size="sm">
              <Bell size={14} className="mr-1.5" />
              Saved
              {savedSearches.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {savedSearches.length}
                </span>
              )}
            </Button>
            {savedOpen && (
              <SavedSearchesDropdown
                items={savedSearches}
                onApply={(item) => {
                  onApplySavedSearch(item);
                  setSavedOpen(false);
                }}
                onDelete={onDeleteSavedSearch}
                onClose={() => setSavedOpen(false)}
              />
            )}
          </div>
          <select
            value={sort}
            onChange={(e) => {
              onSortChange(e.target.value);
              onPageReset();
            }}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            aria-label="Sort results"
          >
            <option value="">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => onClearFilter(filter.clear)}
              className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary-light px-3 py-1 text-xs font-semibold text-primary hover:bg-primary-light/80"
            >
              {filter.label}
              <X size={12} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
