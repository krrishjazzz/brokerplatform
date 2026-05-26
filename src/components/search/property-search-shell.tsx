"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildIntentSearchParams,
  getPresetContextLine,
  parseIntentSearchFromUrl,
  type FilterPillId,
  type IntentSearchFilters,
  type SearchPresetId,
} from "@/lib/search-intent-config";
import { usePropertySearchNavbar } from "@/lib/property-search-navbar-context";
import { PropertySearchBarRow } from "@/components/search/property-search-bar-row";
import {
  EMPTY_INTENT_FILTERS,
  PropertySearchFiltersStrip,
} from "@/components/search/property-search-filters-strip";
import { cn } from "@/lib/utils";

const EMPTY_FILTERS = EMPTY_INTENT_FILTERS;

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
    setPresetOpen(false);
    setCityOpen(false);
    setOverlayOpen(true);
  }, [appliedFilters]);

  const compactBar = useMemo(
    () => (
      <PropertySearchBarRow
        filters={draftFilters}
        layout="compact"
        presetOpen={overlayOpen ? false : presetOpen}
        cityOpen={overlayOpen ? false : cityOpen}
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
      overlayOpen,
    ]
  );

  useEffect(() => {
    setCompactBar(compactBar);
    return () => setCompactBar(null);
  }, [compactBar, setCompactBar]);

  const filtersStrip = (
    <PropertySearchFiltersStrip
      filters={draftFilters}
      activePill={activePill}
      onActivePillChange={setActivePill}
      onUpdateFilters={updateDraft}
      onSwitchPreset={switchPreset}
      onClearAll={clearDraftFilters}
      onToggleMobileFilters={onToggleMobileFilters}
    />
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
        <div className="mt-3">
          <PropertySearchFiltersStrip
            filters={draftFilters}
            activePill={activePill}
            onActivePillChange={(id) => {
              setActivePill(id);
              if (id) openOverlay();
            }}
            onUpdateFilters={updateDraft}
            onSwitchPreset={switchPreset}
            onClearAll={clearDraftFilters}
            showHeader={false}
            onToggleMobileFilters={onToggleMobileFilters}
          />
        </div>
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
          <div className="mt-3">{filtersStrip}</div>
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

              <div className="mt-4">
                <PropertySearchFiltersStrip
                  filters={draftFilters}
                  activePill={activePill}
                  onActivePillChange={setActivePill}
                  onUpdateFilters={updateDraft}
                  onSwitchPreset={switchPreset}
                  onClearAll={clearDraftFilters}
                  showFooter
                  onSearch={() => applySearch(draftFilters)}
                  onCancel={cancelOverlay}
                />
              </div>
            </div>
          </div>
        </>
      )}
      </div>
    </>
  );
}
