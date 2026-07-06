"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchJson } from "@/shared/api/client";

export type BrokerCollaboration = {
  id: string;
  status: string;
  lastAction: string;
  source: string;
  updatedAt: string;
  property: {
    id: string;
    title: string;
    slug: string;
    city: string;
    price: number;
  } | null;
  requirement: {
    id: string;
    description: string;
    city: string;
    propertyType: string;
  } | null;
  initiator: { id: string; name: string | null };
  recipient: { id: string; name: string | null } | null;
};

export function useBrokerCollaborations(enabled: boolean, status?: string) {
  const [collaborations, setCollaborations] = useState<BrokerCollaboration[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    const { ok, data } = await fetchJson<{ collaborations: BrokerCollaboration[] }>("/api/broker/collaborations", {
      params: status ? { status } : undefined,
    });
    if (ok && data) setCollaborations(data.collaborations || []);
    setLoading(false);
  }, [enabled, status]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { collaborations, loading, refetch };
}
