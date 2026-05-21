"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { POST_PROPERTY_STEPS } from "@/features/post-property/constants";

const STEPS = [...POST_PROPERTY_STEPS];

type WizardNavigationProps = {
  step: number;
  submitting: boolean;
  uploadingImages: boolean;
  termsAccepted: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
};

export function WizardNavigation({
  step,
  submitting,
  uploadingImages,
  termsAccepted,
  onBack,
  onNext,
  onSubmit,
}: WizardNavigationProps) {
  const isLast = step >= STEPS.length - 1;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-white/95 px-4 py-3 backdrop-blur sm:static sm:z-auto sm:mt-8 sm:border-t sm:bg-transparent sm:px-0 sm:py-0 sm:pt-6">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          className="min-h-[44px] min-w-[96px]"
          onClick={onBack}
          disabled={step === 0}
        >
          <ChevronLeft size={16} className="mr-1" /> Back
        </Button>
        {!isLast ? (
          <Button type="button" className="min-h-[44px] min-w-[120px]" onClick={onNext}>
            Continue <ChevronRight size={16} className="ml-1" />
          </Button>
        ) : (
          <Button
            type="button"
            className="min-h-[44px] min-w-[140px]"
            onClick={onSubmit}
            loading={submitting || uploadingImages}
            disabled={uploadingImages || !termsAccepted}
          >
            Submit listing
          </Button>
        )}
      </div>
    </div>
  );
}
