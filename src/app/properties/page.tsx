"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import type { SavedSearch } from "@/features/properties-search/types";
import {
  usePropertiesSearch,
  useSavedSearches,
  useSearchRequirement,
  usePropertyListingActions,
  usePropertiesPageDerived,
} from "@/features/properties-search";
import { PropertiesFiltersSidebar } from "@/features/properties-search/components/properties-filters-sidebar";
import { PropertiesSearchHero } from "@/features/properties-search/components/properties-search-hero";
import { PropertiesResultsSection } from "@/features/properties-search/components/properties-results-section";
import { PropertiesMobileActionBar } from "@/features/properties-search/components/properties-mobile-action-bar";

function PropertiesContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = usePropertiesSearch({ searchParams });
  const {
    properties,
    pagination,
    loading,
    hasSearchIntent,
    needsMoreFilters,
    page,
    setPage,
    listingType,
    setListingType,
    category,
    setCategory,
    propertyType,
    setPropertyType,
    locality,
    setLocality,
    city,
    setCity,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    bedrooms,
    setBedrooms,
    furnishing,
    setFurnishing,
    freshOnly,
    setFreshOnly,
    verifiedOnly,
    setVerifiedOnly,
    readyToVisitOnly,
    setReadyToVisitOnly,
    ownerListedOnly,
    setOwnerListedOnly,
    budgetMatchOnly,
    setBudgetMatchOnly,
    availability,
    setAvailability,
    sort,
    setSort,
    query,
    setQuery,
    fetchProperties,
    clearFilters,
    applyQuickFilter,
    currentFiltersObject,
    applySavedFilters,
  } = search;

  const requirement = useSearchRequirement({
    searchParams,
    user,
    propertyType,
    category,
    locality,
    city,
    query,
  });

  const { saveProperty, shareProperty, isPropertySaved } = usePropertyListingActions({
    isLoggedIn: Boolean(user),
  });

  const derived = usePropertiesPageDerived({
    properties,
    pagination,
    listingType,
    category,
    propertyType,
    locality,
    city,
    minPrice,
    maxPrice,
    bedrooms,
    furnishing,
    freshOnly,
    verifiedOnly,
    readyToVisitOnly,
    ownerListedOnly,
    budgetMatchOnly,
    availability,
    setListingType,
    setCategory,
    setPropertyType,
    setLocality,
    setCity,
    setMinPrice,
    setMaxPrice,
    setBedrooms,
    setFurnishing,
    setFreshOnly,
    setVerifiedOnly,
    setReadyToVisitOnly,
    setOwnerListedOnly,
    setBudgetMatchOnly,
    setAvailability,
  });

  const { savedSearches, saveCurrentSearch, deleteSavedSearch } = useSavedSearches(
    currentFiltersObject,
    hasSearchIntent
  );

  const handleSaveCurrentSearch = () => {
    const result = saveCurrentSearch();
    if (!result.ok) {
      toast("Add at least one filter or search term before saving.", "info");
      return;
    }
    toast("Search saved. Reopen anytime from Saved.", "success");
  };

  const applySavedSearch = (item: SavedSearch) => {
    applySavedFilters(item.filters);
    toast(`Applied: ${item.label}`, "success");
  };

  const runSearch = () => {
    setPage(1);
    fetchProperties();
  };

  const toggleFilters = () => setFiltersOpen((open) => !open);

  return (
    <main className="min-h-screen bg-surface pb-20 lg:pb-8">
      <PropertiesSearchHero
        hasSearchIntent={hasSearchIntent}
        shownTotal={derived.shownTotal}
        freshCount={derived.freshCount}
        verifiedCount={derived.verifiedCount}
        listingType={listingType}
        category={category}
        city={city}
        setCity={setCity}
        query={query}
        onQueryChange={setQuery}
        onSearch={runSearch}
        onToggleFilters={toggleFilters}
        freshOnly={freshOnly}
        verifiedOnly={verifiedOnly}
        readyToVisitOnly={readyToVisitOnly}
        ownerListedOnly={ownerListedOnly}
        budgetMatchOnly={budgetMatchOnly}
        onQuickFilter={applyQuickFilter}
      />

      {filtersOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/35 backdrop-blur-[2px] lg:hidden"
          onClick={() => setFiltersOpen(false)}
          aria-hidden
        />
      )}

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start lg:gap-8 lg:px-6 lg:py-8">
        <PropertiesFiltersSidebar
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          listingType={listingType}
          setListingType={setListingType}
          category={category}
          setCategory={setCategory}
          propertyType={propertyType}
          setPropertyType={setPropertyType}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          bedrooms={bedrooms}
          setBedrooms={setBedrooms}
          city={city}
          setCity={setCity}
          locality={locality}
          setLocality={setLocality}
          furnishing={furnishing}
          setFurnishing={setFurnishing}
          freshOnly={freshOnly}
          setFreshOnly={setFreshOnly}
          verifiedOnly={verifiedOnly}
          setVerifiedOnly={setVerifiedOnly}
          readyToVisitOnly={readyToVisitOnly}
          setReadyToVisitOnly={setReadyToVisitOnly}
          ownerListedOnly={ownerListedOnly}
          setOwnerListedOnly={setOwnerListedOnly}
          budgetMatchOnly={budgetMatchOnly}
          applyQuickFilter={applyQuickFilter}
          setPage={setPage}
          clearFilters={clearFilters}
          availablePropertyTypes={derived.availablePropertyTypes}
          shownTotal={derived.shownTotal}
          onApply={fetchProperties}
        />

        <PropertiesResultsSection
          hasSearchIntent={hasSearchIntent}
          needsMoreFilters={needsMoreFilters}
          loading={loading}
          shownTotal={derived.shownTotal}
          locality={locality}
          city={city}
          propertySummary={derived.propertySummary}
          sort={sort}
          onSortChange={setSort}
          onPageReset={() => setPage(1)}
          onToggleFilters={toggleFilters}
          onSaveSearch={handleSaveCurrentSearch}
          savedSearches={savedSearches}
          onApplySavedSearch={applySavedSearch}
          onDeleteSavedSearch={deleteSavedSearch}
          activeFilters={derived.activeFilters}
          onClearFilter={(clear) => {
            clear();
            setPage(1);
          }}
          visibleProperties={derived.visibleProperties}
          isLoggedIn={Boolean(user)}
          onSaveProperty={saveProperty}
          isPropertySaved={isPropertySaved}
          onShareProperty={shareProperty}
          onGuidedPick={(next) => {
            setPage(1);
            if (next.category !== undefined) setCategory(next.category);
            if (next.propertyType !== undefined) setPropertyType(next.propertyType);
            if (next.listingType !== undefined) setListingType(next.listingType);
            if (next.query !== undefined) setQuery(next.query);
          }}
          requirementForm={requirement.form}
          setRequirementForm={requirement.setForm}
          requirementSubmitting={requirement.submitting}
          requirementSent={requirement.sent}
          onSubmitRequirement={requirement.submit}
          onClearFilters={clearFilters}
          onRelaxBudget={() => {
            setMinPrice("");
            setMaxPrice("");
            setBudgetMatchOnly(false);
            setPage(1);
          }}
          onShowNearby={() => {
            setLocality("");
            setQuery(city || "Kolkata");
            setPage(1);
          }}
          availablePropertyTypes={derived.availablePropertyTypes}
          pagination={pagination}
          page={page}
          onPageChange={setPage}
        />
      </div>

      <PropertiesMobileActionBar
        hasSearchIntent={hasSearchIntent}
        shownTotal={derived.shownTotal}
        activeFilterCount={derived.activeFilters.length}
        sort={sort}
        onSortChange={setSort}
        onPageReset={() => setPage(1)}
        onToggleFilters={toggleFilters}
        onShowResults={runSearch}
        onClearFilters={clearFilters}
      />
    </main>
  );
}

function PropertiesPageFallback() {
  return (
    <main className="min-h-screen bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="h-8 w-48 animate-pulse rounded bg-white" />
        <div className="mt-6 h-32 animate-pulse rounded-2xl bg-white" />
        <div className="mt-8 grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="hidden h-96 animate-pulse rounded-2xl bg-white lg:block" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<PropertiesPageFallback />}>
      <PropertiesContent />
    </Suspense>
  );
}
