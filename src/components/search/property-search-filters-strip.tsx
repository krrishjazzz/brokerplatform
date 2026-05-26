"use client";

import { SlidersHorizontal } from "lucide-react";
import {
  DEFAULT_SEARCH_PRESET,
  getSearchPreset,
  type FilterPillId,
  type IntentSearchFilters,
  type SearchPresetId,
} from "@/lib/search-intent-config";
import {
  FilterPillButton,
  filterPillLabel,
  PropertySearchFilterPanels,
} from "@/components/search/property-search-filter-panels";
import { cn } from "@/lib/utils";

export const EMPTY_INTENT_FILTERS = (): IntentSearchFilters => ({
  preset: DEFAULT_SEARCH_PRESET,
  city: "Kolkata",
  query: "",
  propertyTypeIds: [],
  budget: "",
  bedrooms: "",
  furnishing: "",
  constructionStatus: "",
  possession: "",
  availableFrom: "",
  area: "",
  lockIn: "",
  projectCategory: "",
});

type PropertySearchFiltersStripProps = {
  filters: IntentSearchFilters;
  activePill: FilterPillId | null;
  onActivePillChange: (pill: FilterPillId | null) => void;
  onUpdateFilters: (patch: Partial<IntentSearchFilters>) => void;
  onSwitchPreset: (preset: SearchPresetId) => void;
  onClearAll: () => void;
  onSearch?: () => void;
  onCancel?: () => void;
  showHeader?: boolean;
  showFooter?: boolean;
  excludePills?: FilterPillId[];
  onToggleMobileFilters?: () => void;
  className?: string;
};

export function PropertySearchFiltersStrip({
  filters,
  activePill,
  onActivePillChange,
  onUpdateFilters,
  onSwitchPreset,
  onClearAll,
  onSearch,
  onCancel,
  showHeader = true,
  showFooter = false,
  excludePills = ["postedBy", "area", "lockIn", "developer"],
  onToggleMobileFilters,
  className,
}: PropertySearchFiltersStripProps) {
  const presetConfig = getSearchPreset(filters.preset);
  const visiblePills = presetConfig.filterPills.filter((id) => !excludePills.includes(id));

  const handlePillClick = (pillId: FilterPillId) => {
    onActivePillChange(activePill === pillId ? null : pillId);
  };

  return (
    <div className={cn("space-y-0", className)}>
      {showHeader && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-foreground">Filters</p>
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {visiblePills.map((pillId) => (
          <FilterPillButton
            key={pillId}
            label={filterPillLabel(pillId, filters, filters.preset)}
            active={activePill === pillId}
            onClick={() => handlePillClick(pillId)}
          />
        ))}
        {onToggleMobileFilters && (
          <button
            type="button"
            onClick={onToggleMobileFilters}
            className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-2 text-xs font-semibold text-text-secondary hover:border-primary/35 hover:text-primary lg:hidden"
          >
            <SlidersHorizontal size={14} />
            All filters
          </button>
        )}
      </div>

      {activePill && (
        <div className="mt-3 overflow-hidden rounded-lg border border-border bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className="border-b border-border/80 bg-surface/30 px-4 py-2.5">
            <p className="text-sm font-bold text-foreground">
              {filterPillLabel(activePill, filters, filters.preset).replace(/\(\d+\)$/, "")}
            </p>
          </div>
          <div className="p-4 sm:p-5">
            <PropertySearchFilterPanels
              activePill={activePill}
              filters={filters}
              onUpdateFilters={onUpdateFilters}
              onSwitchPreset={onSwitchPreset}
            />
          </div>
        </div>
      )}

      {showFooter && (onSearch || onCancel) && (
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          {onSearch && (
            <button
              type="button"
              onClick={onSearch}
              className="rounded-md bg-primary px-8 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-dark"
            >
              Search
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
