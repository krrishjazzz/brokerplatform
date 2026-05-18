"use client";

/* eslint-disable @typescript-eslint/no-unused-vars -- shared wizard prop bag */
import { AlertTriangle, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import { getVisibilityLabel } from "@/lib/visibility";
import type { PostPropertyStepProps } from "@/features/post-property/types/wizard-step-props";

export function ReviewStep({
  watchedTitle,
  watchedVisibility,
  watchedPrice,
  watchedArea,
  watchedCity,
  selectedPropertyType,
  selectedListingType,
  category,
  images,
  selectedAmenities,
  reviewChecklist,
  termsAccepted,
  setTermsAccepted,
}: PostPropertyStepProps) {
return (
<div className="space-y-4">
              <div className="rounded-card border border-primary/20 bg-primary-light p-4">
                <p className="text-sm font-semibold text-primary">Review before publishing</p>
                <p className="text-xs text-text-secondary mt-1">This is what brokers and customers will scan first. Your listing stays free; brokerage applies only when KrrishJazz helps close the deal.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-card border border-border bg-surface p-4">
                  <p className="text-xs text-text-secondary">Listing</p>
                  <p className="font-semibold text-foreground mt-1">{selectedListingType || "Not selected"} - {selectedPropertyType || "Property"}</p>
                  <p className="text-sm text-text-secondary mt-1">{watchedCity || "City pending"}</p>
                </div>
                <div className="rounded-card border border-border bg-surface p-4">
                  <p className="text-xs text-text-secondary">Price & Area</p>
                  <p className="font-semibold text-foreground mt-1">{watchedPrice ? formatPrice(Number(watchedPrice)) : "Price pending"}</p>
                  <p className="text-sm text-text-secondary mt-1">{watchedArea ? `${Number(watchedArea).toLocaleString()} sqft approx.` : "Area pending"}</p>
                </div>
                <div className="rounded-card border border-border bg-surface p-4">
                  <p className="text-xs text-text-secondary">Listing Reach</p>
                  <p className="font-semibold text-foreground mt-1">{getVisibilityLabel(watchedVisibility)}</p>
                  <p className="text-sm text-text-secondary mt-1">{selectedAmenities.length} amenit{selectedAmenities.length === 1 ? "y" : "ies"} selected</p>
                </div>
                <div className="rounded-card border border-border bg-surface p-4">
                  <p className="text-xs text-text-secondary">Photos</p>
                  <p className="font-semibold text-foreground mt-1">{images.length} uploaded</p>
                  <p className="text-sm text-text-secondary mt-1">First image will be used as cover.</p>
                </div>
              </div>
              {images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.slice(0, 6).map((image, index) => (
                    <img key={`${image}-${index}`} src={image} alt={`Review ${index + 1}`} className="h-20 w-24 rounded-card object-cover border border-border" />
                  ))}
                </div>
              )}

              <div className="rounded-card border border-border bg-white p-4 shadow-card">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Final listing checklist</p>
                    <p className="mt-1 text-xs leading-5 text-text-secondary">Complete these checks before sending the listing for KrrishJazz verification.</p>
                  </div>
                  <Badge variant={reviewChecklist.every((item) => item.complete) ? "success" : "warning"}>
                    {reviewChecklist.filter((item) => item.complete).length}/{reviewChecklist.length} ready
                  </Badge>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {reviewChecklist.map((item) => (
                    <div key={item.label} className={cn("flex items-start gap-3 rounded-btn border px-3 py-3", item.complete ? "border-success/20 bg-success-light" : "border-warning/20 bg-warning-light")}>
                      <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full", item.complete ? "bg-success text-white" : "bg-warning text-white")}>
                        {item.complete ? <Check size={13} /> : <AlertTriangle size={12} />}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.label}</p>
                        <p className="mt-0.5 text-xs leading-5 text-text-secondary">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-card border border-primary/20 bg-primary-light p-4">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-primary text-primary"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">I understand KrrishJazz listing terms</span>
                    <span className="mt-1 block text-xs leading-5 text-text-secondary">
                      Posting is free. KrrishJazz will verify details and coordinate enquiries. One month brokerage applies only after successful deal closure.
                    </span>
                  </span>
                </label>
              </div>
            </div>
  );
}
