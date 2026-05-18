"use client";

import { useCallback, useState } from "react";

export type PaginationMeta = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
};

export function usePaginationState(initialPage = 1) {
  const [page, setPage] = useState(initialPage);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const resetPage = useCallback(() => setPage(1), []);

  return {
    page,
    setPage,
    pagination,
    setPagination,
    resetPage,
  };
}
