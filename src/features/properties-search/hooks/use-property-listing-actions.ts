"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { useLoginPopup } from "@/lib/login-popup-context";
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
  const { toast } = useToast();
  const { openLoginPopup } = useLoginPopup();
  const [savedPropertyIds, setSavedPropertyIds] = useState<Set<string>>(new Set());
  const pendingSaveRef = useRef<PropertySaveTarget | null>(null);

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

  const persistSave = useCallback(
    async (property: PropertySaveTarget): Promise<void> => {
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
    [toast]
  );

  const saveProperty = useCallback(
    async (property: PropertySaveTarget): Promise<void> => {
      if (!isLoggedIn) {
        pendingSaveRef.current = property;
        openLoginPopup({
          intent: "buyer",
          allowIntentSwitch: false,
          redirect: buildPropertySaveLoginUrl(property.slug),
          title: "Sign in to save properties",
          subtitle: "Save listings and get alerts when prices change.",
          onSuccess: () => {
            const pending = pendingSaveRef.current;
            pendingSaveRef.current = null;
            if (pending) void persistSave(pending);
          },
        });
        return;
      }

      await persistSave(property);
    },
    [isLoggedIn, openLoginPopup, persistSave]
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
