"use client";

import { useCallback } from "react";
import { Check, X } from "lucide-react";
import { FilterGroup } from "@/components/properties/filter-primitives";
import { FURNISHING_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  CONSTRUCTION_STATUS_OPTIONS,
  getBudgetLabelForPreset,
  getSearchPreset,
  KRRISHJAZZ_TOP_INTENTS,
  POSSESSION_OPTIONS,
  AVAILABLE_FROM_OPTIONS,
  type SearchPresetId,
} from "@/lib/search-intent-config";
import { RequirementPromoStrip } from "@/features/properties-search/components/requirement-promo-strip";

type PropertiesFiltersSidebarProps = {
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  preset: SearchPresetId;
  onPresetChange: (preset: SearchPresetId) => void;
  propertyTypes: string[];
  setPropertyTypes: (types: string[]) => void;
  propertyTypeOptionIds: string[];
  setPropertyTypeOptionIds: (ids: string[]) => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
  bedrooms: string;
  setBedrooms: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  locality: string;
  setLocality: (value: string) => void;
  furnishing: string;
  setFurnishing: (value: string) => void;
  constructionStatus: string;
  setConstructionStatus: (value: string) => void;
  possession: string;
  setPossession: (value: string) => void;
  availableFrom: string;
  setAvailableFrom: (value: string) => void;
  setPage: (page: number | ((prev: number) => number)) => void;
  clearFilters: () => void;
};

const BHK_OPTIONS = ["1", "2", "3", "4", "5"] as const;

export function PropertiesFiltersSidebar({
  filtersOpen,
  setFiltersOpen,
  preset,
  onPresetChange,
  propertyTypes,
  setPropertyTypes,
  propertyTypeOptionIds,
  setPropertyTypeOptionIds,
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
  constructionStatus,
  setConstructionStatus,
  possession,
  setPossession,
  availableFrom,
  setAvailableFrom,
  setPage,
  clearFilters,
}: PropertiesFiltersSidebarProps) {
  const presetConfig = getSearchPreset(preset);
  const budgetLabel = getBudgetLabelForPreset(preset);
  const showBhk = presetConfig.filterPills.includes("bedrooms");
  const showFurnishing = presetConfig.filterPills.includes("furnishing");
  const showConstruction = presetConfig.filterPills.includes("constructionStatus");
  const showPossession = presetConfig.filterPills.includes("possession");
  const showAvailableFrom = presetConfig.filterPills.includes("availableFrom");

  const bump = useCallback(() => setPage(1), [setPage]);

  const isTypeChecked = (option: { id: string; apiTypes: string[] }) => {
    if (option.apiTypes.length === 0) {
      return propertyTypeOptionIds.includes(option.id);
    }
    return option.apiTypes.every((t) => propertyTypes.includes(t));
  };

  const togglePropertyType = (option: { id: string; apiTypes: string[]; searchQuery?: string }) => {
    bump();
    if (option.apiTypes.length === 0) {
      setPropertyTypeOptionIds(
        propertyTypeOptionIds.includes(option.id)
          ? propertyTypeOptionIds.filter((id) => id !== option.id)
          : [...propertyTypeOptionIds, option.id]
      );
      return;
    }
    const checked = isTypeChecked(option);
    if (checked) {
      setPropertyTypes(propertyTypes.filter((t) => !option.apiTypes.includes(t)));
    } else {
      setPropertyTypes([
        ...propertyTypes,
        ...option.apiTypes.filter((t) => !propertyTypes.includes(t)),
      ]);
    }
  };

  const panel = (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-foreground">Filters</h2>
        <div className="flex items-center gap-2">
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
        <FilterGroup label="Search intent">
          <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-border bg-surface p-1">
            {KRRISHJAZZ_TOP_INTENTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onPresetChange(item.id)}
                className={cn(
                  "rounded-lg px-2 py-2 text-xs font-bold transition-colors",
                  preset === item.id
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary hover:bg-white hover:text-primary"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup label="Property Type">
          <div className="space-y-1">
            {presetConfig.propertyTypes.map((option) => {
              const checked = isTypeChecked(option);
              return (
                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                    checked ? "bg-primary-light text-primary" : "text-foreground hover:bg-surface"
                  )}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => togglePropertyType(option)}
                  />
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                      checked ? "border-primary bg-primary text-white" : "border-border"
                    )}
                  >
                    {checked && <Check size={10} strokeWidth={3} />}
                  </span>
                  {option.label}
                </label>
              );
            })}
          </div>
        </FilterGroup>

        <FilterGroup label={budgetLabel}>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                bump();
              }}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                bump();
              }}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </FilterGroup>

        {showBhk && (
          <FilterGroup label="BHK">
            <div className="flex flex-wrap gap-1.5">
              {BHK_OPTIONS.map((bhk) => (
                <button
                  key={bhk}
                  type="button"
                  onClick={() => {
                    setBedrooms(bedrooms === bhk ? "" : bhk);
                    bump();
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
        )}

        {showFurnishing && (
          <FilterGroup label="Furnishing">
            <select
              value={furnishing}
              onChange={(e) => {
                setFurnishing(e.target.value);
                bump();
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
        )}

        {showConstruction && (
          <FilterGroup label="Construction Status">
            <select
              value={constructionStatus}
              onChange={(e) => {
                setConstructionStatus(e.target.value);
                bump();
              }}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              {CONSTRUCTION_STATUS_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterGroup>
        )}

        {showPossession && (
          <FilterGroup label="Possession">
            <select
              value={possession}
              onChange={(e) => {
                setPossession(e.target.value);
                bump();
              }}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/15"
            >
              {POSSESSION_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterGroup>
        )}

        {showAvailableFrom && (
          <FilterGroup label="Available From">
            <select
              value={availableFrom}
              onChange={(e) => {
                setAvailableFrom(e.target.value);
                bump();
              }}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/15"
            >
              {AVAILABLE_FROM_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterGroup>
        )}

        <FilterGroup label="Locality">
          <input
            type="text"
            placeholder="e.g. Salt Lake, New Town"
            value={locality}
            onChange={(e) => {
              setLocality(e.target.value);
              bump();
            }}
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </FilterGroup>

        <FilterGroup label="City">
          <input
            type="text"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              bump();
            }}
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </FilterGroup>

        <RequirementPromoStrip variant="sidebar" />
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden w-[300px] shrink-0 lg:block">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-card">{panel}</div>
      </aside>

      {filtersOpen && (
        <aside className="fixed inset-0 z-40 flex flex-col bg-white lg:hidden">
          <div className="flex-1 overflow-y-auto p-4 pb-8 pt-5">{panel}</div>
        </aside>
      )}
    </>
  );
}
