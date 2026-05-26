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
  type SearchPresetConfig,
  type SearchPresetId,
} from "@/lib/search-intent-config";
import { cn } from "@/lib/utils";

export function filterPillLabel(
  pillId: FilterPillId,
  filters: IntentSearchFilters,
  preset: SearchPresetId
): string {
  const base = FILTER_PILL_LABELS[pillId];
  if (pillId === "propertyTypes") {
    const count = getEffectivePropertyTypeIds(filters, preset).length;
    if (count > 0) return `${base}(${count})`;
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
      aria-expanded={active}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border bg-white px-3.5 py-2 text-xs font-semibold transition-all",
        active
          ? "border-primary text-primary shadow-[0_0_0_1px_rgba(0,92,168,0.35)]"
          : "border-border text-text-secondary hover:border-primary/40 hover:text-primary"
      )}
    >
      {label}
      <ChevronDown size={13} className={cn("shrink-0 opacity-70", active && "rotate-180")} />
    </button>
  );
}

/** When URL has no types selected, treat as all types (99acres-style). */
export function getEffectivePropertyTypeIds(
  filters: IntentSearchFilters,
  presetId: SearchPresetId
): string[] {
  if (filters.propertyTypeIds.length > 0) return filters.propertyTypeIds;
  return getSearchPreset(presetId).propertyTypes.map((o) => o.id);
}

export function togglePropertyTypeId(
  filters: IntentSearchFilters,
  presetId: SearchPresetId,
  id: string
): string[] {
  const preset = getSearchPreset(presetId);
  const allIds = preset.propertyTypes.map((o) => o.id);
  const current =
    filters.propertyTypeIds.length > 0 ? filters.propertyTypeIds : allIds;
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  if (next.length === 0 || next.length === allIds.length) return [];
  return next;
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

function PropertyTypesFilterPanel({
  filters,
  presetConfig,
  onUpdateFilters,
  onSwitchPreset,
}: {
  filters: IntentSearchFilters;
  presetConfig: SearchPresetConfig;
  onUpdateFilters: (patch: Partial<IntentSearchFilters>) => void;
  onSwitchPreset: (preset: SearchPresetId) => void;
}) {
  const selectedIds = getEffectivePropertyTypeIds(filters, filters.preset);

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {presetConfig.propertyTypes.map((option) => {
          const checked = selectedIds.includes(option.id);
          return (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium text-foreground transition-colors",
                checked ? "bg-primary-light/60" : "hover:bg-surface"
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() =>
                  onUpdateFilters({
                    propertyTypeIds: togglePropertyTypeId(filters, filters.preset, option.id),
                  })
                }
              />
              <span
                className={cn(
                  "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border",
                  checked ? "border-primary bg-primary text-white" : "border-border bg-white"
                )}
              >
                {checked && <Check size={11} strokeWidth={3} />}
              </span>
              <span className="leading-snug">{option.label}</span>
            </label>
          );
        })}
      </div>
      {presetConfig.crossLinkPreset && presetConfig.crossLinkLabel && (
        <p className="text-sm text-text-secondary">
          {presetConfig.crossLinkLabel}{" "}
          <button
            type="button"
            onClick={() => onSwitchPreset(presetConfig.crossLinkPreset!)}
            className="font-semibold text-primary hover:underline"
          >
            Click here
          </button>
        </p>
      )}
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

  switch (activePill) {
    case "propertyTypes":
      return (
        <PropertyTypesFilterPanel
          filters={filters}
          presetConfig={presetConfig}
          onUpdateFilters={onUpdateFilters}
          onSwitchPreset={onSwitchPreset}
        />
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
