"use client";

/* eslint-disable @typescript-eslint/no-unused-vars -- shared wizard prop bag */
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AREA_UNITS, FURNISHING_OPTIONS } from "@/lib/constants";
import type { PostPropertyStepProps } from "@/features/post-property/types/wizard-step-props";

export function DetailsStep({
  register,
  errors,
  selectedPropertyType,
  activeTypeGuide,
  isPlotDetail,
  isCommercialDetail,
  isIndustrialDetail,
  isHospitalityDetail,
  shouldShowRooms,
  shouldShowFurnishing,
  categoryNotes,
  setCategoryNotes,
}: PostPropertyStepProps) {
return (
<div className="space-y-4">
              {selectedPropertyType && (
                <div className="rounded-card border border-primary/20 bg-primary-light p-4">
                  <p className="text-sm font-semibold text-primary">{selectedPropertyType} details</p>
                  <p className="text-xs text-text-secondary mt-1">
                    {activeTypeGuide?.hint ||
                      (isPlotDetail
                        ? "Rooms and furnishing are skipped for plot/land inventory."
                        : isCommercialDetail
                        ? "Commercial cards will highlight area, fit-out, parking and power backup."
                        : isIndustrialDetail
                        ? "Industrial cards will highlight area, access, power and use case."
                        : isHospitalityDetail
                        ? "Hospitality cards will highlight capacity, services, security and stay terms."
                        : "Residential cards will highlight BHK, bathrooms, floor and furnishing.")}
                  </p>
                  {activeTypeGuide?.fields?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeTypeGuide.fields.map((field) => (
                        <span key={field} className="rounded-pill border border-primary/20 bg-white px-3 py-1 text-xs font-medium text-primary">
                          {field}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Price (₹)" type="number" placeholder="e.g. 5000000" error={errors.price?.message} {...register("price")} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Area" type="number" placeholder="e.g. 1200" error={errors.area?.message} {...register("area")} />
                  <Select
                    label="Unit"
                    options={AREA_UNITS.map((unit) => ({ value: unit, label: unit.toUpperCase() }))}
                    {...register("areaUnit")}
                  />
                </div>
              </div>
              {shouldShowRooms && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Input label="Bedrooms" type="number" placeholder="0" {...register("bedrooms")} />
                  <Input label="Bathrooms" type="number" placeholder="0" {...register("bathrooms")} />
                  <Input label="Floor" type="number" placeholder="0" {...register("floor")} />
                  <Input label="Total Floors" type="number" placeholder="0" {...register("totalFloors")} />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Age (years)" type="number" placeholder="0" {...register("ageYears")} />
                {shouldShowFurnishing && (
                  <Select
                    label={isCommercialDetail ? "Fit-out / Furnishing" : "Furnishing"}
                    options={FURNISHING_OPTIONS.map((f) => ({ value: f, label: f }))}
                    {...register("furnishing")}
                  />
                )}
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input type="checkbox" className="rounded border-border" {...register("priceNegotiable")} />
                Price Negotiable
              </label>
              <Textarea
                label={selectedPropertyType ? `${selectedPropertyType} specific details` : "Category-specific details"}
                placeholder={
                  isCommercialDetail
                    ? "Seats/cabins, frontage, floor, pantry, parking, power backup..."
                    : isIndustrialDetail
                    ? "Clear height, dock, truck access, power load, road width..."
                    : isPlotDetail
                    ? "Facing, road width, boundary, approvals, conversion status..."
                    : isHospitalityDetail
                    ? "Beds/rooms, sharing, food, rules, housekeeping, license..."
                    : "Maintenance, society, balcony, parking, lift, facing..."
                }
                value={categoryNotes}
                onChange={(event) => setCategoryNotes(event.target.value)}
              />
            </div>
  );
}
