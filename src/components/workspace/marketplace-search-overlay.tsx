"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import {
  buildIntentSearchParams,
  DEFAULT_SEARCH_PRESET,
  getSearchPreset,
  type FilterPillId,
  type IntentSearchFilters,
  type SearchPresetId,
} from "@/lib/search-intent-config";
import { POPULAR_LOCALITY_CHIPS } from "@/components/properties/search-options";
import { PropertySearchBarRow } from "@/components/search/property-search-bar-row";
import {
  FilterPillButton,
  filterPillLabel,
  PropertySearchFilterPanels,
} from "@/components/search/property-search-filter-panels";
import { persistLastWorkspace } from "@/lib/workspace";

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

type MarketplaceSearchOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export function MarketplaceSearchOverlay({ open, onClose }: MarketplaceSearchOverlayProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [draftFilters, setDraftFilters] = useState<IntentSearchFilters>(EMPTY_FILTERS);
  const [presetOpen, setPresetOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [activePill, setActivePill] = useState<FilterPillId | null>(null);

  const presetConfig = useMemo(() => getSearchPreset(draftFilters.preset), [draftFilters.preset]);
  const visiblePills = presetConfig.filterPills.filter(
    (id) => id !== "postedBy" && id !== "area" && id !== "lockIn" && id !== "developer"
  );

  const applySearch = useCallback(
    (filters: IntentSearchFilters) => {
      persistLastWorkspace("buyer");
      router.push(`/properties?${buildIntentSearchParams(filters).toString()}`);
      onClose();
    },
    [router, onClose]
  );

  const pickLocality = (locality: string) => {
    const next = { ...draftFilters, query: locality, city: draftFilters.city || "Kolkata" };
    setDraftFilters(next);
    applySearch(next);
  };

  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEscape);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-foreground/45 p-4 pt-[10vh] backdrop-blur-[2px] sm:p-6">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close search"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-white p-5 shadow-modal sm:p-6"
        role="dialog"
        aria-labelledby="marketplace-search-title"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="marketplace-search-title" className="text-lg font-bold text-foreground">
              Find properties
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Search as a buyer without leaving your owner workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-surface"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <PropertySearchBarRow
          filters={draftFilters}
          layout="full"
          presetOpen={presetOpen}
          cityOpen={cityOpen}
          onPresetOpenChange={setPresetOpen}
          onCityOpenChange={setCityOpen}
          onUpdateFilters={(patch) => setDraftFilters((prev) => ({ ...prev, ...patch }))}
          onSwitchPreset={(preset: SearchPresetId) => {
            setDraftFilters((prev) => ({
              ...EMPTY_FILTERS(),
              preset,
              city: prev.city,
              query: prev.query,
            }));
            setActivePill(null);
            setPresetOpen(false);
          }}
          onRunSearch={() => applySearch(draftFilters)}
          className="w-full"
        />

        <div className="mt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-tertiary">Popular</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_LOCALITY_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => pickLocality(chip)}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/40 hover:text-primary"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {activePill && (
          <div className="mt-4 rounded-xl border border-border bg-surface p-4">
            <PropertySearchFilterPanels
              activePill={activePill}
              filters={draftFilters}
              onUpdateFilters={(patch) => setDraftFilters((prev) => ({ ...prev, ...patch }))}
              onSwitchPreset={(preset) =>
                setDraftFilters((prev) => ({ ...EMPTY_FILTERS(), preset, city: prev.city, query: prev.query }))
              }
            />
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {visiblePills.slice(0, 4).map((pillId) => (
            <FilterPillButton
              key={pillId}
              label={filterPillLabel(pillId, draftFilters, draftFilters.preset)}
              active={activePill === pillId}
              onClick={() => setActivePill((c) => (c === pillId ? null : pillId))}
            />
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => applySearch(draftFilters)}
            className="rounded-md bg-primary px-8 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
          >
            Search
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
