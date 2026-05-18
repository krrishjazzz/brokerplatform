"use client";

/* eslint-disable react-hooks/exhaustive-deps -- filter setters from parent hook are stable */
import { useMemo } from "react";
import { PROPERTY_TYPES } from "@/lib/constants";
import type { Property } from "@/features/properties-search/types";
import type { Pagination } from "@/components/properties/types";
import { buildActiveFilters } from "@/features/properties-search/utils/active-filters";
import { summarizeProperties } from "@/features/properties-search/utils/property-summary";
import { isBudgetMatched } from "@/features/properties-search/utils/search-intent";

type FilterState = {
  listingType: string;
  category: string;
  propertyType: string;
  locality: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  furnishing: string;
  freshOnly: boolean;
  verifiedOnly: boolean;
  readyToVisitOnly: boolean;
  ownerListedOnly: boolean;
  budgetMatchOnly: boolean;
  availability: string;
};

type FilterSetters = {
  setListingType: (v: string) => void;
  setCategory: (v: string) => void;
  setPropertyType: (v: string) => void;
  setLocality: (v: string) => void;
  setCity: (v: string) => void;
  setMinPrice: (v: string) => void;
  setMaxPrice: (v: string) => void;
  setBedrooms: (v: string) => void;
  setFurnishing: (v: string) => void;
  setFreshOnly: (v: boolean) => void;
  setVerifiedOnly: (v: boolean) => void;
  setReadyToVisitOnly: (v: boolean) => void;
  setOwnerListedOnly: (v: boolean) => void;
  setBudgetMatchOnly: (v: boolean) => void;
  setAvailability: (v: string) => void;
};

type UsePropertiesPageDerivedOptions = FilterState &
  FilterSetters & {
    properties: Property[];
    pagination: Pagination | null;
  };

export function usePropertiesPageDerived(options: UsePropertiesPageDerivedOptions) {
  const {
    properties,
    pagination,
    budgetMatchOnly,
    minPrice,
    maxPrice,
    category,
    listingType,
    propertyType,
    locality,
    city,
    bedrooms,
    furnishing,
    freshOnly,
    verifiedOnly,
    readyToVisitOnly,
    ownerListedOnly,
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
  } = options;

  const availablePropertyTypes = useMemo(
    () => (category ? PROPERTY_TYPES[category] || [] : Object.values(PROPERTY_TYPES).flat()),
    [category]
  );

  const activeFilters = useMemo(
    () =>
      buildActiveFilters(
        {
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
        },
        {
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
        }
      ),
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
    ]
  );

  const propertySummary = useMemo(() => summarizeProperties(properties), [properties]);

  const visibleProperties = useMemo(
    () =>
      properties.filter((property) => {
        if (budgetMatchOnly && !isBudgetMatched(Number(property.price), minPrice, maxPrice)) {
          return false;
        }
        return true;
      }),
    [properties, budgetMatchOnly, minPrice, maxPrice]
  );

  const shownTotal = budgetMatchOnly
    ? visibleProperties.length
    : pagination?.total ?? properties.length;

  return {
    availablePropertyTypes,
    activeFilters,
    propertySummary,
    visibleProperties,
    shownTotal,
    freshCount: propertySummary.freshCount,
    verifiedCount: propertySummary.verifiedCount,
  };
}
