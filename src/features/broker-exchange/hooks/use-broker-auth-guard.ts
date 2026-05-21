"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { buildLoginUrl } from "@/lib/login-intent";

export function useBrokerAuthGuard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(buildLoginUrl({ intent: "broker", redirect: "/broker/properties" }));
      return;
    }
    if (user.brokerStatus !== "APPROVED") {
      router.replace(user.brokerStatus ? "/dashboard?tab=application" : "/brokers");
    }
  }, [user, loading, router]);

  const isReady = Boolean(user?.brokerStatus === "APPROVED");

  return { user, loading, isReady };
}
