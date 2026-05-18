"use client";

import { useEffect } from "react";

type UrlFilterConfig = Record<string, (value: string) => void>;

export function useBrokerUrlFilters(config: UrlFilterConfig) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(config).forEach(([key, setter]) => {
      const value = params.get(key);
      if (value) setter(value);
    });
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
