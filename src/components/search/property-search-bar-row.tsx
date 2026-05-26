"use client";

import { useRef, type MouseEvent } from "react";
import { MapPin, Mic, Navigation, Search, SlidersHorizontal } from "lucide-react";
import { DEFAULT_SEARCH_CITY, getPresetMenuLabel, type IntentSearchFilters, type SearchPresetId } from "@/lib/search-intent-config";
import { SEARCH_CITY_OPTIONS, SEARCH_LOCATION_OPTIONS } from "@/lib/search-location";
import { LocationSearchInput } from "@/components/search/location-search-input";
import { PropertySearchIntentMenu } from "@/components/search/property-search-intent-menu";
import type { LocationSuggestion } from "@/lib/location/types";
import { cn } from "@/lib/utils";

export type PropertySearchBarRowProps = {
  filters: IntentSearchFilters;
  layout: "full" | "compact" | "navbar";
  presetOpen: boolean;
  cityOpen: boolean;
  onPresetOpenChange: (open: boolean) => void;
  onCityOpenChange: (open: boolean) => void;
  onUpdateFilters: (patch: Partial<IntentSearchFilters>) => void;
  onSwitchPreset: (preset: SearchPresetId) => void;
  onRunSearch: () => void;
  onOpenOverlay?: () => void;
  /** Full layout only: hide the inline Search button (use footer action instead). */
  hideInlineSearch?: boolean;
  /** Navbar layout: hide trailing magnifying-glass (footer Search only). */
  hideTrailingSearch?: boolean;
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
  hideInlineSearch = false,
  hideTrailingSearch = false,
  className,
}: PropertySearchBarRowProps) {
  const cityRef = useRef<HTMLDivElement>(null);
  const isCompact = layout === "compact";
  const isNavbar = layout === "navbar";
  const isSingleRow = isCompact || isNavbar;

  const barShell = cn(
    "overflow-visible border bg-white",
    isCompact && "rounded-full border-border/90 shadow-sm",
    isNavbar && "rounded-lg border-border/90 shadow-md",
    !isSingleRow && "rounded-xl border-border/90"
  );

  const navbarIconBtn =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-dark";

  const openFilters = () => {
    if (onOpenOverlay) onOpenOverlay();
  };

  const handleShellClick = (e: MouseEvent) => {
    if (!isSingleRow || !onOpenOverlay) return;
    const target = e.target as HTMLElement;
    if (
      target.closest("[data-search-intent]") ||
      target.closest("[data-search-action]") ||
      target.closest("[data-search-input]") ||
      target.closest("input") ||
      target.closest("button")
    ) {
      return;
    }
    onOpenOverlay();
  };

  return (
    <div
      className={cn(barShell, className)}
      onClick={isSingleRow && onOpenOverlay ? handleShellClick : undefined}
    >
      <div
        className={cn(
          "flex",
          isSingleRow ? "h-11 items-stretch" : "flex-col md:flex-row"
        )}
      >
        <PropertySearchIntentMenu
          preset={filters.preset}
          open={presetOpen}
          onOpenChange={onPresetOpenChange}
          onSelect={onSwitchPreset}
          tone={isSingleRow ? "compact" : "default"}
          className={cn(
            isCompact && "rounded-l-full",
            isNavbar && "rounded-l-lg border-r border-border",
            !isSingleRow && "border-b border-border md:min-w-[9.5rem] md:shrink-0 md:border-b-0 md:border-r"
          )}
        />

        {(isNavbar || !isCompact) && (
          <div
            ref={cityRef}
            data-search-city
            className={cn(
              "relative shrink-0 border-border sm:block",
              isNavbar
                ? "hidden border-r sm:block md:max-w-[10rem]"
                : "hidden border-b border-border md:min-w-[9rem] md:max-w-[11rem] md:border-b-0 md:border-r"
            )}
          >
            <button
              type="button"
              data-search-action
              onClick={() => onCityOpenChange(!cityOpen)}
              className={cn(
                "flex h-full w-full items-center gap-2 text-left text-sm font-semibold text-foreground hover:bg-surface",
                isNavbar ? "px-3" : "px-3 py-3.5"
              )}
            >
              <MapPin size={16} className="shrink-0 text-primary" />
              <span className="truncate">{filters.city}</span>
            </button>
            {cityOpen && (
              <div className="absolute left-0 top-full z-[200] max-h-40 min-w-full overflow-y-auto rounded-lg border border-border bg-white py-1 shadow-[0_12px_40px_rgba(0,31,77,0.15)]">
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
            "flex min-w-0 flex-1 items-center",
            isSingleRow
              ? "gap-1.5 px-3 sm:gap-2 sm:px-4"
              : cn(
                  "gap-2 border-b border-border px-4 py-3 md:border-b-0 md:py-3.5",
                  !hideInlineSearch && "md:border-r"
                )
          )}
        >
          {!isSingleRow && <Search size={18} className="shrink-0 text-primary" />}
          <LocationSearchInput
            value={filters.query}
            city={filters.city}
            onChange={(query) => onUpdateFilters({ query, locationSuggestionId: undefined })}
            onSelectSuggestion={(s: LocationSuggestion | null) =>
              onUpdateFilters({
                query: s?.label ?? filters.query,
                locationSuggestionId: s?.id,
              })
            }
            onKeyDown={(e) => e.key === "Enter" && onRunSearch()}
            onFocus={isNavbar && onOpenOverlay ? () => onOpenOverlay() : undefined}
            onClick={isNavbar && onOpenOverlay ? () => onOpenOverlay() : undefined}
            placeholder="Search locality, project, society, landmark"
            inputClassName={isSingleRow ? "text-sm text-foreground" : "text-sm"}
            className="data-search-input relative z-30"
          />
          {!isSingleRow && (
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
            className={cn(
              isNavbar
                ? navbarIconBtn
                : "shrink-0 rounded-lg p-1.5 text-text-secondary hover:bg-surface hover:text-primary"
            )}
            onClick={() => onUpdateFilters({ query: filters.city || DEFAULT_SEARCH_CITY })}
          >
            <Navigation size={isNavbar ? 15 : isCompact ? 16 : 18} />
          </button>
          <button
            type="button"
            data-search-action
            title="Voice search (coming soon)"
            className={cn(
              isNavbar ? navbarIconBtn : "shrink-0 rounded-lg p-1.5 text-text-secondary hover:bg-surface"
            )}
            aria-disabled
          >
            <Mic size={isNavbar ? 15 : isCompact ? 16 : 18} />
          </button>
          {isNavbar && onOpenOverlay && (
            <button
              type="button"
              data-search-action
              title="More filters"
              onClick={openFilters}
              className={navbarIconBtn}
              aria-label="More filters"
            >
              <SlidersHorizontal size={15} />
            </button>
          )}
        </div>

        {isCompact ? (
          <button
            type="button"
            data-search-action
            onClick={onRunSearch}
            className="flex h-full w-10 shrink-0 items-center justify-center rounded-r-full border-l border-border/80 text-primary hover:bg-surface/80 sm:w-11"
            aria-label="Search"
          >
            <Search size={18} strokeWidth={2.5} />
          </button>
        ) : isNavbar && !hideTrailingSearch ? (
          <button
            type="button"
            data-search-action
            onClick={onOpenOverlay ?? onRunSearch}
            className="flex h-full w-11 shrink-0 items-center justify-center rounded-r-lg border-l border-border/80 text-primary hover:bg-surface/80"
            aria-label={onOpenOverlay ? "Open filters" : "Search"}
          >
            <Search size={18} strokeWidth={2.5} />
          </button>
        ) : isNavbar ? null : hideInlineSearch ? null : (
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

      {!isSingleRow && (
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
