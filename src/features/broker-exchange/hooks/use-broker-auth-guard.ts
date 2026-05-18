"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function useBrokerAuthGuard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "BROKER" || user.brokerStatus !== "APPROVED") {
      router.replace("/dashboard?tab=application");
    }
  }, [user, loading, router]);

  const isReady = Boolean(user?.role === "BROKER" && user.brokerStatus === "APPROVED");

  return { user, loading, isReady };
}
