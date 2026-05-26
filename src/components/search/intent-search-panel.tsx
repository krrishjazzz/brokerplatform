"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  MapPin,
  Mic,
  Navigation,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  AVAILABLE_FROM_OPTIONS,
  AREA_OPTIONS,
  BHK_OPTIONS,
  buildIntentSearchParams,
  CONSTRUCTION_STATUS_OPTIONS,
  DEFAULT_SEARCH_CITY,
  DEFAULT_SEARCH_PRESET,
  FILTER_PILL_LABELS,
  FURNISHING_OPTIONS,
  getBudgetOptionsForPreset,
  getPresetContextLine,
  getPresetMenuLabel,
  getSearchPreset,
  LOCK_IN_OPTIONS,
  parseIntentSearchFromUrl,
  POSSESSION_OPTIONS,
  PROJECT_CATEGORY_OPTIONS,
  SEARCH_PRESET_GROUPS,
  type FilterPillId,
  type IntentSearchFilters,
  type SearchPresetId,
} from "@/lib/search-intent-config";
import { LocationSearchInput } from "@/components/search/location-search-input";
import type { LocationSuggestion } from "@/lib/location/types";
import { SEARCH_CITY_OPTIONS } from "@/lib/search-location";
import { cn } from "@/lib/utils";

type IntentSearchPanelProps = {
  className?: string;
  variant?: "hero" | "default" | "embedded";
  initialParams?: URLSearchParams | null;
  onSearch?: (params: URLSearchParams) => void;
};

