"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  buildIntentSearchParams,
  DEFAULT_SEARCH_PRESET,
  getSearchPreset,
  type FilterPillId,
  type IntentSearchFilters,
  type SearchPresetId,
} from "@/lib/search-intent-config";
import { PropertySearchBarRow } from "@/components/search/property-search-bar-row";
import {
  FilterPillButton,
  filterPillLabel,
  PropertySearchFilterPanels,
} from "@/components/search/property-search-filter-panels";
import { UserAccountMenu } from "@/components/account/user-account-menu";
import { OWNER_DASHBOARD_PATH } from "@/lib/dashboard-paths";
import { cn } from "@/lib/utils";

const EMPTY_FILTERS = (): IntentSearchFilters => ({
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

/** Fixed navy strip (h-14); white filter panel expands below search — blue never grows. */
export function DashboardWorkspaceHeader() {
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);

  const [draftFilters, setDraftFilters] = useState<IntentSearchFilters>(EMPTY_FILTERS);
  const [presetOpen, setPresetOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [activePill, setActivePill] = useState<FilterPillId | null>(null);
  const [expanded, setExpanded] = useState(false);

  const updateDraft = useCallback((patch: Partial<IntentSearchFilters>) => {
    setDraftFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const presetConfig = useMemo(() => getSearchPreset(draftFilters.preset), [draftFilters.preset]);
  const visiblePills = presetConfig.filterPills.filter(
    (id) => id !== "postedBy" && id !== "area" && id !== "lockIn" && id !== "developer"
  );

  const applySearch = useCallback(
    (filters: IntentSearchFilters) => {
      router.push(`/properties?${buildIntentSearchParams(filters).toString()}`);
      setExpanded(false);
      setActivePill(null);
      setPresetOpen(false);
      setCityOpen(false);
    },
    [router]
  );

  const switchPreset = useCallback((preset: SearchPresetId) => {
    setDraftFilters((prev) => ({
      ...EMPTY_FILTERS(),
      preset,
      city: prev.city,
      query: prev.query,
    }));
    setActivePill(null);
    setPresetOpen(false);
  }, []);

  const closeExpanded = useCallback(() => {
    setExpanded(false);
    setActivePill(null);
    setPresetOpen(false);
    setCityOpen(false);
  }, []);

  const clearDraftFilters = useCallback(() => {
    setDraftFilters(EMPTY_FILTERS());
    setActivePill(visiblePills[0] ?? null);
  }, [visiblePills]);

  const openExpanded = useCallback(() => {
    setExpanded(true);
    setActivePill((current) => current ?? visiblePills[0] ?? null);
  }, [visiblePills]);

  const searchBarProps = {
    filters: draftFilters,
    layout: "navbar" as const,
    presetOpen,
    cityOpen,
    onPresetOpenChange: setPresetOpen,
    onCityOpenChange: setCityOpen,
    onUpdateFilters: updateDraft,
    onSwitchPreset: switchPreset,
    onRunSearch: () => applySearch(draftFilters),
    onOpenOverlay: openExpanded,
    hideTrailingSearch: expanded,
    className: cn("w-full", expanded && "rounded-b-none border-b-0 shadow-none"),
  };

  useEffect(() => {
    if (!expanded) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeExpanded();
    };
    document.addEventListener("keydown", onEscape);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = prev;
    };
  }, [expanded, closeExpanded]);

  useEffect(() => {
    if (!expanded) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (headerRef.current?.contains(target)) return;
      closeExpanded();
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [expanded, closeExpanded]);

  return (
    <header ref={headerRef} className="sticky top-0 z-50">
      {expanded && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-[1px]"
          aria-label="Close search filters"
          onClick={closeExpanded}
        />
      )}

      <div className="relative z-50">
        {/* Navy background: fixed 56px strip only — does not wrap the filter panel */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-primary-dark shadow-[0_4px_20px_rgba(0,31,77,0.22)]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 sm:gap-x-4">
            <Link
              href={OWNER_DASHBOARD_PATH}
              className="relative z-10 flex h-14 shrink-0 items-center text-lg font-bold tracking-tight text-white sm:text-xl lg:text-2xl"
            >
              KrrishJazz
            </Link>

            <div className="relative z-10 flex h-14 min-w-0 items-center py-1.5">
              <PropertySearchBarRow {...searchBarProps} />
            </div>

            <div className="relative z-10 flex h-14 shrink-0 items-center">
              <UserAccountMenu tone="dark" />
            </div>

            {expanded && (
              <div
                className={cn(
                  "relative z-10 col-start-2 row-start-2 -mt-px overflow-hidden rounded-b-xl border border-border",
                  "bg-white text-foreground shadow-[0_12px_40px_rgba(0,31,77,0.12)]"
                )}
              >
                <div className="px-4 py-4 sm:px-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-foreground">Filters</p>
                    <button
                      type="button"
                      onClick={clearDraftFilters}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {visiblePills.map((pillId) => (
                      <FilterPillButton
                        key={pillId}
                        label={filterPillLabel(pillId, draftFilters, draftFilters.preset)}
                        active={activePill === pillId}
                        onClick={() => setActivePill((c) => (c === pillId ? null : pillId))}
                      />
                    ))}
                  </div>

                  {activePill && (
                    <div className="mt-4">
                      <PropertySearchFilterPanels
                        activePill={activePill}
                        filters={draftFilters}
                        onUpdateFilters={updateDraft}
                        onSwitchPreset={switchPreset}
                      />
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                    <button
                      type="button"
                      onClick={() => applySearch(draftFilters)}
                      className="rounded-md bg-primary px-8 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      onClick={closeExpanded}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
