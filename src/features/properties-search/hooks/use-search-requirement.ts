"use client";

import { useCallback, useState } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import type { SearchRequirementForm } from "@/components/properties/types";

type UseSearchRequirementOptions = {
  searchParams: ReadonlyURLSearchParams;
  user?: { name?: string | null; phone?: string | null } | null;
  propertyType: string;
  category: string;
  locality: string;
  city: string;
  query: string;
};

function buildInitialForm(
  searchParams: ReadonlyURLSearchParams,
  user?: UseSearchRequirementOptions["user"]
): SearchRequirementForm {
  return {
    name: user?.name || "",
    phone: user?.phone || "",
    requirementType: searchParams.get("propertyType") || "",
    locality: searchParams.get("locality") || searchParams.get("q") || "",
    city: searchParams.get("city") || "",
    budgetMax: searchParams.get("maxPrice") || "",
    urgency: "THIS_WEEK",
    note: "",
  };
}

export function useSearchRequirement({
  searchParams,
  user,
  propertyType,
  category,
  locality,
  city,
  query,
}: UseSearchRequirementOptions) {
  const { toast } = useToast();
  const [form, setForm] = useState(() => buildInitialForm(searchParams, user));
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = useCallback(async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/search-requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          requirementType: form.requirementType || propertyType || category || "Property",
          locality: form.locality || locality || query,
          city: form.city || city || "Kolkata",
          budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
          sourceUrl: typeof window !== "undefined" ? window.location.href : "",
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const firstError =
          data?.error && typeof data.error === "object"
            ? Object.values(data.error).flat().filter(Boolean)[0]
            : data?.error;
        toast(String(firstError || "Could not submit your requirement."), "error");
        return;
      }
      setSent(true);
      toast("Requirement shared. KrrishJazz will look for matching options.", "success");
    } catch {
      toast("Could not submit your requirement.", "error");
    } finally {
      setSubmitting(false);
    }
  }, [form, propertyType, category, locality, city, query, toast]);

  return {
    form,
    setForm,
    submitting,
    sent,
    submit,
  };
}
