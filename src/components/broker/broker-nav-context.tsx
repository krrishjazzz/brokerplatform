"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchJson } from "@/shared/api/client";

export type BrokerNavCounts = {
  inventory: number;
  demand: number;
  matches: number;
  followUps: number;
};

export type BrokerNavCountKey = keyof Pick<BrokerNavCounts, "inventory" | "demand" | "matches">;

export function getBrokerNavBadge(counts: BrokerNavCounts, countKey?: BrokerNavCountKey) {
  return countKey ? counts[countKey] : 0;
}

type BrokerNavContextValue = {
  counts: BrokerNavCounts;
  loading: boolean;
  refresh: () => Promise<void>;
};

const defaultCounts: BrokerNavCounts = {
  inventory: 0,
  demand: 0,
  matches: 0,
  followUps: 0,
};

const BrokerNavContext = createContext<BrokerNavContextValue>({
  counts: defaultCounts,
  loading: true,
  refresh: async () => {},
});

export function BrokerNavProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<BrokerNavCounts>(defaultCounts);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { ok, data } = await fetchJson<{ navCounts: BrokerNavCounts }>("/api/broker/overview");
    if (ok && data?.navCounts) setCounts(data.navCounts);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(() => ({ counts, loading, refresh }), [counts, loading, refresh]);

  return <BrokerNavContext.Provider value={value}>{children}</BrokerNavContext.Provider>;
}

export function useBrokerNavCounts() {
  return useContext(BrokerNavContext);
}
