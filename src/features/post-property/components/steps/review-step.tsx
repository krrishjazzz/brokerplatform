"use client";

import { AlertTriangle, Check, MapPin, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatIntentAwarePrice } from "@/lib/posting-field-sync";
import { getIntentLabel, type ListingIntent } from "@/lib/posting-config";
import { getSmartSpecs } from "@/components/properties/property-display";
import { getTypeDetailsReviewLines } from "@/lib/posting-validation";
import type { PostPropertyStepProps } from "@/features/post-property/types/wizard-step-props";

export function ReviewStep({
  register,
  errors,
  watchedTitle,
  watchedPrice,
  watchedArea,
  watchedCity,
  watchedLocality,
  selectedPropertyType,
  selectedListingIntent,
  images,
  reviewChecklist,
  termsAccepted,
  setTermsAccepted,
  typeSpecificDetails,
  onTitleManualEdit,
}: PostPropertyStepProps) {
  const intent = selectedListingIntent as ListingIntent | undefined;
  const cover = images[0];
  const locationLine = [watchedLocality, watchedCity].filter(Boolean).join(", ") || "Location pending";

  const previewProperty = {
    propertyType: selectedPropertyType || "Property",
    price: Number(watchedPrice) || 0,
    area: Number(watchedArea) || 0,
    areaUnit: "sqft",
    bedrooms: null as number | null,
    bathrooms: null as number | null,
    floor: null as number | null,
    totalFloors: null as number | null,
    furnishing: typeSpecificDetails.fitOut || null,
    amenities: [] as string[],
    updatedAt: new Date().toISOString(),
  };
  const specs = getSmartSpecs(previewProperty as Parameters<typeof getSmartSpecs>[0]).slice(0, 3);
  const typeDetailLines = selectedPropertyType
    ? getTypeDetailsReviewLines(selectedPropertyType, typeSpecificDetails)
    : [];

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-foreground">This is how your listing will appear</p>

      <article className="overflow-hidden rounded-card border border-border bg-white shadow-card">
        <div className="relative h-44 bg-surface">
          {cover ? (
            <img src={cover} alt="Listing cover" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-text-secondary">No cover photo yet</div>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <Badge variant="warning">
              <Shield size={11} className="mr-1" />
              KrrishJazz review pending
            </Badge>
            {intent && <Badge variant="blue">{getIntentLabel(intent)}</Badge>}
          </div>
        </div>
        <div className="p-4">
          <p className="text-2xl font-bold text-primary">
            {watchedPrice
              ? formatIntentAwarePrice(Number(watchedPrice), intent)
              : "Price pending"}
          </p>
          <p className="mt-2 text-base font-semibold text-foreground">
            {watchedTitle || "Title will appear here"}
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm text-text-secondary">
            <MapPin size={14} />
            {locationLine}
          </p>
          {specs.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {specs.map((s) => (
                <span
                  key={s.label}
                  className="rounded-pill border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  {s.value}
                </span>
              ))}
            </div>
          )}
          {typeDetailLines.length > 0 && (
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              {typeDetailLines.slice(0, 4).map((row) => (
                <div key={row.label}>
                  <dt className="text-[11px] text-text-secondary">{row.label}</dt>
                  <dd className="text-sm font-semibold text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </article>

      <div className="space-y-3 rounded-card border border-border bg-surface p-4">
        <p className="text-sm font-semibold text-foreground">Edit listing title & description</p>
        <p className="text-xs text-text-secondary">We drafted these from your selections. Adjust if you like.</p>
        <Input
          label="Title"
          error={errors.title?.message}
          {...register("title", {
            onChange: () => onTitleManualEdit?.(),
          })}
        />
        <Textarea
          label="Description"
          error={errors.description?.message}
          {...register("description")}
        />
      </div>

      <div className="rounded-card border border-border bg-white p-4 shadow-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Before you submit</p>
            <p className="mt-1 text-xs text-text-secondary">KrrishJazz verifies details - usually within 1 business day.</p>
          </div>
          <Badge variant={reviewChecklist.every((item) => item.complete) ? "success" : "warning"}>
            {reviewChecklist.filter((item) => item.complete).length}/{reviewChecklist.length} ready
          </Badge>
        </div>

        <div className="mt-4 grid gap-2">
          {reviewChecklist
            .filter((item) => item.label !== "Listing reach selected")
            .map((item) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-start gap-3 rounded-btn border px-3 py-2.5",
                  item.complete ? "border-success/20 bg-success-light/50" : "border-warning/20 bg-warning-light/40"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                    item.complete ? "bg-success text-white" : "bg-warning text-white"
                  )}
                >
                  {item.complete ? <Check size={13} /> : <AlertTriangle size={12} />}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-text-secondary">{item.detail}</p>
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
            <span className="block text-sm font-semibold text-foreground">Free listing - brokerage only on closure</span>
            <span className="mt-1 block text-xs leading-5 text-text-secondary">
              KrrishJazz verifies and coordinates enquiries. One month brokerage applies only after a successful deal.
            </span>
          </span>
        </label>
      </div>
    </div>
  );
}
