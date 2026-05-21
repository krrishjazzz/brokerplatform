"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import {
  buildIntentSearchParams,
  DEFAULT_SEARCH_PRESET,
  FILTER_PILL_LABELS,
  getPresetContextLine,
  getSearchPreset,
  parseIntentSearchFromUrl,
  type FilterPillId,
  type IntentSearchFilters,
  type SearchPresetId,
} from "@/lib/search-intent-config";
import { usePropertySearchNavbar } from "@/lib/property-search-navbar-context";
import { PropertySearchBarRow } from "@/components/search/property-search-bar-row";
import {
  FilterPillButton,
  filterPillLabel,
  PropertySearchFilterPanels,
} from "@/components/search/property-search-filter-panels";
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

export type PropertySearchShellProps = {
  initialParams: URLSearchParams;
  onSearch: (params: URLSearchParams) => void;
  freshOnly?: boolean;
  readyToVisitOnly?: boolean;
  onToggleMobileFilters?: () => void;
  className?: string;
};

function appendQuickFilters(
  params: URLSearchParams,
  freshOnly: boolean,
  readyToVisitOnly: boolean
) {
  if (freshOnly) params.set("fresh", "true");
  if (readyToVisitOnly) params.set("readyToVisit", "true");
}

export function PropertySearchShell({
  initialParams,
  onSearch,
  freshOnly = false,
  readyToVisitOnly = false,
  onToggleMobileFilters,
  className,
}: PropertySearchShellProps) {
  const { setCompactActive, setCompactBar } = usePropertySearchNavbar();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  const urlKey = initialParams.toString();
  const appliedFilters = useMemo(
    () => parseIntentSearchFromUrl(new URLSearchParams(urlKey)),
    [urlKey]
  );

  const [draftFilters, setDraftFilters] = useState<IntentSearchFilters>(appliedFilters);
  const [presetOpen, setPresetOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [activePill, setActivePill] = useState<FilterPillId | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [compactActive, setCompactActiveLocal] = useState(false);

  useEffect(() => {
    setDraftFilters(appliedFilters);
  }, [appliedFilters]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const compact = !entry.isIntersecting;
        setCompactActiveLocal(compact);
        setCompactActive(compact);
      },
      { threshold: 0, rootMargin: "-72px 0px 0px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [setCompactActive]);

  const updateDraft = useCallback((patch: Partial<IntentSearchFilters>) => {
    setDraftFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const presetConfig = useMemo(() => getSearchPreset(draftFilters.preset), [draftFilters.preset]);
  const visiblePills = presetConfig.filterPills.filter(
    (id) => id !== "postedBy" && id !== "area" && id !== "lockIn" && id !== "developer"
  );

  const buildParams = useCallback(
    (filters: IntentSearchFilters) => {
      const params = buildIntentSearchParams(filters);
      appendQuickFilters(params, freshOnly, readyToVisitOnly);
      return params;
    },
    [freshOnly, readyToVisitOnly]
  );

  const applySearch = useCallback(
    (filters: IntentSearchFilters) => {
      onSearch(buildParams(filters));
      setOverlayOpen(false);
      setActivePill(null);
      setPresetOpen(false);
      setCityOpen(false);
    },
    [buildParams, onSearch]
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

  const cancelOverlay = useCallback(() => {
    setDraftFilters(appliedFilters);
    setOverlayOpen(false);
    setActivePill(null);
    setPresetOpen(false);
  }, [appliedFilters]);

  const clearDraftFilters = useCallback(() => {
    setDraftFilters({
      ...appliedFilters,
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
    setActivePill(null);
  }, [appliedFilters]);

  useEffect(() => {
    if (!overlayOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelOverlay();
    };
    document.addEventListener("keydown", handleEscape);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = prev;
    };
  }, [overlayOpen, cancelOverlay]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (overlayRef.current?.contains(target)) return;
      if (overlayOpen) return;
      if (target.closest("[data-search-intent]") || target.closest("[data-search-city]")) return;
      if (shellRef.current?.contains(target)) return;
      setPresetOpen(false);
      setCityOpen(false);
      if (!compactActive) setActivePill(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [overlayOpen, compactActive]);

  const openOverlay = useCallback(() => {
    setDraftFilters(appliedFilters);
    setOverlayOpen(true);
  }, [appliedFilters]);

  const compactBar = useMemo(
    () => (
      <PropertySearchBarRow
        filters={draftFilters}
        layout="compact"
        presetOpen={presetOpen}
        cityOpen={cityOpen}
        onPresetOpenChange={setPresetOpen}
        onCityOpenChange={setCityOpen}
        onUpdateFilters={updateDraft}
        onSwitchPreset={switchPreset}
        onRunSearch={() => applySearch(draftFilters)}
        onOpenOverlay={openOverlay}
        className="w-full"
      />
    ),
    [
      draftFilters,
      presetOpen,
      cityOpen,
      updateDraft,
      switchPreset,
      applySearch,
      openOverlay,
    ]
  );

  useEffect(() => {
    setCompactBar(compactBar);
    return () => setCompactBar(null);
  }, [compactBar, setCompactBar]);

  const renderFilterPills = (onPillClick: (id: FilterPillId) => void) => (
    <div className="flex flex-wrap items-center gap-2">
      {visiblePills.map((pillId) => (
        <FilterPillButton
          key={pillId}
          label={filterPillLabel(pillId, draftFilters, draftFilters.preset)}
          active={activePill === pillId}
          onClick={() => onPillClick(pillId)}
        />
      ))}
      {onToggleMobileFilters && (
        <button
          type="button"
          onClick={onToggleMobileFilters}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-text-secondary hover:border-primary/35 hover:text-primary lg:hidden"
        >
          <SlidersHorizontal size={14} />
          All filters
        </button>
      )}
    </div>
  );

  return (
    <>
      <div ref={sentinelRef} className="pointer-events-none h-px w-full" aria-hidden />

      <div ref={shellRef} data-property-search-shell>
      {/* Mobile: always show compact search card */}
      <div className="lg:hidden">
        <div
          className="cursor-pointer"
          onClick={openOverlay}
          onKeyDown={(e) => e.key === "Enter" && openOverlay()}
          role="button"
          tabIndex={0}
        >
          {compactBar}
        </div>
        <p className="mt-2 text-xs font-medium text-text-secondary">
          {getPresetContextLine(draftFilters.preset)}
        </p>
        <div className="mt-3">{renderFilterPills((id) => { setActivePill(id); openOverlay(); })}</div>
      </div>

      {/* Desktop: full panel until scrolled */}
      <div
        className={cn(
          "hidden w-full rounded-2xl border border-border bg-white shadow-[0_8px_30px_rgba(0,31,77,0.08)] lg:block",
          compactActive && "lg:hidden",
          className
        )}
      >
        <div className="p-4 sm:p-5">
          <PropertySearchBarRow
            filters={draftFilters}
            layout="full"
            presetOpen={presetOpen}
            cityOpen={cityOpen}
            onPresetOpenChange={setPresetOpen}
            onCityOpenChange={setCityOpen}
            onUpdateFilters={updateDraft}
            onSwitchPreset={switchPreset}
            onRunSearch={() => applySearch(draftFilters)}
          />
          <p className="mt-2 text-xs font-medium text-text-secondary">
            {getPresetContextLine(draftFilters.preset)}
          </p>
          <div className="mt-3">{renderFilterPills((id) => setActivePill((c) => (c === id ? null : id)))}</div>
          {activePill && (
            <div className="mt-3 rounded-xl border border-border bg-surface/40 p-4">
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
              <PropertySearchFilterPanels
                activePill={activePill}
                filters={draftFilters}
                onUpdateFilters={updateDraft}
                onSwitchPreset={switchPreset}
              />
            </div>
          )}
        </div>
      </div>

      {/* Expanded overlay (desktop compact + mobile) */}
      {overlayOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[45] bg-foreground/40 backdrop-blur-[1px] lg:top-16"
            aria-label="Close search filters"
            onClick={cancelOverlay}
          />
          <div
            ref={overlayRef}
            className="fixed left-0 right-0 z-[50] border-b border-border bg-white shadow-[0_16px_48px_rgba(0,31,77,0.12)] lg:top-16"
          >
            <div className="mx-auto max-w-7xl px-4 py-4 lg:px-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-foreground">Filters</p>
                <button
                  type="button"
                  onClick={clearDraftFilters}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Clear all filters
                </button>
              </div>

              <div className="hidden lg:block">
                <PropertySearchBarRow
                  filters={draftFilters}
                  layout="full"
                  presetOpen={presetOpen}
                  cityOpen={cityOpen}
                  onPresetOpenChange={setPresetOpen}
                  onCityOpenChange={setCityOpen}
                  onUpdateFilters={updateDraft}
                  onSwitchPreset={switchPreset}
                  onRunSearch={() => applySearch(draftFilters)}
                  hideInlineSearch
                />
              </div>
              <div className="lg:hidden">{compactBar}</div>

              <p className="mt-2 text-xs font-medium text-text-secondary">
                {getPresetContextLine(draftFilters.preset)}
              </p>

              <div className="mt-4">{renderFilterPills((id) => setActivePill((c) => (c === id ? null : id)))}</div>

              {activePill && (
                <div className="mt-4 rounded-xl border border-border bg-surface/40 p-4">
                  <p className="mb-2 text-sm font-bold text-foreground">{FILTER_PILL_LABELS[activePill]}</p>
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
                  className="rounded-xl bg-primary px-8 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={cancelOverlay}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
    </>
  );
}
