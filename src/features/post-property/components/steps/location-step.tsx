"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { INDIAN_STATES } from "@/lib/constants";
import { SEARCH_CITY_OPTIONS } from "@/lib/search-location";
import { LOCATION_PRIVACY_NOTE } from "@/lib/location/display";
import { allCanonicalLocalityNames } from "@/lib/location/dictionary";
import type { PostPropertyStepProps } from "@/features/post-property/types/wizard-step-props";

export function LocationStep({
  register,
  errors,
  watchedCity,
}: PostPropertyStepProps) {
  const localityOptions = [
    { value: "", label: "Select locality" },
    ...allCanonicalLocalityNames(watchedCity || "Kolkata").map((loc) => ({
      value: loc,
      label: loc,
    })),
  ];

  return (
    <div className="space-y-5">
      <p className="rounded-lg border border-primary/20 bg-primary-light/40 px-3 py-2 text-xs font-medium text-primary">
        {LOCATION_PRIVACY_NOTE}
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="City"
          options={SEARCH_CITY_OPTIONS.map((c) => ({ value: c, label: c }))}
          error={errors.city?.message}
          {...register("city")}
        />
        <Select
          label="Locality"
          options={localityOptions}
          error={errors.locality?.message}
          {...register("locality")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Sub-locality (optional)"
          placeholder="e.g. Sector V"
          error={errors.subLocality?.message}
          {...register("subLocality")}
        />
        <Input
          label="Project / Society name (optional)"
          placeholder="e.g. South City, Merlin X"
          error={errors.projectOrSociety?.message}
          {...register("projectOrSociety")}
        />
      </div>

      <Input
        label="Landmark (optional)"
        placeholder="e.g. Near City Centre"
        error={errors.landmark?.message}
        {...register("landmark")}
      />

      <Textarea
        label="Full address (private)"
        placeholder="House no., street, building - not shown publicly"
        error={errors.address?.message}
        {...register("address")}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Select
          label="State"
          options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
          error={errors.state?.message}
          {...register("state")}
        />
        <Input label="Pincode" placeholder="700064" error={errors.pincode?.message} {...register("pincode")} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Map latitude (optional)" type="number" step="any" placeholder="22.57" {...register("lat")} />
        <Input label="Map longitude (optional)" type="number" step="any" placeholder="88.43" {...register("lng")} />
      </div>
    </div>
  );
}
