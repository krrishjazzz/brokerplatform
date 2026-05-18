"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "@/shared/hooks/use-local-storage";
import { buildSearchLabel, SAVED_SEARCH_STORAGE_KEY } from "@/features/properties-search/utils/saved-search";
import type { SavedSearch, SavedSearchFilters } from "@/features/properties-search/types";

export function useSavedSearches(currentFilters: SavedSearchFilters, hasSearchIntent: boolean) {
  const { value: savedSearches, setValue: setSavedSearches } = useLocalStorage<SavedSearch[]>(
    SAVED_SEARCH_STORAGE_KEY,
    []
  );

  const saveCurrentSearch = useCallback(() => {
    if (!hasSearchIntent) return { ok: false as const, reason: "no-intent" as const };
    const label = buildSearchLabel(currentFilters) || "Saved search";
    const next: SavedSearch = {
      id: `${Date.now()}`,
      label,
      filters: currentFilters,
      savedAt: Date.now(),
    };
    const deduped = [next, ...savedSearches.filter((item) => item.label !== label)].slice(0, 10);
    setSavedSearches(deduped);
    return { ok: true as const, label };
  }, [currentFilters, hasSearchIntent, savedSearches, setSavedSearches]);

  const deleteSavedSearch = useCallback(
    (id: string) => {
      setSavedSearches(savedSearches.filter((item) => item.id !== id));
    },
    [savedSearches, setSavedSearches]
  );

  const filtersSnapshot = useMemo(() => currentFilters, [currentFilters]);

  return {
    savedSearches,
    saveCurrentSearch,
    deleteSavedSearch,
    filtersSnapshot,
  };
}
