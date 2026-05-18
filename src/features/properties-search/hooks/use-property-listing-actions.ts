"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { buildPropertySaveLoginUrl } from "@/lib/auth-redirect";
import {
  parseSavedPropertyIds,
  parseSavedToggleResponse,
  savedPropertyToastMessage,
} from "@/lib/saved-property-feedback";
import { formatPrice } from "@/lib/utils";
import type { Property, PropertySaveTarget } from "@/features/properties-search/types";

type UsePropertyListingActionsOptions = {
  isLoggedIn: boolean;
};

export function usePropertyListingActions({ isLoggedIn }: UsePropertyListingActionsOptions) {
  const router = useRouter();
  const { toast } = useToast();
  const [savedPropertyIds, setSavedPropertyIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isLoggedIn) {
      setSavedPropertyIds(new Set());
      return;
    }

    fetch("/api/saved", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setSavedPropertyIds(new Set(parseSavedPropertyIds(data)));
      })
      .catch(() => {});
  }, [isLoggedIn]);

  const isPropertySaved = useCallback(
    (propertyId: string) => savedPropertyIds.has(propertyId),
    [savedPropertyIds]
  );

  const saveProperty = useCallback(
    async (property: PropertySaveTarget): Promise<void> => {
      if (!isLoggedIn) {
        router.push(buildPropertySaveLoginUrl(property.slug));
        return;
      }

      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ propertyId: property.id }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast(String(data?.error || "Could not update saved property."), "error");
        return;
      }

      const saved = parseSavedToggleResponse(data);
      if (saved === null) {
        toast("Could not update saved property.", "error");
        return;
      }

      setSavedPropertyIds((current) => {
        const next = new Set(current);
        if (saved) next.add(property.id);
        else next.delete(property.id);
        return next;
      });
      toast(savedPropertyToastMessage(saved), saved ? "success" : "info");
    },
    [isLoggedIn, router, toast]
  );

  const shareProperty = useCallback(
    async (property: Property): Promise<void> => {
      const url = `${window.location.origin}/properties/${property.slug}`;
      const text = [
        `${property.title} - ${formatPrice(Number(property.price))}`,
        `${property.propertyType} in ${property.city}`,
        `${Math.round(property.area).toLocaleString()} ${property.areaUnit}`,
        url,
      ].join("\n");

      if (navigator.share) {
        await navigator.share({ title: property.title, text, url });
        return;
      }

      await navigator.clipboard?.writeText(text);
      toast("Property share text copied.", "success");
    },
    [toast]
  );

  return { saveProperty, shareProperty, isPropertySaved, savedPropertyIds };
}

export type { PropertySaveTarget };
