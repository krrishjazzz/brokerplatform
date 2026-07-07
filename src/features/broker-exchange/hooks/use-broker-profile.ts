"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchJson, patchJson } from "@/shared/api/client";

export type BrokerProfileData = {
  name: string | null;
  phone: string | null;
  email: string | null;
  rera: string;
  experience: number;
  city: string;
  bio: string;
  serviceAreas: string[];
  status: string;
  responseScore: number;
  profileCompletion: number;
  completedCollaborations: number;
  lastActiveAt: string | null;
  rejectionReason: string | null;
};

export function useBrokerProfile(enabled: boolean) {
  const [profile, setProfile] = useState<BrokerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    const { ok, data } = await fetchJson<{ profile: BrokerProfileData }>("/api/broker/profile");
    if (ok && data?.profile) setProfile(data.profile);
    setLoading(false);
  }, [enabled]);

  const updateProfile = useCallback(
    async (payload: { bio?: string; serviceAreas?: string[] }) => {
      setSaving(true);
      const { ok, data } = await patchJson<{ profile: Partial<BrokerProfileData> }>(
        "/api/broker/profile",
        payload
      );
      if (ok && data?.profile) {
        setProfile((current) => (current ? { ...current, ...data.profile } : current));
      }
      setSaving(false);
      return ok;
    },
    []
  );

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { profile, loading, saving, refetch, updateProfile };
}
