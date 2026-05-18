from pathlib import Path

src = Path("src/components/dashboard/post-property-section.tsx").read_text(encoding="utf-8")

start = src.index("          {step === 0 && (")
end = src.index("          {/* Navigation buttons */}")

body = src[start:end]

# Unwrap step conditionals into switch cases
parts = []
markers = [
    (0, "          {step === 0 && (", "          )}\n\n          {/* Step 2: Details */}"),
    (1, "          {step === 1 && (", "          )}\n\n          {/* Step 3: Location */}"),
    (2, "          {step === 2 && (", "          )}\n\n          {/* Step 4: Images & Amenities */}"),
    (3, "          {step === 3 && (", "          )}\n\n          {/* Step 5: Review */}"),
    (4, "          {step === 4 && (", "          )}\n\n          {/* Navigation buttons */}"),
]

cases = []
for step_num, sm, em in markers:
    s = src.index(sm) + len(sm)
    e = src.index(em, s)
    inner = src[s:e].strip()
    cases.append(f"    case {step_num}:\n      return (\n{inner}\n      );")

header = '''"use client";

import { AlertTriangle, Building2, Check, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AREA_UNITS,
  FURNISHING_OPTIONS,
  INDIAN_STATES,
  PROPERTY_CATEGORY_OPTIONS,
  PROPERTY_TYPES,
} from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import type { PropertyInput } from "@/lib/validations";
import { getVisibilityLabel, VISIBILITY_OPTIONS } from "@/lib/visibility";
import { CATEGORY_ICON_MAP } from "@/features/post-property/category-icons";
import { UploadFocusChecklist } from "@/features/post-property/components/upload-focus-checklist";
import type { PostPropertyStepProps } from "@/features/post-property/types/wizard-step-props";

export function PostPropertyWizardBody({
  step,
  ...p
}: PostPropertyStepProps & { step: number }) {
  const {
    register,
    errors,
    setValue,
    category,
    selectedListingType,
    selectedPropertyType,
    watchedTitle,
    watchedVisibility,
    watchedPrice,
    watchedArea,
    watchedCity,
    uploadFocusItems,
    activeTypeGuide,
    isPlotDetail,
    isCommercialDetail,
    isIndustrialDetail,
    isHospitalityDetail,
    shouldShowRooms,
    shouldShowFurnishing,
    categoryNotes,
    setCategoryNotes,
    images,
    uploadError,
    uploadingImages,
    fileInputRef,
    uploadImages,
    removeImage,
    selectedAmenities,
    toggleAmenity,
    suggestedAmenities,
    reviewChecklist,
    termsAccepted,
    setTermsAccepted,
  } = p;

  switch (step) {
'''

footer = '''
    default:
      return null;
  }
}
'''

out = header + "\n".join(cases) + footer
# Fix price label encoding
out = out.replace("Price (â‚¹)", "Price (₹)")
Path("src/features/post-property/components/post-property-wizard-body.tsx").write_text(out, encoding="utf-8")
print("wrote wizard body", len(out))
