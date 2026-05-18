"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchJson } from "@/shared/api/client";
import { usePaginationState } from "@/shared/hooks/use-pagination-state";
import type { BrokerPagination, BrokerProperty } from "@/features/broker-exchange/types";

export type BrokerInventoryFilters = {
  q?: string;
  listingType?: string;
  category?: string;
  propertyType?: string;
  locality?: string;
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
};

export function useBrokerInventory(filters: BrokerInventoryFilters, enabled: boolean) {
  const { page, setPage, pagination, setPagination, resetPage } = usePaginationState(1);
  const [properties, setProperties] = useState<BrokerProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);

    const { ok, data } = await fetchJson<{
      properties: BrokerProperty[];
      pagination: BrokerPagination;
    }>("/api/broker/properties", {
      params: {
        ...filters,
        page,
      },
    });

    if (ok && data) {
      setProperties(data.properties || []);
      setPagination(data.pagination || null);
    }

    setLoading(false);
  }, [enabled, filters, page, setPagination]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return {
    properties,
    loading,
    page,
    setPage,
    pagination,
    resetPage,
    refetch: fetchProperties,
  };
}
