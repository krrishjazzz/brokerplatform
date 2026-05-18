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
  readyCount,
  ownerListedCount,
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

  return (
    <div className="mb-4 rounded-card border border-border bg-white p-3 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {hasSearchIntent
              ? `${shownTotal} matching properties`
              : `${shownTotal} live ${shownTotal === 1 ? "listing" : "listings"}`}
            {locality ? ` in ${locality}` : city && ` in ${city}`}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {hasSearchIntent
              ? `${freshCount} fresh, ${verifiedCount} verified, ${readyCount} ready to visit, ${ownerListedCount} owner listed.`
              : `${freshCount} fresh, ${verifiedCount} verified on this page. Add filters to narrow results.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onToggleFilters} variant="ghost" size="sm" className="hidden lg:inline-flex">
            <SlidersHorizontal size={14} className="mr-2" />
            Filters
          </Button>
          <Button
            onClick={onSaveSearch}
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
            <Button onClick={() => setSavedOpen((open) => !open)} variant="ghost" size="sm">
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
              onClick={() => onClearFilter(filter.clear)}
              className="inline-flex items-center gap-1 rounded-pill border border-primary/20 bg-primary-light px-3 py-1 text-xs font-medium text-primary hover:bg-primary-light/80"
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
