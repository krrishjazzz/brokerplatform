"use client";

import { useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { useLoginPopup } from "@/lib/login-popup-context";
import {
  buildIntentSearchParams,
  DEFAULT_SEARCH_PRESET,
  getSearchPreset,
  type SearchPresetId,
} from "@/lib/search-intent-config";
import type { SavedSearch } from "@/features/properties-search/types";
import {
  usePropertiesSearch,
  useSavedSearches,
  useSearchRequirement,
  usePropertyListingActions,
  usePropertiesPageDerived,
} from "@/features/properties-search";
import { PropertiesFiltersSidebar } from "@/features/properties-search/components/properties-filters-sidebar";
import { PropertiesSearchChrome } from "@/features/properties-search/components/properties-search-chrome";
import { PropertiesResultsSection } from "@/features/properties-search/components/properties-results-section";
import { PropertiesMobileActionBar } from "@/features/properties-search/components/properties-mobile-action-bar";
import { SearchWorkspaceHeader } from "@/components/workspace/search-workspace-header";

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { openLoginPopup } = useLoginPopup();
  const { toast } = useToast();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = usePropertiesSearch({ searchParams });
  const {
    properties,
    pagination,
    loading,
    fetchError,
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
    propertyTypes,
    setPropertyTypes,
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
    readyToVisitOnly,
    setReadyToVisitOnly,
    constructionStatus,
    setConstructionStatus,
    possession,
    setPossession,
    availableFrom,
    setAvailableFrom,
    propertyTypeOptionIds,
    setPropertyTypeOptionIds,
    sort,
    setSort,
    query,
    setQuery,
    clearFilters,
    currentFiltersObject,
    applySavedFilters,
    intentPreset,
  } = search;

  const preset = (intentPreset.preset || DEFAULT_SEARCH_PRESET) as SearchPresetId;

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

  const handleClearPreset = useCallback(() => {
    const params = buildIntentSearchParams({
      preset: DEFAULT_SEARCH_PRESET,
      city: city || "Kolkata",
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
    setPage(1);
    router.push(`/properties?${params.toString()}`);
  }, [city, router, setPage]);

  const derived = usePropertiesPageDerived({
    properties,
    pagination,
    preset,
    propertyType,
    propertyTypes,
    propertyTypeOptionIds,
    locality,
    city,
    minPrice,
    maxPrice,
    bedrooms,
    furnishing,
    freshOnly,
    readyToVisitOnly,
    constructionStatus,
    possession,
    availableFrom,
    setPropertyType,
    setPropertyTypes,
    setPropertyTypeOptionIds,
    setLocality,
    setCity,
    setMinPrice,
    setMaxPrice,
    setBedrooms,
    setFurnishing,
    setFreshOnly,
    setReadyToVisitOnly,
    setConstructionStatus,
    setPossession,
    setAvailableFrom,
    onClearPreset: handleClearPreset,
  });

  const { savedSearches, saveCurrentSearch, deleteSavedSearch } = useSavedSearches(
    currentFiltersObject,
    hasSearchIntent
  );

  const handleSaveCurrentSearch = () => {
    if (!user) {
      openLoginPopup({ intent: "buyer", allowIntentSwitch: false });
      return;
    }
    const result = saveCurrentSearch();
    if (!result.ok) {
      toast("Add at least one filter or search term before saving.", "info");
      return;
    }
    toast("You'll get alerts when new listings match this search.", "success");
  };

  const applySavedSearch = (item: SavedSearch) => {
    applySavedFilters(item.filters);
    toast(`Applied: ${item.label}`, "success");
  };

  const handleSearchNavigate = useCallback(
    (params: URLSearchParams) => {
      setPage(1);
      router.push(`/properties?${params.toString()}`);
    },
    [router, setPage]
  );

  const handlePresetChange = useCallback(
    (nextPreset: SearchPresetId) => {
      const config = getSearchPreset(nextPreset);
      setListingType(config.params.listingType || "");
      setCategory(config.params.category || "");
      setPropertyTypes([]);
      setPropertyTypeOptionIds([]);
      setPropertyType("");
      setConstructionStatus("");
      setPossession("");
      setAvailableFrom("");
      setPage(1);

      const params = buildIntentSearchParams({
        preset: nextPreset,
        city: city || "Kolkata",
        query: query || locality,
        propertyTypeIds: [],
        budget: maxPrice,
        bedrooms,
        furnishing,
        constructionStatus: "",
        possession: "",
        availableFrom: "",
        area: "",
        lockIn: "",
        projectCategory: "",
      });
      router.push(`/properties?${params.toString()}`);
    },
    [
      bedrooms,
      city,
      furnishing,
      locality,
      maxPrice,
      query,
      router,
      setCategory,
      setListingType,
      setPage,
      setPropertyType,
      setPropertyTypes,
      setPropertyTypeOptionIds,
      setConstructionStatus,
      setPossession,
      setAvailableFrom,
    ]
  );

  const handleLocalityPick = useCallback(
    (nextLocality: string) => {
      setLocality(nextLocality);
      setPage(1);
      const params = new URLSearchParams(searchParams.toString());
      params.set("locality", nextLocality);
      if (!params.get("city")) params.set("city", city || "Kolkata");
      params.delete("page");
      router.push(`/properties?${params.toString()}`);
    },
    [city, router, searchParams, setLocality, setPage]
  );

  const scrollToRequirement = () => {
    document.getElementById("post-requirement")?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleFilters = () => setFiltersOpen((open) => !open);

  return (
    <main className="min-h-screen bg-surface pb-24 lg:pb-8">
      <SearchWorkspaceHeader />
      <PropertiesSearchChrome
        listingType={listingType}
        category={category}
        preset={preset}
        city={city}
        onSearchNavigate={handleSearchNavigate}
        onToggleFilters={toggleFilters}
        hideInlineSearch
      />

      {filtersOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/35 backdrop-blur-[2px] lg:hidden"
          onClick={() => setFiltersOpen(false)}
          aria-hidden
        />
      )}

      {fetchError && (
        <div className="border-b border-error/30 bg-error-light px-4 py-3 text-center text-sm font-medium text-error">
          {fetchError}
        </div>
      )}

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start lg:gap-8 lg:px-6 lg:py-8">
        <PropertiesFiltersSidebar
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          preset={preset}
          onPresetChange={handlePresetChange}
          propertyTypes={propertyTypes}
          setPropertyTypes={setPropertyTypes}
          propertyTypeOptionIds={propertyTypeOptionIds}
          setPropertyTypeOptionIds={setPropertyTypeOptionIds}
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
          constructionStatus={constructionStatus}
          setConstructionStatus={setConstructionStatus}
          possession={possession}
          setPossession={setPossession}
          availableFrom={availableFrom}
          setAvailableFrom={setAvailableFrom}
          setPage={setPage}
          clearFilters={clearFilters}
        />

        <PropertiesResultsSection
          hasSearchIntent={hasSearchIntent}
          needsMoreFilters={needsMoreFilters}
          loading={loading}
          shownTotal={derived.shownTotal}
          preset={preset}
          locality={locality}
          city={city}
          sort={sort}
          onSortChange={setSort}
          onPageReset={() => setPage(1)}
          onToggleFilters={toggleFilters}
          onSaveSearch={handleSaveCurrentSearch}
          onLocalityPick={handleLocalityPick}
          onPostRequirement={scrollToRequirement}
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
        activeFilterCount={derived.activeFilters.length}
        sort={sort}
        onSortChange={setSort}
        onPageReset={() => setPage(1)}
        onToggleFilters={toggleFilters}
        onSaveSearch={handleSaveCurrentSearch}
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
        <div className="mt-8 grid gap-4 lg:grid-cols-[300px_1fr]">
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
