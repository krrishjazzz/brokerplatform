"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  AVAILABLE_FROM_OPTIONS,
  AREA_OPTIONS,
  BHK_OPTIONS,
  CONSTRUCTION_STATUS_OPTIONS,
  FILTER_PILL_LABELS,
  FURNISHING_OPTIONS,
  getBudgetOptionsForPreset,
  getSearchPreset,
  LOCK_IN_OPTIONS,
  POSSESSION_OPTIONS,
  PROJECT_CATEGORY_OPTIONS,
  type FilterPillId,
  type IntentSearchFilters,
  type SearchPresetId,
} from "@/lib/search-intent-config";
import { cn } from "@/lib/utils";

export function filterPillLabel(
  pillId: FilterPillId,
  filters: IntentSearchFilters,
  preset: SearchPresetId
): string {
  const base = FILTER_PILL_LABELS[pillId];
  if (pillId === "propertyTypes" && filters.propertyTypeIds.length > 0) {
    return `${base}(${filters.propertyTypeIds.length})`;
  }
  const budgetOptions = getBudgetOptionsForPreset(preset);
  if (pillId === "budget" || pillId === "rentBudget" || pillId === "monthlyRent") {
    if (filters.budget) {
      const opt = budgetOptions.find((o) => o.value === filters.budget);
      return opt?.label && opt.value ? `${base}: ${opt.label}` : base;
    }
  }
  if (pillId === "bedrooms" && filters.bedrooms) {
    const opt = BHK_OPTIONS.find((o) => o.value === filters.bedrooms);
    return opt?.value ? `${base}: ${opt.label}` : base;
  }
  if (pillId === "furnishing" && filters.furnishing) return `${base}: ${filters.furnishing}`;
  return base;
}

export function FilterPillButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-primary bg-primary-light text-primary"
          : "border-border bg-white text-text-secondary hover:border-primary/30 hover:text-primary"
      )}
    >
      {label}
      <ChevronDown size={12} className={cn("ml-0.5 inline opacity-60", active && "rotate-180")} />
    </button>
  );
}

function OptionGrid({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
            value === option.value
              ? "border-primary bg-primary text-white"
              : "border-border bg-white text-foreground hover:border-primary/30"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

type PropertySearchFilterPanelsProps = {
  activePill: FilterPillId | null;
  filters: IntentSearchFilters;
  onUpdateFilters: (patch: Partial<IntentSearchFilters>) => void;
  onSwitchPreset: (preset: SearchPresetId) => void;
};

export function PropertySearchFilterPanels({
  activePill,
  filters,
  onUpdateFilters,
  onSwitchPreset,
}: PropertySearchFilterPanelsProps) {
  if (!activePill) return null;

  const presetConfig = getSearchPreset(filters.preset);
  const budgetOptions = getBudgetOptionsForPreset(filters.preset);

  const togglePropertyType = (id: string) => {
    const next = filters.propertyTypeIds.includes(id)
      ? filters.propertyTypeIds.filter((x) => x !== id)
      : [...filters.propertyTypeIds, id];
    onUpdateFilters({ propertyTypeIds: next });
  };

  switch (activePill) {
    case "propertyTypes":
      return (
        <div className="space-y-3">
          <div className="grid gap-1 sm:grid-cols-2">
            {presetConfig.propertyTypes.map((option) => {
              const checked = filters.propertyTypeIds.includes(option.id);
              return (
                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    checked ? "bg-primary-light text-primary" : "hover:bg-surface"
                  )}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => togglePropertyType(option.id)}
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
          {presetConfig.crossLinkPreset && presetConfig.crossLinkLabel && (
            <button
              type="button"
              onClick={() => onSwitchPreset(presetConfig.crossLinkPreset!)}
              className="text-left text-xs font-semibold text-primary hover:underline"
            >
              {presetConfig.crossLinkLabel} Click here
            </button>
          )}
        </div>
      );
    case "budget":
    case "rentBudget":
    case "monthlyRent":
      return (
        <OptionGrid
          options={budgetOptions}
          value={filters.budget}
          onChange={(value) => onUpdateFilters({ budget: value })}
        />
      );
    case "bedrooms":
      return (
        <OptionGrid
          options={BHK_OPTIONS}
          value={filters.bedrooms}
          onChange={(value) => onUpdateFilters({ bedrooms: value })}
        />
      );
    case "furnishing":
      return (
        <OptionGrid
          options={FURNISHING_OPTIONS}
          value={filters.furnishing}
          onChange={(value) => onUpdateFilters({ furnishing: value })}
        />
      );
    case "constructionStatus":
      return (
        <OptionGrid
          options={CONSTRUCTION_STATUS_OPTIONS}
          value={filters.constructionStatus}
          onChange={(value) => onUpdateFilters({ constructionStatus: value })}
        />
      );
    case "possession":
      return (
        <OptionGrid
          options={POSSESSION_OPTIONS}
          value={filters.possession}
          onChange={(value) => onUpdateFilters({ possession: value })}
        />
      );
    case "availableFrom":
      return (
        <OptionGrid
          options={AVAILABLE_FROM_OPTIONS}
          value={filters.availableFrom}
          onChange={(value) => onUpdateFilters({ availableFrom: value })}
        />
      );
    case "area":
      return (
        <OptionGrid options={AREA_OPTIONS} value={filters.area} onChange={(value) => onUpdateFilters({ area: value })} />
      );
    case "lockIn":
      return (
        <OptionGrid options={LOCK_IN_OPTIONS} value={filters.lockIn} onChange={(value) => onUpdateFilters({ lockIn: value })} />
      );
    case "propertyTypeCategory":
      return (
        <OptionGrid
          options={PROJECT_CATEGORY_OPTIONS}
          value={filters.projectCategory}
          onChange={(value) => onUpdateFilters({ projectCategory: value })}
        />
      );
    default:
      return (
        <p className="text-sm text-text-secondary">
          More options for {FILTER_PILL_LABELS[activePill]} are available in the left sidebar.
        </p>
      );
  }
}