const EMPTY_FILTERS = (): IntentSearchFilters => ({
  preset: DEFAULT_SEARCH_PRESET,
  city: DEFAULT_SEARCH_CITY,
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

export function IntentSearchPanel({
  className,
  variant = "default",
  initialParams,
  onSearch,
}: IntentSearchPanelProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const presetMenuRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<IntentSearchFilters>(EMPTY_FILTERS);
  const [presetOpen, setPresetOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [activePill, setActivePill] = useState<FilterPillId | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const initialParamsKey = initialParams?.toString() ?? "";

  useEffect(() => {
    if (!initialParamsKey) return;
    setFilters(parseIntentSearchFromUrl(new URLSearchParams(initialParamsKey)));
  }, [initialParamsKey]);

  const presetConfig = useMemo(() => getSearchPreset(filters.preset), [filters.preset]);
  const budgetOptions = useMemo(() => getBudgetOptionsForPreset(filters.preset), [filters.preset]);

  const updateFilters = useCallback((patch: Partial<IntentSearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const switchPreset = useCallback((preset: SearchPresetId) => {
    setFilters({
      ...EMPTY_FILTERS(),
      preset,
      city: filters.city || DEFAULT_SEARCH_CITY,
    });
    setActivePill(null);
    setPresetOpen(false);
  }, [filters.city]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (presetMenuRef.current?.contains(target)) return;
      if (cityRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setActivePill(null);
      setPresetOpen(false);
      setCityOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const params = useMemo(() => buildIntentSearchParams(filters), [filters]);
  const paramsString = params.toString();

  const runSearch = () => {
    if (onSearch) {
      onSearch(params);
      return;
    }
    router.push(`/properties?${paramsString}`);
  };

  const pillLabel = (pillId: FilterPillId) => {
    const base = FILTER_PILL_LABELS[pillId];
    if (pillId === "propertyTypes" && filters.propertyTypeIds.length > 0) {
      return `${base}(${filters.propertyTypeIds.length})`;
    }
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
  };

  const togglePropertyType = (id: string) => {
    setFilters((prev) => {
      const next = prev.propertyTypeIds.includes(id)
        ? prev.propertyTypeIds.filter((x) => x !== id)
        : [...prev.propertyTypeIds, id];
      return { ...prev, propertyTypeIds: next };
    });
  };

  const isHero = variant === "hero";

  const openPill = (pillId: FilterPillId) => {
    setActivePill((current) => (current === pillId ? null : pillId));
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileSheetOpen(true);
    }
  };

  const renderPillPanel = (pillId: FilterPillId) => {
    switch (pillId) {
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
                onClick={() => switchPreset(presetConfig.crossLinkPreset!)}
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
            onChange={(value) => updateFilters({ budget: value })}
          />
        );
      case "bedrooms":
        return (
          <OptionGrid
            options={BHK_OPTIONS}
            value={filters.bedrooms}
            onChange={(value) => updateFilters({ bedrooms: value })}
          />
        );
      case "furnishing":
        return (
          <OptionGrid
            options={FURNISHING_OPTIONS}
            value={filters.furnishing}
            onChange={(value) => updateFilters({ furnishing: value })}
          />
        );
      case "constructionStatus":
        return (
          <OptionGrid
            options={CONSTRUCTION_STATUS_OPTIONS}
            value={filters.constructionStatus}
            onChange={(value) => updateFilters({ constructionStatus: value })}
          />
        );
      case "possession":
        return (
          <OptionGrid
            options={POSSESSION_OPTIONS}
            value={filters.possession}
            onChange={(value) => updateFilters({ possession: value })}
          />
        );
      case "availableFrom":
        return (
          <OptionGrid
            options={AVAILABLE_FROM_OPTIONS}
            value={filters.availableFrom}
            onChange={(value) => updateFilters({ availableFrom: value })}
          />
        );
      case "area":
        return (
          <OptionGrid options={AREA_OPTIONS} value={filters.area} onChange={(value) => updateFilters({ area: value })} />
        );
      case "lockIn":
        return (
          <OptionGrid options={LOCK_IN_OPTIONS} value={filters.lockIn} onChange={(value) => updateFilters({ lockIn: value })} />
        );
      case "propertyTypeCategory":
        return (
          <OptionGrid
            options={PROJECT_CATEGORY_OPTIONS}
            value={filters.projectCategory}
            onChange={(value) => updateFilters({ projectCategory: value })}
          />
        );
      default:
        return (
          <p className="text-sm text-text-secondary">
            More options for {FILTER_PILL_LABELS[pillId]} are available on the results page sidebar.
          </p>
        );
    }
  };

  const visiblePills = presetConfig.filterPills;
  const mobilePills = visiblePills.slice(0, 2);
  const morePills = visiblePills.slice(2);

  return (
    <div
      ref={panelRef}
      className={cn(
        "w-full rounded-2xl border bg-white",
        variant === "embedded"
          ? "border-border shadow-[0_8px_30px_rgba(0,31,77,0.08)]"
          : isHero
            ? "border-border/60 shadow-[0_24px_64px_rgba(0,31,77,0.14)]"
            : "border-white/80 shadow-[0_20px_60px_rgba(0,31,77,0.18)]",
        isHero && "min-w-0",
        className
      )}
    >
      <div className={cn("p-4 sm:p-5", isHero && "sm:p-6")}>
        <div
          className={cn(
            "overflow-visible rounded-xl border border-border/90 bg-white",
            isHero && "shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
          )}
        >
          <div className={cn("flex flex-col", isHero ? "sm:flex-row" : "md:flex-row")}>
            <div
              ref={presetMenuRef}
              className={cn(
                "relative z-20 shrink-0 border-b border-border",
                isHero
                  ? "sm:min-w-[9.5rem] sm:border-b-0 sm:border-r"
                  : "md:min-w-[9.5rem] md:border-b-0 md:border-r"
              )}
            >
              <button
                type="button"
                onClick={() => setPresetOpen((o) => !o)}
                aria-expanded={presetOpen}
                aria-haspopup="listbox"
                className="flex h-full w-full items-center gap-1.5 px-4 py-3.5 text-left text-sm font-bold text-primary hover:bg-surface"
              >
                <span className="min-w-0 truncate">{getPresetMenuLabel(filters.preset)}</span>
                <ChevronDown size={14} className={cn("ml-auto shrink-0", presetOpen && "rotate-180")} />
              </button>
              {presetOpen && (
                <div
                  role="listbox"
                  className="absolute left-0 top-full z-[60] min-w-[16rem] rounded-lg border border-border bg-white py-2 shadow-[0_12px_40px_rgba(0,31,77,0.15)]"
                >
                  {SEARCH_PRESET_GROUPS.map((group) => (
                    <div key={group.label} className="px-2 py-1">
                      <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                        {group.label}
                      </p>
                      {group.items.map((item) => {
                        const active = filters.preset === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            role="option"
                            aria-selected={active}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => switchPreset(item.id)}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold",
                              active ? "bg-primary-light text-primary" : "text-foreground hover:bg-surface"
                            )}
                          >
                            {active ? (
                              <Check size={14} className="shrink-0" />
                            ) : (
                              <span className="w-[14px] shrink-0" aria-hidden />
                            )}
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              ref={cityRef}
              className={cn(
                "relative border-b border-border md:min-w-[9rem] md:max-w-[11rem] md:shrink-0 md:border-b-0 md:border-r",
                isHero ? "block" : "hidden sm:block"
              )}
            >
              <button
                type="button"
                onClick={() => setCityOpen((o) => !o)}
                className="flex h-full w-full items-center gap-2 px-3 py-3.5 text-left text-sm font-semibold text-foreground hover:bg-surface"
              >
                <MapPin size={16} className="shrink-0 text-primary" />
                <span className="truncate">{filters.city}</span>
                <ChevronDown size={14} className={cn("ml-auto shrink-0 text-text-tertiary", cityOpen && "rotate-180")} />
              </button>
              {cityOpen && (
                <div className="absolute left-0 top-full z-50 max-h-40 min-w-full overflow-y-auto border border-border bg-white py-1 shadow-card">
                  {SEARCH_CITY_OPTIONS.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        updateFilters({ city });
                        setCityOpen(false);
                      }}
                      className={cn(
                        "block w-full px-3 py-2 text-left text-sm font-medium",
                        filters.city === city ? "bg-primary-light text-primary" : "hover:bg-surface"
                      )}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div
              className={cn(
                "flex min-w-0 flex-1 items-center gap-2 border-b border-border px-4 py-3",
                isHero ? "sm:border-b-0 sm:border-r sm:py-3.5" : "md:border-b-0 md:border-r md:py-3.5"
              )}
            >
              <Search size={18} className="shrink-0 text-primary" />
              <LocationSearchInput
                value={filters.query}
                city={filters.city}
                onChange={(query) => updateFilters({ query, locationSuggestionId: undefined })}
                onSelectSuggestion={(s: LocationSuggestion | null) =>
                  updateFilters({
                    query: s?.label ?? filters.query,
                    locationSuggestionId: s?.id,
                  })
                }
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                placeholder="Search locality, project, society, landmark"
                inputClassName="text-sm"
              />
              <button
                type="button"
                title="Search near me"
                className="hidden shrink-0 rounded-lg p-1.5 text-text-secondary hover:bg-surface hover:text-primary sm:inline-flex"
                onClick={() => updateFilters({ query: filters.city })}
              >
                <Navigation size={18} />
              </button>
              <button
                type="button"
                title="Voice search (coming soon)"
                className="hidden shrink-0 rounded-lg p-1.5 text-text-secondary hover:bg-surface sm:inline-flex"
                aria-disabled
              >
                <Mic size={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={runSearch}
              className={cn(
                "flex items-center justify-center gap-2 bg-primary px-5 py-3.5 text-sm font-bold text-white hover:bg-primary-dark sm:min-w-[7.5rem]",
                isHero && "sm:rounded-r-xl"
              )}
            >
              <Search size={17} strokeWidth={2.5} />
              Search
            </button>
          </div>
        </div>

        {!isHero && (
          <p className="mt-2 flex items-center gap-1 text-xs text-text-secondary sm:hidden">
            <MapPin size={12} className="text-primary" />
            {filters.city}
            <button type="button" className="font-semibold text-primary" onClick={() => setCityOpen(true)}>
              Change
            </button>
          </p>
        )}

        <p
          className={cn(
            "mt-2.5 text-xs font-medium text-text-secondary",
            isHero && "text-center sm:text-left"
          )}
        >
          {getPresetContextLine(filters.preset)}
        </p>

        <div className={cn("mt-3 flex flex-wrap items-center gap-2", isHero && "sm:mt-4")}>
          <div className={cn("hidden flex-wrap gap-2", isHero ? "sm:flex" : "md:flex")}>
            {visiblePills.map((pillId) => (
              <FilterPillButton
                key={pillId}
                label={pillLabel(pillId)}
                active={activePill === pillId}
                onClick={() => openPill(pillId)}
              />
            ))}
          </div>
          <div className={cn("flex flex-wrap gap-2", isHero ? "sm:hidden" : "md:hidden")}>
            {mobilePills.map((pillId) => (
              <FilterPillButton
                key={pillId}
                label={pillLabel(pillId)}
                active={activePill === pillId}
                onClick={() => openPill(pillId)}
              />
            ))}
            {morePills.length > 0 && (
              <FilterPillButton
                label="More"
                active={morePills.includes(activePill as FilterPillId)}
                onClick={() => openPill(morePills[0])}
              />
            )}
          </div>
          <Link
            href={`/properties?${paramsString}`}
            className={cn(
              "items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary shadow-sm transition-colors hover:border-primary/35 hover:text-primary",
              isHero ? "ml-auto inline-flex" : "ml-auto hidden lg:inline-flex"
            )}
          >
            <SlidersHorizontal size={14} />
            All filters
          </Link>
        </div>

        {activePill && (
          <div className="mt-3 hidden rounded-xl border border-border bg-surface/40 p-4 md:block">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-bold text-foreground">{FILTER_PILL_LABELS[activePill]}</p>
              <button
                type="button"
                onClick={() => setActivePill(null)}
                className="rounded-lg p-1 text-text-secondary hover:bg-white"
                aria-label="Close filter panel"
              >
                <X size={16} />
              </button>
            </div>
            {renderPillPanel(activePill)}
          </div>
        )}

      </div>

      {mobileSheetOpen && activePill && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close filters"
            onClick={() => {
              setMobileSheetOpen(false);
              setActivePill(null);
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-base font-bold">{FILTER_PILL_LABELS[activePill]}</p>
              <button
                type="button"
                onClick={() => {
                  setMobileSheetOpen(false);
                  setActivePill(null);
                }}
                className="rounded-lg p-1.5 hover:bg-surface"
              >
                <X size={18} />
              </button>
            </div>
            {renderPillPanel(activePill)}
            <button
              type="button"
              onClick={() => {
                setMobileSheetOpen(false);
                setActivePill(null);
              }}
              className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPillButton({
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
        "rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
        active
          ? "border-primary bg-primary-light text-primary"
          : "border-border bg-surface/50 text-text-secondary hover:border-primary/30 hover:bg-white hover:text-primary"
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
