import type { PropertyInput } from "@/lib/validations";

export type PostPropertyDraftPayload = {
  formValues: Partial<PropertyInput>;
  step: number;
  images: string[];
  selectedAmenities: string[];
  categoryNotes: string;
  savedAt: number;
};
