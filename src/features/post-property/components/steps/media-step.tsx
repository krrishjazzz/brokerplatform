"use client";

import { useState } from "react";
import { Camera, Check, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getPhotoChecklistForType,
  MIN_IMAGES_RECOMMENDED,
  MIN_IMAGES_SUBMIT,
} from "@/lib/posting-validation";
import { CollapsibleSection } from "@/features/post-property/components/collapsible-section";
import { OwnerVisibilityPicker } from "@/features/post-property/components/owner-visibility-picker";
import type { PostPropertyStepProps } from "@/features/post-property/types/wizard-step-props";

export function MediaStep(p: PostPropertyStepProps) {
  const {
    images,
    uploadError,
    fileInputRef,
    uploadImages,
    removeImage,
    selectedAmenities,
    toggleAmenity,
    suggestedAmenities,
    errors,
    selectedPropertyType,
    watchedVisibility,
    setValue,
  } = p;

  const photoItems = selectedPropertyType
    ? getPhotoChecklistForType(selectedPropertyType)
    : ["Front / building", "Main room", "Kitchen / washroom", "Road / entrance"];
  const [checkedPhotos, setCheckedPhotos] = useState<Record<string, boolean>>({});

  const togglePhotoHint = (item: string) => {
    setCheckedPhotos((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const needsBetterPhotos =
    images.length >= MIN_IMAGES_SUBMIT && images.length < MIN_IMAGES_RECOMMENDED;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-primary/20 bg-primary-light/60 px-3 py-3">
        <p className="text-sm font-semibold text-primary">Photos build trust</p>
        <p className="mt-1 text-xs text-text-secondary">
          Add at least {MIN_IMAGES_SUBMIT} photo to submit. {MIN_IMAGES_RECOMMENDED}+ photos get approved faster.
        </p>
        {needsBetterPhotos && (
          <p className="mt-2 text-xs font-semibold text-warning">
            Tip: add {MIN_IMAGES_RECOMMENDED - images.length} more photo(s) for stronger approval.
          </p>
        )}
      </div>

      <div className="rounded-card border border-border bg-surface p-4">
        <p className="text-sm font-semibold text-foreground">Recommended photos</p>
        <ul className="mt-3 space-y-2">
          {photoItems.map((item) => (
            <li key={item}>
              <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                  checked={Boolean(checkedPhotos[item])}
                  onChange={() => togglePhotoHint(item)}
                />
                {item}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Upload from camera or gallery</label>
        <div
          className="cursor-pointer rounded-card border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length > 0) uploadImages(e.dataTransfer.files);
          }}
        >
          <Upload size={28} className="mx-auto mb-2 text-primary" />
          <p className="text-sm font-medium text-foreground">Tap to add photos</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs text-text-secondary">
            <Camera size={14} /> Camera or gallery - PNG/JPG up to 5MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) uploadImages(files);
            }}
          />
        </div>
        {uploadError && <p className="mt-2 text-xs text-error">{uploadError}</p>}
        {errors.images?.message && <p className="mt-2 text-xs text-error">{errors.images.message}</p>}
        {images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {images.map((img, i) => (
              <div
                key={`${img}-${i}`}
                className="group relative h-20 w-20 overflow-hidden rounded-btn border border-border bg-surface"
              >
                <img src={img} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 rounded-pill bg-primary px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(i);
                  }}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                  aria-label={`Remove image ${i + 1}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <OwnerVisibilityPicker
        value={watchedVisibility || "FULL_VISIBILITY"}
        onChange={(v) => setValue("visibilityType", v, { shouldValidate: true })}
      />

      <CollapsibleSection title="Amenities (optional)" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          {suggestedAmenities.map((a) => (
            <label
              key={a}
              className={cn(
                "flex min-h-[44px] cursor-pointer items-center gap-2 rounded-btn border px-3 py-2 text-sm transition-colors",
                selectedAmenities.includes(a)
                  ? "border-primary bg-primary-light text-primary"
                  : "border-border text-text-secondary"
              )}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={selectedAmenities.includes(a)}
                onChange={() => toggleAmenity(a)}
              />
              {selectedAmenities.includes(a) && <Check size={14} />}
              {a}
            </label>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}
