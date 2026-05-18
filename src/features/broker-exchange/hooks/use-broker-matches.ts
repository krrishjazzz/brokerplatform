"use client";

import { useCallback, useState } from "react";
import { fetchJson } from "@/shared/api/client";
import type { BrokerMatchedProperty, BrokerMatchedRequirement } from "@/features/broker-exchange/types";

type MatchMode = "property" | "requirement";

export function useBrokerMatches() {
  const [loading, setLoading] = useState(false);
  const [matchedRequirements, setMatchedRequirements] = useState<BrokerMatchedRequirement[]>([]);
  const [matchedProperties, setMatchedProperties] = useState<BrokerMatchedProperty[]>([]);

  const loadMatches = useCallback(async (mode: MatchMode, id: string, limit = 8) => {
    setLoading(true);
    setMatchedRequirements([]);
    setMatchedProperties([]);

    const { ok, data } = await fetchJson<{
      requirements?: BrokerMatchedRequirement[];
      properties?: BrokerMatchedProperty[];
    }>("/api/broker/matches", {
      params: { mode, id, limit },
    });

    if (ok && data) {
      if (mode === "property") setMatchedRequirements(data.requirements || []);
      else setMatchedProperties(data.properties || []);
    }

    setLoading(false);
    return ok;
  }, []);

  const clearMatches = useCallback(() => {
    setMatchedRequirements([]);
    setMatchedProperties([]);
  }, []);

  return {
    loading,
    matchedRequirements,
    matchedProperties,
    loadMatches,
    clearMatches,
  };
}
