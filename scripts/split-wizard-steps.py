from pathlib import Path

src = Path("src/features/post-property/components/post-property-wizard-body.tsx").read_text(encoding="utf-8")

STEP_FILES = [
    ("type-step.tsx", "TypeStep", 0, 1),
    ("details-step.tsx", "DetailsStep", 1, 2),
    ("location-step.tsx", "LocationStep", 2, 3),
    ("media-step.tsx", "MediaStep", 3, 4),
    ("review-step.tsx", "ReviewStep", 4, 5),
]

HEADER = '''"use client";

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

'''

IMPORTS_BY_STEP = {
    "type-step.tsx": ["Building2", "PROPERTY_CATEGORY_OPTIONS", "PROPERTY_TYPES", "CATEGORY_ICON_MAP", "UploadFocusChecklist", "PropertyInput"],
    "details-step.tsx": ["AREA_UNITS", "FURNISHING_OPTIONS", "UploadFocusChecklist"],
    "location-step.tsx": ["INDIAN_STATES"],
    "media-step.tsx": ["Upload", "X", "Check", "VISIBILITY_OPTIONS", "cn"],
    "review-step.tsx": ["AlertTriangle", "Check", "Badge", "formatPrice", "getVisibilityLabel", "cn"],
}

out_dir = Path("src/features/post-property/components/steps")
out_dir.mkdir(parents=True, exist_ok=True)

for filename, component, case_num, _ in STEP_FILES:
    marker = f"    case {case_num}:"
    next_marker = f"    case {case_num + 1}:" if case_num < 4 else "    default:"
    start = src.index(marker) + len(marker)
    end = src.index(next_marker, start)
    inner = src[start:end].strip()
    # remove leading "return (" and trailing ");"
    if inner.startswith("return ("):
        inner = inner[len("return ("):].strip()
    if inner.endswith(");"):
        inner = inner[:-2].strip()
    if inner.endswith(")"):
        inner = inner[:-1].strip()

    body = HEADER + f"export function {component}(p: PostPropertyStepProps) {{\n"
    body += "  const {\n    register, errors, setValue, category, selectedListingType, selectedPropertyType,\n"
    body += "    watchedTitle, watchedVisibility, watchedPrice, watchedArea, watchedCity, uploadFocusItems,\n"
    body += "    activeTypeGuide, isPlotDetail, isCommercialDetail, isIndustrialDetail, isHospitalityDetail,\n"
    body += "    shouldShowRooms, shouldShowFurnishing, categoryNotes, setCategoryNotes, images, uploadError,\n"
    body += "    uploadingImages, fileInputRef, uploadImages, removeImage, selectedAmenities, toggleAmenity,\n"
    body += "    suggestedAmenities, reviewChecklist, termsAccepted, setTermsAccepted,\n  } = p;\n\n"
    body += f"  return (\n{inner}\n  );\n}}\n"
    body = body.replace("Price (â‚¹)", "Price (₹)")
    (out_dir / filename).write_text(body, encoding="utf-8")
    print("wrote", filename)

# Slim wizard body to dispatcher
dispatcher = '''"use client";

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
'''
Path("src/features/post-property/components/post-property-wizard-body.tsx").write_text(dispatcher, encoding="utf-8")
print("updated dispatcher")
