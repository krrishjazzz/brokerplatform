import type { RefObject } from "react";
import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import type { PropertyInput } from "@/lib/validations";

export type ReviewChecklistItem = {
  label: string;
  detail: string;
  complete: boolean;
};

export type PostPropertyStepProps = {
  register: UseFormRegister<PropertyInput>;
  errors: FieldErrors<PropertyInput>;
  setValue: UseFormSetValue<PropertyInput>;
  category?: string;
  selectedListingType?: string;
  selectedPropertyType?: string;
  watchedTitle?: string;
  watchedPrice?: unknown;
  watchedArea?: unknown;
  watchedCity?: string;
  watchedVisibility?: string;
  uploadFocusItems: string[];
  activeTypeGuide?: { hint?: string; fields?: string[] } | null;
  isPlotDetail: boolean;
  isCommercialDetail: boolean;
  isIndustrialDetail: boolean;
  isHospitalityDetail: boolean;
  shouldShowRooms: boolean;
  shouldShowFurnishing: boolean;
  categoryNotes: string;
  setCategoryNotes: (value: string) => void;
  images: string[];
  uploadError: string;
  uploadingImages: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  uploadImages: (files: FileList) => Promise<void>;
  removeImage: (index: number) => void;
  selectedAmenities: string[];
  toggleAmenity: (amenity: string) => void;
  suggestedAmenities: string[];
  reviewChecklist: ReviewChecklistItem[];
  termsAccepted: boolean;
  setTermsAccepted: (value: boolean) => void;
};
