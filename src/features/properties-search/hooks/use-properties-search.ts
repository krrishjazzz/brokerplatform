"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchJson } from "@/shared/api/client";
import type { Pagination, Property } from "@/features/properties-search/types";
import { countSearchIntent, getInitialPage, resolveIntentPreset } from "@/features/properties-search/utils/search-intent";

type IntentPreset = ReturnType<typeof resolveIntentPreset>;

type UsePropertiesSearchOptions = {
  searchParams: URLSearchParams;
};

export function usePropertiesSearch({ searchParams }: UsePropertiesSearchOptions) {
  const router = useRouter();
  const intentPreset = useMemo(
    () => resolveIntentPreset(searchParams.get("intent")),
    [searchParams]
  );

  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const [listingType, setListingType] = useState(
    searchParams.get("listingType") || intentPreset.listingType || ""
  );
  const [category, setCategory] = useState(searchParams.get("category") || intentPreset.category || "");
  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") || intentPreset.propertyType || ""
  );
  const [locality, setLocality] = useState(searchParams.get("locality") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
  const [furnishing, setFurnishing] = useState(searchParams.get("furnishing") || "");
  const [freshOnly, setFreshOnly] = useState(searchParams.get("fresh") === "true");
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("verified") === "true");
  const [readyToVisitOnly, setReadyToVisitOnly] = useState(searchParams.get("readyToVisit") === "true");
  const [ownerListedOnly, setOwnerListedOnly] = useState(searchParams.get("ownerListed") === "true");
  const [budgetMatchOnly, setBudgetMatchOnly] = useState(searchParams.get("budgetMatch") === "true");
  const [availability, setAvailability] = useState(searchParams.get("availability") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(getInitialPage(searchParams.get("page")));

  const { hasSearchIntent, needsMoreFilters } = useMemo(
    () =>
      countSearchIntent({
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
      verifiedOnly,
      readyToVisitOnly,
      ownerListedOnly,
      budgetMatchOnly,
      availability,
      query,
    ]
  );

  const fetchProperties = useCallback(async () => {
    setLoading(true);

    const params = new URLSearchParams();
    if (listingType) params.set("listingType", listingType);
    if (category) params.set("category", category);
    if (propertyType) params.set("propertyType", propertyType);
    if (locality) params.set("locality", locality);
    if (city) params.set("city", city);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (furnishing) params.set("furnishing", furnishing);
    if (freshOnly) params.set("fresh", "true");
    if (verifiedOnly) params.set("verified", "true");
    if (readyToVisitOnly) params.set("readyToVisit", "true");
    if (ownerListedOnly) params.set("ownerListed", "true");
    if (budgetMatchOnly) params.set("budgetMatch", "true");
    if (availability) params.set("availability", availability);
    if (sort) params.set("sort", sort);
    if (query) params.set("q", query);
    params.set("page", page.toString());

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

    const { ok, data } = await fetchJson<{ properties: Property[]; pagination: Pagination }>(
      "/api/properties",
      { params: Object.fromEntries(params.entries()) }
    );

    if (ok && data) {
      setProperties(data.properties || []);
      setPagination(data.pagination || null);
    }

    setLoading(false);
  }, [
    hasSearchIntent,
    needsMoreFilters,
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
    setLocality("");
    setCity("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setFurnishing("");
    setFreshOnly(false);
    setVerifiedOnly(false);
    setReadyToVisitOnly(false);
    setOwnerListedOnly(false);
    setBudgetMatchOnly(false);
    setAvailability("");
    setSort("");
    setQuery("");
    setPage(1);
  }, []);

  const applyQuickFilter = useCallback(
    (action: string) => {
      setPage(1);
      if (action === "office") {
        setCategory("COMMERCIAL");
        setPropertyType("Office Space");
      }
      if (action === "2bhk") {
        setCategory("RESIDENTIAL");
        setBedrooms("2");
      }
      if (action === "warehouse") {
        setCategory("INDUSTRIAL");
        setPropertyType("Warehouse / Godown");
      }
      if (action === "verified") setVerifiedOnly((value) => !value);
      if (action === "fresh") setFreshOnly((value) => !value);
      if (action === "ready") setReadyToVisitOnly((value) => !value);
      if (action === "owner") setOwnerListedOnly((value) => !value);
      if (action === "budget") {
        setBudgetMatchOnly((value) => !value);
        if (!minPrice && !maxPrice) setMaxPrice(listingType === "RENT" ? "50000" : "10000000");
      }
    },
    [listingType, minPrice, maxPrice]
  );

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
      verifiedOnly,
      readyToVisitOnly,
      ownerListedOnly,
      budgetMatchOnly,
      availability,
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
      verifiedOnly,
      readyToVisitOnly,
      ownerListedOnly,
      budgetMatchOnly,
      availability,
      sort,
      query,
    ]
  );

  const applySavedFilters = useCallback((filters: typeof currentFiltersObject) => {
    setListingType(filters.listingType || "");
    setCategory(filters.category || "");
    setPropertyType(filters.propertyType || "");
    setLocality(filters.locality || "");
    setCity(filters.city || "");
    setMinPrice(filters.minPrice || "");
    setMaxPrice(filters.maxPrice || "");
    setBedrooms(filters.bedrooms || "");
    setFurnishing(filters.furnishing || "");
    setFreshOnly(Boolean(filters.freshOnly));
    setVerifiedOnly(Boolean(filters.verifiedOnly));
    setReadyToVisitOnly(Boolean(filters.readyToVisitOnly));
    setOwnerListedOnly(Boolean(filters.ownerListedOnly));
    setBudgetMatchOnly(Boolean(filters.budgetMatchOnly));
    setAvailability(filters.availability || "");
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
    intentPreset: intentPreset as IntentPreset,
  };
}
