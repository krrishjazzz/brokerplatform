"use client";

import { useEffect, useRef, useState } from "react";
import type { UseFormReset, UseFormWatch } from "react-hook-form";
import type { PropertyInput } from "@/lib/validations";
import {
  POST_PROPERTY_DRAFT_DEBOUNCE_MS,
  POST_PROPERTY_DRAFT_KEY,
  POST_PROPERTY_STEPS,
} from "@/features/post-property/constants";
import type { PostPropertyDraftPayload } from "@/features/post-property/types";

type UsePostPropertyDraftOptions = {
  watch: UseFormWatch<PropertyInput>;
  reset: UseFormReset<PropertyInput>;
  step: number;
  images: string[];
  selectedAmenities: string[];
  categoryNotes: string;
  setImages: (images: string[]) => void;
  setSelectedAmenities: (amenities: string[]) => void;
  setCategoryNotes: (notes: string) => void;
  setStep: (step: number) => void;
  onResumeToast: (message: string) => void;
  onDiscardToast: (message: string) => void;
};

export function usePostPropertyDraft({
  watch,
  reset,
  step,
  images,
  selectedAmenities,
  categoryNotes,
  setImages,
  setSelectedAmenities,
  setCategoryNotes,
  setStep,
  onResumeToast,
  onDiscardToast,
}: UsePostPropertyDraftOptions) {
  const [draftMeta, setDraftMeta] = useState<{ savedAt: number } | null>(null);
  const [pendingDraft, setPendingDraft] = useState<PostPropertyDraftPayload | null>(null);
  const [draftSaving, setDraftSaving] = useState(false);
  const draftLoadedRef = useRef(false);
  const draftSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || draftLoadedRef.current) return;
    draftLoadedRef.current = true;
    try {
      const stored = localStorage.getItem(POST_PROPERTY_DRAFT_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as PostPropertyDraftPayload;
      if (!parsed?.savedAt) return;
      setPendingDraft(parsed);
    } catch {
      // ignore
    }
  }, []);

  const clearDraft = () => {
    try {
      localStorage.removeItem(POST_PROPERTY_DRAFT_KEY);
    } catch {
      // ignore
    }
    setDraftMeta(null);
  };

  const resumeDraft = (draft: PostPropertyDraftPayload) => {
    if (draft.formValues) {
      reset({ ...draft.formValues } as PropertyInput);
    }
    if (draft.images?.length) setImages(draft.images);
    if (draft.selectedAmenities?.length) setSelectedAmenities(draft.selectedAmenities);
    if (typeof draft.categoryNotes === "string") setCategoryNotes(draft.categoryNotes);
    if (typeof draft.step === "number") {
      setStep(Math.min(Math.max(draft.step, 0), POST_PROPERTY_STEPS.length - 1));
    }
    setDraftMeta({ savedAt: draft.savedAt });
    setPendingDraft(null);
    onResumeToast("Draft restored. Continue where you left off.");
  };

  const discardDraft = () => {
    clearDraft();
    setPendingDraft(null);
    onDiscardToast("Draft discarded.");
  };

  useEffect(() => {
    if (typeof window === "undefined" || pendingDraft) return;

    const subscription = watch((formValues) => {
      if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current);
      setDraftSaving(true);
      draftSaveTimer.current = setTimeout(() => {
        try {
          const payload: PostPropertyDraftPayload = {
            formValues: formValues as Partial<PropertyInput>,
            step,
            images,
            selectedAmenities,
            categoryNotes,
            savedAt: Date.now(),
          };
          const hasContent =
            !!payload.formValues?.title ||
            !!payload.formValues?.listingType ||
            !!payload.formValues?.category ||
            !!payload.formValues?.propertyType ||
            !!payload.formValues?.city ||
            !!payload.formValues?.locality ||
            images.length > 0;
          if (!hasContent) {
            setDraftSaving(false);
            return;
          }
          localStorage.setItem(POST_PROPERTY_DRAFT_KEY, JSON.stringify(payload));
          setDraftMeta({ savedAt: payload.savedAt });
        } catch {
          // ignore quota errors
        } finally {
          setDraftSaving(false);
        }
      }, POST_PROPERTY_DRAFT_DEBOUNCE_MS);
    });

    return () => {
      subscription.unsubscribe();
      if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current);
    };
  }, [watch, pendingDraft, step, images, selectedAmenities, categoryNotes]);

  return {
    draftMeta,
    pendingDraft,
    draftSaving,
    clearDraft,
    resumeDraft,
    discardDraft,
  };
}
