"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { profileCanList } from "@/lib/capabilities";
import { OWNER_DASHBOARD_PATH } from "@/lib/dashboard-paths";

/** Keeps logged-in owners off the marketing homepage (client navigation). */
export function HomeOwnerRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user || !profileCanList(user)) return;
    router.replace(OWNER_DASHBOARD_PATH);
  }, [user, loading, router]);

  return null;
}
