"use client";

/* eslint-disable @typescript-eslint/no-unused-vars -- shared wizard prop bag */
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { INDIAN_STATES } from "@/lib/constants";
import type { PostPropertyStepProps } from "@/features/post-property/types/wizard-step-props";

export function LocationStep({
  register,
  errors,
  setValue,
  watchedCity,
  selectedPropertyType,
}: PostPropertyStepProps) {
return (
<div className="space-y-4">
              <Textarea label="Address" placeholder="Full address..." error={errors.address?.message} {...register("address")} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input label="Locality" placeholder="e.g. Salt Lake, Park Street" error={errors.locality?.message} {...register("locality")} />
                <Input label="City" placeholder="e.g. Kolkata" error={errors.city?.message} {...register("city")} />
                <Select
                  label="State"
                  options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
                  error={errors.state?.message}
                  {...register("state")}
                />
                <Input label="Pincode" placeholder="400001" error={errors.pincode?.message} {...register("pincode")} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Latitude (optional)" type="number" step="any" placeholder="19.076" {...register("lat")} />
                <Input label="Longitude (optional)" type="number" step="any" placeholder="72.877" {...register("lng")} />
              </div>
            </div>
  );
}
