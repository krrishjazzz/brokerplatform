"use client";

/* eslint-disable @typescript-eslint/no-unused-vars -- shared wizard prop bag */
import { Check, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostPropertyStepProps } from "@/features/post-property/types/wizard-step-props";

export function MediaStep(p: PostPropertyStepProps) {
  const {
    images,
    uploadError,
    uploadingImages,
    fileInputRef,
    uploadImages,
    removeImage,
    selectedAmenities,
    toggleAmenity,
    suggestedAmenities,
    errors,
  } = p;

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Property Images</label>
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
          <Upload size={32} className="mx-auto mb-2 text-text-secondary" />
          <p className="text-sm text-text-secondary">
            {uploadingImages ? "Uploading images..." : "Drag & drop images here or click to browse"}
          </p>
          <p className="mt-1 text-xs text-text-secondary">PNG, JPG up to 5MB each</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
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
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label={`Remove image ${i + 1}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-foreground">Amenities</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {suggestedAmenities.map((a) => (
            <label
              key={a}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-btn border px-3 py-2 text-sm transition-colors",
                selectedAmenities.includes(a)
                  ? "border-primary bg-primary-light text-primary"
                  : "border-border text-text-secondary hover:border-primary/30"
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
      </div>
    </div>
  );
}
