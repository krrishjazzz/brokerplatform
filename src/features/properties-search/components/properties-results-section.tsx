"use client";

import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GuidedSearchStart } from "@/components/properties/guided-search-start";
import { NoMatchRequirementCapture } from "@/components/properties/no-match-requirement-capture";
import { PropertyCard } from "@/components/properties/property-card";
import type { SearchRequirementForm } from "@/components/properties/types";
import type { Property, PropertySaveTarget, SavedSearch } from "@/features/properties-search/types";
import type { ActiveFilterChip } from "@/features/properties-search/utils/active-filters";
import { PropertiesResultsToolbar } from "@/features/properties-search/components/properties-results-toolbar";
import { RequirementPromoStrip } from "@/features/properties-search/components/requirement-promo-strip";
import type { SearchPresetId } from "@/lib/search-intent-config";

type PropertiesResultsSectionProps = {
  hasSearchIntent: boolean;
  needsMoreFilters: boolean;
  loading: boolean;
  shownTotal: number;
  preset?: SearchPresetId;
  locality: string;
  city: string;
  sort: string;
  onSortChange: (value: string) => void;
  onPageReset: () => void;
  onToggleFilters: () => void;
  onSaveSearch: () => void;
  onLocalityPick: (locality: string) => void;
  onPostRequirement?: () => void;
  savedSearches: SavedSearch[];
  onApplySavedSearch: (item: SavedSearch) => void;
  onDeleteSavedSearch: (id: string) => void;
  activeFilters: ActiveFilterChip[];
  onClearFilter: (clear: () => void) => void;
  visibleProperties: Property[];
  isLoggedIn: boolean;
  onSaveProperty: (property: PropertySaveTarget) => void | Promise<void>;
  isPropertySaved: (propertyId: string) => boolean;
  onShareProperty: (property: Property) => void;
  onGuidedPick: (next: {
    category?: string;
    propertyType?: string;
    listingType?: string;
    query?: string;
  }) => void;
  requirementForm: SearchRequirementForm;
  setRequirementForm: Dispatch<SetStateAction<SearchRequirementForm>>;
  requirementSubmitting: boolean;
  requirementSent: boolean;
  onSubmitRequirement: () => void;
  onClearFilters: () => void;
  onRelaxBudget: () => void;
  onShowNearby: () => void;
  availablePropertyTypes: string[];
  pagination: { totalPages: number } | null;
  page: number;
  onPageChange: (updater: (p: number) => number) => void;
};

export function PropertiesResultsSection({
  hasSearchIntent,
  needsMoreFilters,
  loading,
  shownTotal,
  preset,
  locality,
  city,
  sort,
  onSortChange,
  onPageReset,
  onToggleFilters,
  onSaveSearch,
  onLocalityPick,
  onPostRequirement,
  savedSearches,
  onApplySavedSearch,
  onDeleteSavedSearch,
  activeFilters,
  onClearFilter,
  visibleProperties,
  isLoggedIn,
  onSaveProperty,
  isPropertySaved,
  onShareProperty,
  onGuidedPick,
  requirementForm,
  setRequirementForm,
  requirementSubmitting,
  requirementSent,
  onSubmitRequirement,
  onClearFilters,
  onRelaxBudget,
  onShowNearby,
  availablePropertyTypes,
  pagination,
  page,
  onPageChange,
}: PropertiesResultsSectionProps) {
  const insertPromoAfter = 5;

  return (
    <section className="min-w-0 flex-1">
      <PropertiesResultsToolbar
        shownTotal={shownTotal}
        preset={preset}
        locality={locality}
        city={city}
        sort={sort}
        onSortChange={onSortChange}
        onPageReset={onPageReset}
        onToggleFilters={onToggleFilters}
        onSaveSearch={onSaveSearch}
        savedSearches={savedSearches}
        onApplySavedSearch={onApplySavedSearch}
        onDeleteSavedSearch={onDeleteSavedSearch}
        activeFilters={activeFilters}
        onClearFilter={onClearFilter}
        onLocalityPick={onLocalityPick}
      />

      {!hasSearchIntent && (
        <div className="mb-4">
          <GuidedSearchStart
            needsMoreFilters={needsMoreFilters}
            variant="compact"
            onPick={onGuidedPick}
          />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-card border border-border bg-white p-4 shadow-card">
              <div className="mb-4 h-40 rounded-btn bg-surface" />
              <div className="mb-2 h-4 w-2/3 rounded bg-surface" />
              <div className="mb-4 h-3 w-1/3 rounded bg-surface" />
              <div className="grid grid-cols-3 gap-2">
                <div className="h-12 rounded bg-surface" />
                <div className="h-12 rounded bg-surface" />
                <div className="h-12 rounded bg-surface" />
              </div>
            </div>
          ))}
        </div>
      ) : visibleProperties.length === 0 ? (
        hasSearchIntent ? (
          <NoMatchRequirementCapture
            form={requirementForm}
            setForm={setRequirementForm}
            submitting={requirementSubmitting}
            sent={requirementSent}
            onSubmit={onSubmitRequirement}
            onClearFilters={onClearFilters}
            onRelaxBudget={onRelaxBudget}
            onShowNearby={onShowNearby}
            propertyTypes={availablePropertyTypes}
          />
        ) : (
          <div className="rounded-card border border-border bg-white p-8 text-center shadow-card">
            <p className="text-sm font-semibold text-foreground">No live listings yet</p>
            <p className="mt-2 text-sm text-text-secondary">
              New properties are added regularly. Try a locality chip above or post your requirement.
            </p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {visibleProperties.map((property, index) => (
            <div key={property.id}>
              <PropertyCard
                property={property}
                isLoggedIn={isLoggedIn}
                isSaved={isPropertySaved(property.id)}
                trackSearchImpression
                onSave={onSaveProperty}
                onShare={onShareProperty}
              />
              {index === insertPromoAfter && (
                <div className="mt-4">
                  <RequirementPromoStrip
                    variant="compact"
                    onPostRequirement={onPostRequirement}
                  />
                </div>
              )}
            </div>
          ))}
          {visibleProperties.length > 0 && visibleProperties.length <= insertPromoAfter && (
            <RequirementPromoStrip variant="compact" onPostRequirement={onPostRequirement} />
          )}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <PropertiesPagination
          page={page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </section>
  );
}

function PropertiesPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (updater: (p: number) => number) => void;
}) {
  const pages = buildPageNumbers(page, totalPages);

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange((p) => p - 1)}
        className="min-w-[5rem]"
      >
        Previous
      </Button>
      {pages.map((item, index) =>
        item === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-2 text-sm text-text-secondary">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(() => item)}
            className={cn(
              "flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border px-2 text-sm font-semibold transition-colors",
              page === item
                ? "border-primary bg-primary text-white"
                : "border-border bg-white text-foreground hover:border-primary/40 hover:text-primary"
            )}
            aria-current={page === item ? "page" : undefined}
          >
            {item}
          </button>
        )
      )}
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange((p) => p + 1)}
        className="min-w-[5rem]"
      >
        Next
      </Button>
    </nav>
  );
}

function buildPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}
