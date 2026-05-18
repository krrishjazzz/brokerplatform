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
  return (
    <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
      <Button type="button" variant="ghost" onClick={onBack} disabled={step === 0}>
        <ChevronLeft size={16} className="mr-1" /> Back
      </Button>
      {step < STEPS.length - 1 ? (
        <Button type="button" onClick={onNext}>
          Next <ChevronRight size={16} className="ml-1" />
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onSubmit}
          loading={submitting || uploadingImages}
          disabled={uploadingImages || !termsAccepted}
          className="relative z-10"
        >
          Submit Property
        </Button>
      )}
    </div>
  );
}
