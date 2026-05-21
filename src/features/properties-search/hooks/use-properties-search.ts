"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchJson } from "@/shared/api/client";
import type { Pagination, Property } from "@/features/properties-search/types";
import { getSearchPreset, type SearchPresetId } from "@/lib/search-intent-config";
import { countSearchIntent, getInitialPage, resolveIntentPreset } from "@/features/properties-search/utils/search-intent";

type IntentPreset = ReturnType<typeof resolveIntentPreset>;

type UsePropertiesSearchOptions = {
  searchParams: URLSearchParams;
};

function appendProjectOptionQueries(
  presetId: SearchPresetId,
  optionIds: string[],
  params: URLSearchParams
) {
  const preset = getSearchPreset(presetId);
  const queries: string[] = [];
  for (const id of optionIds) {
    const option = preset.propertyTypes.find((o) => o.id === id);
    if (option?.searchQuery) queries.push(option.searchQuery);
  }
  if (queries.length > 0) {
    const existing = params.get("q");
    params.set("q", existing ? `${existing} ${queries[0]}` : queries[0]);
  }
}

export function usePropertiesSearch({ searchParams }: UsePropertiesSearchOptions) {
  const router = useRouter();
  const intentPreset = useMemo(
    () =>
      resolveIntentPreset(
        searchParams.get("preset") || searchParams.get("intent"),
        searchParams.get("listingType"),
        searchParams.get("category")
      ),
    [searchParams]
  );

  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const [listingType, setListingType] = useState(
    searchParams.get("listingType") || intentPreset.listingType || ""
  );
  const [category, setCategory] = useState(searchParams.get("category") || intentPreset.category || "");
  const [propertyTypes, setPropertyTypes] = useState<string[]>(() =>
    searchParams.getAll("propertyType").filter(Boolean)
  );
  const [propertyTypeOptionIds, setPropertyTypeOptionIds] = useState<string[]>(() =>
    searchParams.getAll("pto").filter(Boolean)
  );
  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") || searchParams.getAll("propertyType")[0] || ""
  );
  const [locality, setLocality] = useState(searchParams.get("locality") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
  const [furnishing, setFurnishing] = useState(searchParams.get("furnishing") || "");
  const [freshOnly, setFreshOnly] = useState(searchParams.get("fresh") === "true");
  const [readyToVisitOnly, setReadyToVisitOnly] = useState(searchParams.get("readyToVisit") === "true");
  const [constructionStatus, setConstructionStatus] = useState(
    searchParams.get("constructionStatus") || searchParams.get("availability") || ""
  );
  const [possession, setPossession] = useState(
    searchParams.get("possession") || searchParams.get("listingStatus") || ""
  );
  const [availableFrom, setAvailableFrom] = useState(searchParams.get("availableFrom") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(getInitialPage(searchParams.get("page")));

  useEffect(() => {
    const presetConfig = getSearchPreset(intentPreset.preset);
    const typesFromUrl = searchParams.getAll("propertyType").filter(Boolean);
    setListingType(searchParams.get("listingType") || presetConfig.params.listingType || "");
    setCategory(searchParams.get("category") || presetConfig.params.category || "");
    setPropertyTypes(typesFromUrl);
    setPropertyTypeOptionIds(searchParams.getAll("pto").filter(Boolean));
    setPropertyType(typesFromUrl[0] || "");
    setLocality(searchParams.get("locality") || "");
    setCity(searchParams.get("city") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setBedrooms(searchParams.get("bedrooms") || "");
    setFurnishing(searchParams.get("furnishing") || "");
    setFreshOnly(searchParams.get("fresh") === "true");
    setReadyToVisitOnly(searchParams.get("readyToVisit") === "true");
    setConstructionStatus(
      searchParams.get("constructionStatus") || searchParams.get("availability") || ""
    );
    setPossession(searchParams.get("possession") || searchParams.get("listingStatus") || "");
    setAvailableFrom(searchParams.get("availableFrom") || "");
    setSort(searchParams.get("sort") || "");
    setQuery(searchParams.get("q") || "");
    setPage(getInitialPage(searchParams.get("page")));
  }, [searchParams, intentPreset.preset]);

  const effectivePropertyTypes = useMemo(
    () => (propertyTypes.length > 0 ? propertyTypes : propertyType ? [propertyType] : []),
    [propertyTypes, propertyType]
  );

  const { hasSearchIntent, needsMoreFilters } = useMemo(
    () =>
      countSearchIntent({
        preset: intentPreset.preset,
        listingType,
        category,
        propertyType,
        propertyTypes: effectivePropertyTypes,
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
        query,
      }),
    [
      intentPreset.preset,
      listingType,
      category,
      propertyType,
      effectivePropertyTypes,
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
      query,
    ]
  );

  const fetchProperties = useCallback(async () => {
    setLoading(true);

    const params = new URLSearchParams();
    if (intentPreset.preset) params.set("preset", intentPreset.preset);
    if (listingType) params.set("listingType", listingType);
    if (category) params.set("category", category);
    effectivePropertyTypes.forEach((type) => params.append("propertyType", type));
    propertyTypeOptionIds.forEach((id) => params.append("pto", id));
    if (locality) params.set("locality", locality);
    if (city) params.set("city", city);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (furnishing) params.set("furnishing", furnishing);
    if (freshOnly) params.set("fresh", "true");
    if (readyToVisitOnly) params.set("readyToVisit", "true");
    if (constructionStatus) params.set("constructionStatus", constructionStatus);
    if (possession) params.set("possession", possession);
    if (availableFrom) params.set("availableFrom", availableFrom);
    if (sort) params.set("sort", sort);
    if (query) params.set("q", query);
    params.set("page", page.toString());

    appendProjectOptionQueries(intentPreset.preset, propertyTypeOptionIds, params);

    if (hasSearchIntent) {
      router.replace(`/properties?${params.toString()}`, { scroll: false });
    } else {
      const browseParams = new URLSearchParams();
      if (needsMoreFilters) {
        if (listingType) browseParams.set("listingType", listingType);
        if (category) browseParams.set("category", category);
      }
      if (page > 1) browseParams.set("page", page.toString());
      if (sort) browseParams.set("sort", sort);
      const qs = browseParams.toString();
      router.replace(qs ? `/properties?${qs}` : "/properties", { scroll: false });
    }

    const apiParams: Record<string, string | string[]> = Object.fromEntries(params.entries());
    if (effectivePropertyTypes.length > 0) {
      apiParams.propertyType = effectivePropertyTypes;
    }

    const { ok, data } = await fetchJson<{ properties: Property[]; pagination: Pagination }>(
      "/api/properties",
      { params: apiParams }
    );

    if (ok && data) {
      setProperties(data.properties || []);
      setPagination(data.pagination || null);
    }

    setLoading(false);
  }, [
    hasSearchIntent,
    needsMoreFilters,
    intentPreset.preset,
    listingType,
    category,
    effectivePropertyTypes,
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
    sort,
    query,
    page,
    router,
  ]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const clearFilters = useCallback(() => {
    setListingType("");
    setCategory("");
    setPropertyType("");
    setPropertyTypes([]);
    setPropertyTypeOptionIds([]);
    setLocality("");
    setCity("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setFurnishing("");
    setFreshOnly(false);
    setReadyToVisitOnly(false);
    setConstructionStatus("");
    setPossession("");
    setAvailableFrom("");
    setSort("");
    setQuery("");
    setPage(1);
  }, []);

  const applyQuickFilter = useCallback((action: string) => {
    setPage(1);
    if (action === "office") {
      setCategory("COMMERCIAL");
      setPropertyTypes(["Office Space"]);
      setPropertyType("Office Space");
    }
    if (action === "2bhk") {
      setCategory("RESIDENTIAL");
      setBedrooms("2");
    }
    if (action === "apartment") {
      setCategory("RESIDENTIAL");
      setPropertyTypes(["Apartment"]);
      setPropertyType("Apartment");
    }
    if (action === "warehouse") {
      setCategory("INDUSTRIAL");
      setPropertyTypes(["Warehouse / Godown"]);
      setPropertyType("Warehouse / Godown");
    }
    if (action === "fresh") setFreshOnly((value) => !value);
    if (action === "ready") setReadyToVisitOnly((value) => !value);
  }, []);

  const currentFiltersObject = useMemo(
    () => ({
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
      readyToVisitOnly,
      constructionStatus,
      possession,
      availableFrom,
      sort,
      query,
    }),
    [
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
      readyToVisitOnly,
      constructionStatus,
      possession,
      availableFrom,
      sort,
      query,
    ]
  );

  const applySavedFilters = useCallback((filters: typeof currentFiltersObject) => {
    setListingType(filters.listingType || "");
    setCategory(filters.category || "");
    setPropertyType(filters.propertyType || "");
    setPropertyTypes(filters.propertyType ? [filters.propertyType] : []);
    setLocality(filters.locality || "");
    setCity(filters.city || "");
    setMinPrice(filters.minPrice || "");
    setMaxPrice(filters.maxPrice || "");
    setBedrooms(filters.bedrooms || "");
    setFurnishing(filters.furnishing || "");
    setFreshOnly(Boolean(filters.freshOnly));
    setReadyToVisitOnly(Boolean(filters.readyToVisitOnly));
    setConstructionStatus(filters.constructionStatus || "");
    setPossession(filters.possession || "");
    setAvailableFrom(filters.availableFrom || "");
    setSort(filters.sort || "");
    setQuery(filters.query || "");
    setPage(1);
  }, []);

  return {
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
    setPropertyType: (value: string) => {
      setPropertyType(value);
      setPropertyTypes(value ? [value] : []);
    },
    propertyTypes: effectivePropertyTypes,
    setPropertyTypes,
    propertyTypeOptionIds,
    setPropertyTypeOptionIds,
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
    sort,
    setSort,
    query,
    setQuery,
    fetchProperties,
    clearFilters,
    applyQuickFilter,
    currentFiltersObject,
    applySavedFilters,
    intentPreset: intentPreset as IntentPreset,
  };
}
