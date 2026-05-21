"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LocationSearchInput } from "@/components/search/location-search-input";
import { INDIAN_STATES } from "@/lib/constants";
import { LOCATION_PRIVACY_NOTE } from "@/lib/location/display";
import type { LocationSuggestion } from "@/lib/location/types";
import { SEARCH_CITY_OPTIONS } from "@/lib/search-location";
import type { PostPropertyStepProps } from "@/features/post-property/types/wizard-step-props";

export function LocationStep({
  register,
  errors,
  watchedCity,
  setValue,
}: PostPropertyStepProps) {
  const [locationQuery, setLocationQuery] = useState("");

  const applySuggestion = (s: LocationSuggestion | null) => {
    if (!s) return;
    if (s.locality) setValue("locality", s.locality, { shouldValidate: true });
    if (s.subLocality) setValue("subLocality", s.subLocality, { shouldValidate: true });
    if (s.projectOrSociety) setValue("projectOrSociety", s.projectOrSociety, { shouldValidate: true });
    if (s.landmark) setValue("landmark", s.landmark, { shouldValidate: true });
    setLocationQuery(s.label);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Buyers see locality and landmark only. KrrishJazz coordinates visits privately.
      </p>

      <Select
        label="City"
        options={SEARCH_CITY_OPTIONS.map((c) => ({ value: c, label: c }))}
        error={errors.city?.message}
        {...register("city")}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Search locality, project, or landmark
        </label>
        <LocationSearchInput
          value={locationQuery}
          city={watchedCity || "Kolkata"}
          onChange={setLocationQuery}
          onSelectSuggestion={applySuggestion}
          placeholder="Type to search - locality, project/society, landmark"
        />
        <p className="mt-1 text-xs text-text-secondary">Suggestions are grouped by type in the dropdown.</p>
      </div>

      <Input
        label="Locality"
        placeholder="e.g. Salt Lake, New Town"
        error={errors.locality?.message}
        {...register("locality")}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Project / Society"
          placeholder="e.g. South City, Merlin X"
          error={errors.projectOrSociety?.message}
          {...register("projectOrSociety")}
        />
        <Input
          label="Landmark"
          placeholder="e.g. Near City Centre"
          error={errors.landmark?.message}
          {...register("landmark")}
        />
      </div>

      <Input
        label="Sub-locality (optional)"
        placeholder="e.g. Sector V"
        error={errors.subLocality?.message}
        {...register("subLocality")}
      />

      <div>
        <Textarea
          label="Full address (private)"
          placeholder="House no., street, building - never shown publicly"
          error={errors.address?.message}
          {...register("address")}
        />
        <p className="mt-1.5 text-xs leading-5 text-text-secondary">{LOCATION_PRIVACY_NOTE}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="State"
          options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
          error={errors.state?.message}
          {...register("state")}
        />
        <Input label="Pincode" placeholder="700064" error={errors.pincode?.message} {...register("pincode")} />
      </div>
    </div>
  );
}
