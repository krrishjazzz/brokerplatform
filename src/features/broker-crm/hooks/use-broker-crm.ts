"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchJson, postJson } from "@/shared/api/client";
import type { BrokerCrmClient, BrokerCrmListing, BrokerCrmShare, BrokerCrmTask, CrmStage } from "./types";

export function useBrokerCrmClients(enabled: boolean, stage?: string, q?: string) {
  const [clients, setClients] = useState<BrokerCrmClient[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    const { ok, data } = await fetchJson<{ clients: BrokerCrmClient[] }>("/api/broker/crm/clients", {
      params: { stage, q },
    });
    if (ok && data) setClients(data.clients);
    setLoading(false);
  }, [enabled, q, stage]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { clients, loading, refetch, setClients };
}

export function useBrokerCrmToday(enabled: boolean) {
  const [data, setData] = useState<{
    stats: { activeClients: number; overdueCount: number; dueTodayCount: number; newLeads: number };
    overdueTasks: BrokerCrmTask[];
    todayTasks: BrokerCrmTask[];
    hotStaleClients: BrokerCrmClient[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    const { ok, data: payload } = await fetchJson<NonNullable<typeof data>>("/api/broker/crm/today");
    if (ok && payload) setData(payload);
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, refetch };
}

export function useBrokerCrmListings(enabled: boolean) {
  const [listings, setListings] = useState<BrokerCrmListing[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    const { ok, data } = await fetchJson<{ listings: BrokerCrmListing[] }>("/api/broker/crm/listings");
    if (ok && data) setListings(data.listings);
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { listings, loading, refetch };
}

export async function createBrokerClient(payload: Record<string, unknown>) {
  return postJson<{ client: BrokerCrmClient }>("/api/broker/crm/clients", payload);
}

export async function updateBrokerClient(id: string, payload: Record<string, unknown>) {
  return fetchJson<{ client: BrokerCrmClient }>(`/api/broker/crm/clients/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function getBrokerClientDetail(id: string) {
  return fetchJson<{ client: BrokerCrmClient; shares: BrokerCrmShare[]; tasks: BrokerCrmTask[] }>(
    `/api/broker/crm/clients/${id}`
  );
}

export async function createBrokerTask(payload: Record<string, unknown>) {
  return postJson<{ task: BrokerCrmTask }>("/api/broker/crm/tasks", payload);
}

export async function updateBrokerTask(id: string, payload: Record<string, unknown>) {
  return fetchJson<{ task: BrokerCrmTask }>(`/api/broker/crm/tasks/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function sharePropertiesToClient(payload: {
  clientId: string;
  propertyIds: string[];
  templateKey?: string;
  customMessage?: string;
}) {
  return postJson<{ whatsappUrl: string; messageBody: string; share: BrokerCrmShare }>(
    "/api/broker/crm/share",
    payload
  );
}

export function updateClientStageLocally(
  clients: BrokerCrmClient[],
  id: string,
  stage: CrmStage
): BrokerCrmClient[] {
  return clients.map((client) => (client.id === id ? { ...client, stage } : client));
}
