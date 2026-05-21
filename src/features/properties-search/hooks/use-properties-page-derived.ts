"use client";

/* eslint-disable react-hooks/exhaustive-deps -- filter setters from parent hook are stable */
import { useMemo } from "react";
import { PROPERTY_TYPES } from "@/lib/constants";
import type { Property } from "@/features/properties-search/types";
import type { Pagination } from "@/components/properties/types";
import { buildActiveFilters } from "@/features/properties-search/utils/active-filters";
import { summarizeProperties } from "@/features/properties-search/utils/property-summary";
import type { SearchPresetId } from "@/lib/search-intent-config";

type FilterState = {
  preset?: SearchPresetId;
  propertyType: string;
  propertyTypes: string[];
  propertyTypeOptionIds: string[];
  locality: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  furnishing: string;
  freshOnly: boolean;
  readyToVisitOnly: boolean;
  constructionStatus: string;
  possession: string;
  availableFrom: string;
};

type FilterSetters = {
  setPropertyType: (v: string) => void;
  setPropertyTypes: (v: string[]) => void;
  setPropertyTypeOptionIds: (v: string[]) => void;
  setLocality: (v: string) => void;
  setCity: (v: string) => void;
  setMinPrice: (v: string) => void;
  setMaxPrice: (v: string) => void;
  setBedrooms: (v: string) => void;
  setFurnishing: (v: string) => void;
  setFreshOnly: (v: boolean) => void;
  setReadyToVisitOnly: (v: boolean) => void;
  setConstructionStatus: (v: string) => void;
  setPossession: (v: string) => void;
  setAvailableFrom: (v: string) => void;
  onClearPreset?: () => void;
};

type UsePropertiesPageDerivedOptions = FilterState &
  FilterSetters & {
    properties: Property[];
    pagination: Pagination | null;
  };

export function usePropertiesPageDerived(options: UsePropertiesPageDerivedOptions) {
  const { properties, pagination, ...filters } = options;

  const availablePropertyTypes = useMemo(
    () => Object.values(PROPERTY_TYPES).flat(),
    []
  );

  const activeFilters = useMemo(
    () =>
      buildActiveFilters(
        {
          preset: filters.preset,
          propertyType: filters.propertyType,
          propertyTypes: filters.propertyTypes,
          propertyTypeOptionIds: filters.propertyTypeOptionIds,
          locality: filters.locality,
          city: filters.city,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          bedrooms: filters.bedrooms,
          furnishing: filters.furnishing,
          freshOnly: filters.freshOnly,
          readyToVisitOnly: filters.readyToVisitOnly,
          constructionStatus: filters.constructionStatus,
          possession: filters.possession,
          availableFrom: filters.availableFrom,
        },
        {
          setPropertyType: filters.setPropertyType,
          setPropertyTypes: filters.setPropertyTypes,
          setPropertyTypeOptionIds: filters.setPropertyTypeOptionIds,
          setLocality: filters.setLocality,
          setCity: filters.setCity,
          setMinPrice: filters.setMinPrice,
          setMaxPrice: filters.setMaxPrice,
          setBedrooms: filters.setBedrooms,
          setFurnishing: filters.setFurnishing,
          setFreshOnly: filters.setFreshOnly,
          setReadyToVisitOnly: filters.setReadyToVisitOnly,
          setConstructionStatus: filters.setConstructionStatus,
          setPossession: filters.setPossession,
          setAvailableFrom: filters.setAvailableFrom,
        },
        { onClearPreset: filters.onClearPreset }
      ),
    [filters]
  );

  const propertySummary = useMemo(() => summarizeProperties(properties), [properties]);

  const visibleProperties = properties;
  const shownTotal = pagination?.total ?? properties.length;

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
