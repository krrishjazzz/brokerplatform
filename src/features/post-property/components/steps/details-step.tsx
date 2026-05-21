"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AREA_UNITS, FURNISHING_OPTIONS } from "@/lib/constants";
import {
  getPriceFieldsForIntent,
  shouldShowFurnishingField,
  shouldShowResidentialCore,
  type ListingIntent,
} from "@/lib/posting-config";
import { CollapsibleSection } from "@/features/post-property/components/collapsible-section";
import { DynamicTypeFields } from "@/features/post-property/components/dynamic-type-fields";
import type { PostPropertyStepProps } from "@/features/post-property/types/wizard-step-props";

export function DetailsStep({
  register,
  errors,
  selectedPropertyType,
  selectedListingIntent,
  category,
  shouldShowRooms,
  shouldShowFurnishing,
  typeSpecificDetails,
  setTypeSpecificDetail,
}: PostPropertyStepProps) {
  const intent = (selectedListingIntent as ListingIntent) || "SELL";
  const priceConfig = getPriceFieldsForIntent(intent);
  const showCore =
    selectedPropertyType &&
    category &&
    shouldShowResidentialCore(selectedPropertyType, category);
  const showFurnishing =
    selectedPropertyType &&
    category &&
    shouldShowFurnishingField(selectedPropertyType, category);

  return (
    <div className="space-y-3">
      <p className="text-sm text-text-secondary">
        Add essentials only. More optional fields are tucked under Advanced.
      </p>

      <CollapsibleSection title="Price" subtitle={priceConfig.primaryLabel} defaultOpen>
        <div className="grid grid-cols-1 gap-4">
          <Input
            label={priceConfig.primaryLabel}
            type="number"
            placeholder="e.g. 5000000"
            error={errors.price?.message}
            {...register("price")}
          />
          {priceConfig.showDeposit && (
            <Input
              label={priceConfig.depositLabel || "Deposit (Rs)"}
              type="number"
              placeholder="Optional"
              value={typeSpecificDetails.deposit ?? ""}
              onChange={(e) => setTypeSpecificDetail("deposit", e.target.value)}
            />
          )}
          {priceConfig.showCam && (
            <Input
              label="CAM / maintenance (Rs/month)"
              type="number"
              value={typeSpecificDetails.cam ?? ""}
              onChange={(e) => setTypeSpecificDetail("cam", e.target.value)}
            />
          )}
          {priceConfig.showLockIn && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Lock-in period"
                placeholder="e.g. 11 months"
                value={typeSpecificDetails.lockIn ?? ""}
                onChange={(e) => setTypeSpecificDetail("lockIn", e.target.value)}
              />
              <Input
                label="Notice period"
                placeholder="e.g. 1 month"
                value={typeSpecificDetails.noticePeriod ?? ""}
                onChange={(e) => setTypeSpecificDetail("noticePeriod", e.target.value)}
              />
            </div>
          )}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input type="checkbox" className="rounded border-border" {...register("priceNegotiable")} />
            Price negotiable
          </label>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Area & size" subtitle="Used on search cards" defaultOpen>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Area"
            type="number"
            placeholder="e.g. 1200"
            error={errors.area?.message}
            {...register("area")}
          />
          <Select
            label="Unit"
            options={AREA_UNITS.map((unit) => ({ value: unit, label: unit.toUpperCase() }))}
            {...register("areaUnit")}
          />
        </div>
      </CollapsibleSection>

      {(showCore || shouldShowRooms) && (
        <CollapsibleSection title="Room details" defaultOpen>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Bedrooms" type="number" placeholder="0" {...register("bedrooms")} />
            <Input label="Bathrooms" type="number" placeholder="0" {...register("bathrooms")} />
          </div>
        </CollapsibleSection>
      )}

      {(showCore || showFurnishing || shouldShowFurnishing) && (
        <CollapsibleSection title="Building details" defaultOpen={false}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {showCore && (
              <>
                <Input label="Floor" type="number" placeholder="0" {...register("floor")} />
                <Input label="Total floors" type="number" placeholder="0" {...register("totalFloors")} />
              </>
            )}
            <Input label="Age (years)" type="number" placeholder="Optional" {...register("ageYears")} />
            {(showFurnishing || shouldShowFurnishing) && (
              <Select
                label={category === "COMMERCIAL" ? "Fit-out / furnishing" : "Furnishing"}
                options={[{ value: "", label: "Select" }, ...FURNISHING_OPTIONS.map((f) => ({ value: f, label: f }))]}
                {...register("furnishing")}
              />
            )}
          </div>
        </CollapsibleSection>
      )}

      {selectedPropertyType && (
        <DynamicTypeFields
          propertyType={selectedPropertyType}
          values={typeSpecificDetails}
          onChange={setTypeSpecificDetail}
        />
      )}
    </div>
  );
}
