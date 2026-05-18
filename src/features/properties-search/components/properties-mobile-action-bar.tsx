"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

type PropertiesMobileActionBarProps = {
  hasSearchIntent: boolean;
  shownTotal: number;
  activeFilterCount: number;
  sort: string;
  onSortChange: (value: string) => void;
  onPageReset: () => void;
  onToggleFilters: () => void;
  onShowResults: () => void;
  onClearFilters: () => void;
};

export function PropertiesMobileActionBar({
  hasSearchIntent,
  shownTotal,
  activeFilterCount,
  sort,
  onSortChange,
  onPageReset,
  onToggleFilters,
  onShowResults,
  onClearFilters,
}: PropertiesMobileActionBarProps) {
  return (
    <div className="fixed inset-x-3 bottom-3 z-30 rounded-card border border-border bg-white p-2 shadow-modal lg:hidden">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="min-w-0">
          <p className="truncate text-xs text-text-secondary">
            {hasSearchIntent ? "Matching properties" : "Live listings"}
          </p>
          <p className="truncate text-sm font-bold text-foreground">
            {shownTotal} {hasSearchIntent ? "results" : "live"}
          </p>
        </div>
        {activeFilterCount > 0 && (
          <button type="button" onClick={onClearFilters} className="text-xs font-semibold text-primary">
            Clear
          </button>
        )}
      </div>
      <div className="grid grid-cols-[1fr_1fr_1.1fr] gap-2">
        <Button onClick={onToggleFilters} variant="outline" className="w-full">
          <SlidersHorizontal size={16} className="mr-2" />
          Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
        </Button>
        <select
          value={sort}
          onChange={(e) => {
            onSortChange(e.target.value);
            onPageReset();
          }}
          className="min-h-10 rounded-btn border border-border bg-white px-2 text-xs font-semibold text-foreground outline-none focus:border-primary"
          aria-label="Sort properties"
        >
          <option value="">Newest</option>
          <option value="price_asc">Low price</option>
          <option value="price_desc">High price</option>
        </select>
        <Button onClick={onShowResults} variant="accent" className="w-full">
          Show
        </Button>
      </div>
    </div>
  );
}
