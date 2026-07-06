"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchJson } from "@/shared/api/client";

export type BrokerOverviewData = {
  greeting: string;
  stats: {
    inventoryTotal: number;
    demandTotal: number;
    freshInventory: number;
    freshDemand: number;
    hotMatchCount: number;
    followUpCount: number;
    matchedDemandCount: number;
    activeCollaborations: number;
  };
  navCounts: {
    inventory: number;
    demand: number;
    matches: number;
    followUps: number;
  };
  followUpQueue: Array<{
    id: string;
    title: string;
    city: string;
    matchingRequirementsCount: number;
    updatedAt: string;
  }>;
  suggestedMatches: Array<{
    propertyId: string;
    propertyTitle: string;
    requirementId: string;
    requirementDescription: string;
    score: number;
    label: string;
    city: string;
  }>;
  recentCollaborations: Array<{
    id: string;
    status: string;
    lastAction: string;
    updatedAt: string;
    property: { id: string; title: string; slug: string; city: string } | null;
    requirement: { id: string; description: string; city: string } | null;
  }>;
  recentActivity: Array<{
    id: string;
    eventType: string;
    targetType: string;
    createdAt: string;
    propertyId: string | null;
    requirementId: string | null;
  }>;
  profile: {
    rera: string;
    city: string;
    serviceAreas: string[];
    bio: string;
    responseScore: number;
    profileCompletion: number;
    completedCollaborations: number;
    lastActiveAt: string | null;
  } | null;
};

export function useBrokerOverview(enabled: boolean) {
  const [data, setData] = useState<BrokerOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    const { ok, data: payload } = await fetchJson<BrokerOverviewData>("/api/broker/overview");
    if (ok && payload) setData(payload);
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, refetch };
}
