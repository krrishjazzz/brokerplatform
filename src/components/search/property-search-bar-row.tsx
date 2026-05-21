"use client";

import { useRef, type MouseEvent } from "react";
import { MapPin, Mic, Navigation, Search } from "lucide-react";
import { DEFAULT_SEARCH_CITY, getPresetMenuLabel, type IntentSearchFilters, type SearchPresetId } from "@/lib/search-intent-config";
import { SEARCH_CITY_OPTIONS, SEARCH_LOCATION_OPTIONS } from "@/lib/search-location";
import { PropertySearchIntentMenu } from "@/components/search/property-search-intent-menu";
import { cn } from "@/lib/utils";

export type PropertySearchBarRowProps = {
  filters: IntentSearchFilters;
  layout: "full" | "compact";
  presetOpen: boolean;
  cityOpen: boolean;
  onPresetOpenChange: (open: boolean) => void;
  onCityOpenChange: (open: boolean) => void;
  onUpdateFilters: (patch: Partial<IntentSearchFilters>) => void;
  onSwitchPreset: (preset: SearchPresetId) => void;
  onRunSearch: () => void;
  onOpenOverlay?: () => void;
  className?: string;
};

export function PropertySearchBarRow({
  filters,
  layout,
  presetOpen,
  cityOpen,
  onPresetOpenChange,
  onCityOpenChange,
  onUpdateFilters,
  onSwitchPreset,
  onRunSearch,
  onOpenOverlay,
  className,
}: PropertySearchBarRowProps) {
  const cityRef = useRef<HTMLDivElement>(null);
  const isCompact = layout === "compact";

  const barShell = cn(
    "overflow-visible rounded-xl border bg-white",
    isCompact ? "border-border/90 shadow-sm" : "border-border/90"
  );

  const openFilters = () => {
    if (onOpenOverlay) onOpenOverlay();
  };

  const handleCompactShellClick = (e: MouseEvent) => {
    if (!isCompact || !onOpenOverlay) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-search-intent]") || target.closest("[data-search-action]")) return;
    onOpenOverlay();
  };

  return (
    <div
      className={cn(barShell, isCompact && onOpenOverlay && "cursor-pointer", className)}
      onClick={isCompact ? handleCompactShellClick : undefined}
    >
      <div className={cn("flex", isCompact ? "h-10 items-stretch" : "flex-col md:flex-row")}>
        <PropertySearchIntentMenu
          preset={filters.preset}
          open={presetOpen}
          onOpenChange={onPresetOpenChange}
          onSelect={onSwitchPreset}
          tone={isCompact ? "compact" : "default"}
          className={cn(!isCompact && "border-b border-border md:min-w-[9.5rem] md:shrink-0 md:border-b-0 md:border-r")}
        />

        {!isCompact && (
          <div
            ref={cityRef}
            data-search-city
            className="relative hidden border-b border-border sm:block md:min-w-[9rem] md:max-w-[11rem] md:shrink-0 md:border-b-0 md:border-r"
          >
            <button
              type="button"
              onClick={() => onCityOpenChange(!cityOpen)}
              className="flex h-full w-full items-center gap-2 px-3 py-3.5 text-left text-sm font-semibold text-foreground hover:bg-surface"
            >
              <MapPin size={16} className="shrink-0 text-primary" />
              <span className="truncate">{filters.city}</span>
            </button>
            {cityOpen && (
              <div className="absolute left-0 top-full z-50 max-h-40 min-w-full overflow-y-auto border border-border bg-white py-1 shadow-card">
                {SEARCH_CITY_OPTIONS.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      onUpdateFilters({ city });
                      onCityOpenChange(false);
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
        )}

        <div
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2",
            isCompact
              ? "border-r border-border/80 px-3"
              : "border-b border-border px-4 py-3 md:border-b-0 md:border-r md:py-3.5"
          )}
        >
          {!isCompact && <Search size={18} className="shrink-0 text-primary" />}
          <input
            value={filters.query}
            onChange={(e) => onUpdateFilters({ query: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && onRunSearch()}
            onFocus={isCompact ? openFilters : undefined}
            onClick={isCompact ? openFilters : undefined}
            list={isCompact ? undefined : "kj-search-locations"}
            placeholder="Enter locality / project / society / landmark"
            className={cn(
              "min-w-0 flex-1 bg-transparent font-medium outline-none placeholder:text-text-secondary",
              isCompact ? "text-sm text-foreground" : "text-sm"
            )}
            aria-label="Search locality, project, or landmark"
          />
          {!isCompact && (
            <datalist id="kj-search-locations">
              {SEARCH_LOCATION_OPTIONS.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          )}
          <button
            type="button"
            data-search-action
            title="Search near me"
            className="shrink-0 rounded-lg p-1.5 text-text-secondary hover:bg-surface hover:text-primary"
            onClick={() => onUpdateFilters({ query: filters.city || DEFAULT_SEARCH_CITY })}
          >
            <Navigation size={isCompact ? 16 : 18} />
          </button>
          <button
            type="button"
            data-search-action
            title="Voice search (coming soon)"
            className="shrink-0 rounded-lg p-1.5 text-text-secondary hover:bg-surface"
            aria-disabled
          >
            <Mic size={isCompact ? 16 : 18} />
          </button>
        </div>

        {isCompact ? (
          <button
            type="button"
            data-search-action
            onClick={onRunSearch}
            className="flex w-11 shrink-0 items-center justify-center text-primary hover:bg-surface/80"
            aria-label="Search"
          >
            <Search size={18} strokeWidth={2.5} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onRunSearch}
            className="flex items-center justify-center gap-2 bg-primary px-5 py-3.5 text-sm font-bold text-white hover:bg-primary-dark sm:min-w-[7rem]"
          >
            <Search size={17} strokeWidth={2.5} />
            Search
          </button>
        )}
      </div>

      {!isCompact && (
        <p className="mt-2 flex items-center gap-1 px-4 pb-1 text-xs text-text-secondary sm:hidden">
          <MapPin size={12} className="text-primary" />
          {filters.city}
          <button type="button" className="font-semibold text-primary" onClick={() => onCityOpenChange(true)}>
            Change
          </button>
        </p>
      )}
    </div>
  );
}

/** Compact bar label for screen readers when intent only shown */
export function compactSearchAriaLabel(filters: IntentSearchFilters) {
  return `${getPresetMenuLabel(filters.preset)} search in ${filters.city}`;
}
