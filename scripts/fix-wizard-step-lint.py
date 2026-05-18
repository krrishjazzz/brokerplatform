"""Trim wizard step files to only destructure props they use."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src/features/post-property/components/steps"

STEP_PROPS = {
    "details-step.tsx": [
        "register",
        "errors",
        "selectedPropertyType",
        "activeTypeGuide",
        "isPlotDetail",
        "isCommercialDetail",
        "isIndustrialDetail",
        "isHospitalityDetail",
        "shouldShowRooms",
        "shouldShowFurnishing",
        "categoryNotes",
        "setCategoryNotes",
    ],
    "location-step.tsx": [
        "register",
        "errors",
        "setValue",
        "watchedCity",
        "selectedPropertyType",
    ],
    "media-step.tsx": [
        "images",
        "uploadError",
        "uploadingImages",
        "fileInputRef",
        "uploadImages",
        "removeImage",
        "selectedAmenities",
        "toggleAmenity",
        "suggestedAmenities",
        "selectedPropertyType",
    ],
    "review-step.tsx": [
        "watchedTitle",
        "watchedVisibility",
        "watchedPrice",
        "watchedArea",
        "watchedCity",
        "selectedPropertyType",
        "selectedListingType",
        "category",
        "images",
        "selectedAmenities",
        "reviewChecklist",
        "termsAccepted",
        "setTermsAccepted",
    ],
}

IMPORTS_BY_STEP = {
    "details-step.tsx": '''import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AREA_UNITS, FURNISHING_OPTIONS } from "@/lib/constants";
import type { PostPropertyStepProps } from "@/features/post-property/types/wizard-step-props";
''',
    "location-step.tsx": '''import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { INDIAN_STATES } from "@/lib/constants";
import type { PostPropertyStepProps } from "@/features/post-property/types/wizard-step-props";
''',
    "media-step.tsx": '''import { AlertTriangle, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UploadFocusChecklist } from "@/features/post-property/components/upload-focus-checklist";
import type { PostPropertyStepProps } from "@/features/post-property/types/wizard-step-props";
''',
    "review-step.tsx": '''import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import { getVisibilityLabel } from "@/lib/visibility";
import type { PostPropertyStepProps } from "@/features/post-property/types/wizard-step-props";
''',
}

for filename, props in STEP_PROPS.items():
    path = ROOT / filename
    body = path.read_text(encoding="utf-8")
    start = body.find("return (")
    if start == -1:
        raise SystemExit(f"No return in {filename}")
    fn_name = filename.replace(".tsx", "").replace("-", " ").title().replace(" ", "")
    fn_name = "".join(p.capitalize() for p in filename.replace(".tsx", "").split("-"))  # DetailsStep
    # details-step -> DetailsStep
    parts = filename.replace(".tsx", "").split("-")
    fn_name = "".join(p.capitalize() for p in parts)

    destructure = ",\n  ".join(props)
    header = f'''"use client";

{IMPORTS_BY_STEP[filename]}
export function {fn_name}({{
  {destructure},
}}: PostPropertyStepProps) {{
'''
    new_content = header + body[start:]
    path.write_text(new_content, encoding="utf-8")
    print("fixed", filename)
