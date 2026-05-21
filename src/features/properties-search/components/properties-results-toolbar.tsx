"use client";

import { useState } from "react";
import { Bell, BookmarkPlus, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { POPULAR_LOCALITY_CHIPS } from "@/components/properties/search-options";
import { getPresetMenuLabel, type SearchPresetId } from "@/lib/search-intent-config";
import type { SavedSearch } from "@/features/properties-search/types";
import type { ActiveFilterChip } from "@/features/properties-search/utils/active-filters";
import { SavedSearchesDropdown } from "@/features/properties-search/components/saved-searches-dropdown";

const SORT_LABELS: Record<string, string> = {
  "": "Relevance",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
};

type PropertiesResultsToolbarProps = {
  shownTotal: number;
  preset?: SearchPresetId;
  city: string;
  locality: string;
  sort: string;
  onSortChange: (value: string) => void;
  onPageReset: () => void;
  onToggleFilters: () => void;
  onSaveSearch: () => void;
  saveSearchLabel?: string;
  savedSearches: SavedSearch[];
  onApplySavedSearch: (item: SavedSearch) => void;
  onDeleteSavedSearch: (id: string) => void;
  activeFilters: ActiveFilterChip[];
  onClearFilter: (clear: () => void) => void;
  onLocalityPick: (locality: string) => void;
};

export function PropertiesResultsToolbar({
  shownTotal,
  preset,
  city,
  locality,
  sort,
  onSortChange,
  onPageReset,
  onToggleFilters,
  onSaveSearch,
  saveSearchLabel = "Save Search",
  savedSearches,
  onApplySavedSearch,
  onDeleteSavedSearch,
  activeFilters,
  onClearFilter,
  onLocalityPick,
}: PropertiesResultsToolbarProps) {
  const [savedOpen, setSavedOpen] = useState(false);
  const locationLabel = city.trim() || "Kolkata";
  const intentLabel = preset ? getPresetMenuLabel(preset) : "Properties";
  const sortLabel = SORT_LABELS[sort] || SORT_LABELS[""];

  return (
    <div className="mb-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-bold text-foreground sm:text-xl">
            {shownTotal} {shownTotal === 1 ? "property" : "properties"} for {intentLabel} in {locationLabel}
          </p>
          <p className="mt-0.5 text-sm text-text-secondary">Sorted by {sortLabel}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onToggleFilters} variant="outline" size="sm" className="lg:hidden">
            <SlidersHorizontal size={14} className="mr-1.5" />
            Filters
          </Button>
          <div className="hidden flex-col items-end gap-0.5 sm:flex">
            <span className="text-[11px] font-medium text-text-secondary">Get alerts for this search</span>
            <Button onClick={onSaveSearch} variant="outline" size="sm">
              <BookmarkPlus size={14} className="mr-1.5" />
              {saveSearchLabel}
            </Button>
          </div>
          <Button onClick={onSaveSearch} variant="outline" size="sm" className="sm:hidden">
            <BookmarkPlus size={14} className="mr-1.5" />
            {saveSearchLabel}
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
            <option value="">Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {POPULAR_LOCALITY_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => onLocalityPick(chip)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
              locality === chip
                ? "border-primary bg-primary-light text-primary"
                : "border-border bg-white text-text-secondary hover:border-primary/35 hover:text-primary"
            )}
          >
            {chip}
          </button>
        ))}
      </div>

      {activeFilters.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <button
              key={`${filter.label}-${index}`}
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
