"use client";

import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { GuidedSearchStart } from "@/components/properties/guided-search-start";
import { NoMatchRequirementCapture } from "@/components/properties/no-match-requirement-capture";
import { PropertyCard } from "@/components/properties/property-card";
import type { SearchRequirementForm } from "@/components/properties/types";
import type { Property, PropertySaveTarget, SavedSearch } from "@/features/properties-search/types";
import type { ActiveFilterChip } from "@/features/properties-search/utils/active-filters";
import { PropertiesResultsToolbar } from "@/features/properties-search/components/properties-results-toolbar";

type PropertiesResultsSectionProps = {
  hasSearchIntent: boolean;
  needsMoreFilters: boolean;
  loading: boolean;
  shownTotal: number;
  locality: string;
  city: string;
  propertySummary: {
    freshCount: number;
    verifiedCount: number;
    readyCount: number;
    ownerListedCount: number;
  };
  sort: string;
  onSortChange: (value: string) => void;
  onPageReset: () => void;
  onToggleFilters: () => void;
  onSaveSearch: () => void;
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
  locality,
  city,
  propertySummary,
  sort,
  onSortChange,
  onPageReset,
  onToggleFilters,
  onSaveSearch,
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
  const { freshCount, verifiedCount, readyCount, ownerListedCount } = propertySummary;

  return (
    <section className="min-w-0 flex-1">
      <PropertiesResultsToolbar
        hasSearchIntent={hasSearchIntent}
        shownTotal={shownTotal}
        locality={locality}
        city={city}
        freshCount={freshCount}
        verifiedCount={verifiedCount}
        readyCount={readyCount}
        ownerListedCount={ownerListedCount}
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
          {visibleProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isLoggedIn={isLoggedIn}
              isSaved={isPropertySaved(property.id)}
              onSave={onSaveProperty}
              onShare={onShareProperty}
            />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPageChange((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-text-secondary">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => onPageChange((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </section>
  );
}
