"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchJson } from "@/shared/api/client";
import { usePaginationState } from "@/shared/hooks/use-pagination-state";
import type { BrokerPagination, BrokerRequirement } from "@/features/broker-exchange/types";

export type BrokerRequirementsFilters = {
  q?: string;
  propertyType?: string;
  locality?: string;
  city?: string;
  minBudget?: string;
  maxBudget?: string;
  urgency?: string;
};

export function useBrokerRequirementsList(filters: BrokerRequirementsFilters, enabled: boolean) {
  const { page, setPage, pagination, setPagination, resetPage } = usePaginationState(1);
  const [requirements, setRequirements] = useState<BrokerRequirement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequirements = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);

    const { ok, data } = await fetchJson<{
      requirements: BrokerRequirement[];
      pagination: BrokerPagination;
    }>("/api/broker/requirements", {
      params: {
        ...filters,
        page,
      },
    });

    if (ok && data) {
      setRequirements(data.requirements || []);
      setPagination(data.pagination || null);
    }

    setLoading(false);
  }, [enabled, filters, page, setPagination]);

  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  return {
    requirements,
    loading,
    page,
    setPage,
    pagination,
    resetPage,
    refetch: fetchRequirements,
  };
}
