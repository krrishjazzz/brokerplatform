"""Extract wizard step JSX blocks into feature components."""
from pathlib import Path

SRC = Path("src/components/dashboard/post-property-section.tsx")
text = SRC.read_text(encoding="utf-8")

STEP_MARKERS = [
    ("type-step", "          {step === 0 && (", "          )}\n\n          {/* Step 2: Details */}"),
    ("details-step", "          {step === 1 && (", "          )}\n\n          {/* Step 3: Location */}"),
    ("location-step", "          {step === 2 && (", "          )}\n\n          {/* Step 4: Images & Amenities */}"),
    ("media-step", "          {step === 3 && (", "          )}\n\n          {/* Step 5: Review */}"),
    ("review-step", "          {step === 4 && (", "          )}\n\n          {/* Navigation buttons */}"),
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

out_dir = Path("src/features/post-property/components/steps")
out_dir.mkdir(parents=True, exist_ok=True)

for filename, start_marker, end_marker in STEP_MARKERS:
    start = text.index(start_marker) + len(start_marker)
    end = text.index(end_marker, start)
    inner = text[start:end].strip()
    # Remove outer conditional wrapper div if present - keep inner content
    if inner.startswith("<motionless") or inner.startswith("<div"):
        pass
    component_name = "".join(p.capitalize() for p in filename.replace("-step", "").split("-")) + "Step"
    if filename == "type-step":
        component_name = "TypeStep"
    elif filename == "details-step":
        component_name = "DetailsStep"
    elif filename == "location-step":
        component_name = "LocationStep"
    elif filename == "media-step":
        component_name = "MediaStep"
    elif filename == "review-step":
        component_name = "ReviewStep"

    # Replace direct references with props. prefix for destructured props
    body = inner
    export = f"export function {component_name}(props: PostPropertyStepProps) {{\n"
    export += "  const {\n"
    export += "    register, errors, setValue, category, selectedListingType, selectedPropertyType,\n"
    export += "    watchedTitle, uploadFocusItems, activeTypeGuide, isPlotDetail, isCommercialDetail,\n"
    export += "    isIndustrialDetail, isHospitalityDetail, shouldShowRooms, shouldShowFurnishing,\n"
    export += "    categoryNotes, setCategoryNotes, watchedVisibility, images, uploadError,\n"
    export += "    uploadingImages, fileInputRef, uploadImages, removeImage, selectedAmenities,\n"
    export += "    toggleAmenity, suggestedAmenities, reviewChecklist, termsAccepted, setTermsAccepted,\n"
    export += "    watchedPrice, watchedArea, watchedCity, selectedPropertyType: propertyType,\n"
    export += "  } = props;\n\n"
    export += "  return (\n"
    export += body + "\n  );\n}\n"

    path = out_dir / f"{filename}.tsx"
    path.write_text(HEADER + export, encoding="utf-8")
    print("wrote", path, len(body))
