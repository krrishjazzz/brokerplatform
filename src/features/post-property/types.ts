import type { PropertyInput } from "@/lib/validations";

export type PostPropertyDraftPayload = {
  formValues: Partial<PropertyInput>;
  step: number;
  images: string[];
  selectedAmenities: string[];
  typeSpecificDetails: Record<string, string>;
  savedAt: number;
};
