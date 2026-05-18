"use client";

import type { PostPropertyStepProps } from "@/features/post-property/types/wizard-step-props";
import { TypeStep } from "@/features/post-property/components/steps/type-step";
import { DetailsStep } from "@/features/post-property/components/steps/details-step";
import { LocationStep } from "@/features/post-property/components/steps/location-step";
import { MediaStep } from "@/features/post-property/components/steps/media-step";
import { ReviewStep } from "@/features/post-property/components/steps/review-step";

export function PostPropertyWizardBody({
  step,
  ...props
}: PostPropertyStepProps & { step: number }) {
  switch (step) {
    case 0:
      return <TypeStep {...props} />;
    case 1:
      return <DetailsStep {...props} />;
    case 2:
      return <LocationStep {...props} />;
    case 3:
      return <MediaStep {...props} />;
    case 4:
      return <ReviewStep {...props} />;
    default:
      return null;
  }
}
