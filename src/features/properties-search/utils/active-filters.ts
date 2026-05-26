import { formatPrice } from "@/lib/utils";
import { getPropertyTypeChips } from "@/lib/property-type-filter-labels";
import {
  CONSTRUCTION_STATUS_OPTIONS,
  getPresetMenuLabel,
  POSSESSION_OPTIONS,
  AVAILABLE_FROM_OPTIONS,
  type SearchPresetId,
} from "@/lib/search-intent-config";

export type ActiveFilterChip = {
  label: string;
  clear: () => void;
};

type FilterState = {
  preset?: SearchPresetId;
  propertyType: string;
  propertyTypes: string[];
  propertyTypeOptionIds: string[];
  locality: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  furnishing: string;
  freshOnly: boolean;
  readyToVisitOnly: boolean;
  constructionStatus: string;
  possession: string;
  availableFrom: string;
};

type FilterSetters = {
  setPropertyType: (v: string) => void;
  setPropertyTypes: (v: string[]) => void;
  setPropertyTypeOptionIds: (v: string[]) => void;
  setLocality: (v: string) => void;
  setCity: (v: string) => void;
  setMinPrice: (v: string) => void;
  setMaxPrice: (v: string) => void;
  setBedrooms: (v: string) => void;
  setFurnishing: (v: string) => void;
  setFreshOnly: (v: boolean) => void;
  setReadyToVisitOnly: (v: boolean) => void;
  setConstructionStatus: (v: string) => void;
  setPossession: (v: string) => void;
  setAvailableFrom: (v: string) => void;
};

type BuildActiveFiltersOptions = {
  onClearPreset?: () => void;
};

function labelForValue(
  options: { label: string; value: string }[],
  value: string
): string {
  return options.find((o) => o.value === value)?.label ?? value.replaceAll("_", " ");
}

export function buildActiveFilters(
  filters: FilterState,
  setters: FilterSetters,
  options?: BuildActiveFiltersOptions
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  if (filters.preset && options?.onClearPreset) {
    chips.push({
      label: getPresetMenuLabel(filters.preset),
      clear: options.onClearPreset,
    });
  }

  if (filters.preset) {
    const typeChips = getPropertyTypeChips(
      filters.preset,
      filters.propertyTypes,
      filters.propertyTypeOptionIds
    );
    for (const chip of typeChips) {
      chips.push({
        label: chip.label,
        clear: () => {
          if (chip.optionId) {
            setters.setPropertyTypeOptionIds(
              filters.propertyTypeOptionIds.filter((id) => id !== chip.optionId)
            );
          }
          setters.setPropertyTypes(
            filters.propertyTypes.filter((t) => !chip.apiTypes.includes(t))
          );
          if (chip.apiTypes.includes(filters.propertyType)) {
            setters.setPropertyType("");
          }
        },
      });
    }
  }

  if (filters.bedrooms) {
    chips.push({
      label: `${filters.bedrooms} BHK`,
      clear: () => setters.setBedrooms(""),
    });
  }

  if (filters.minPrice || filters.maxPrice) {
    const min = filters.minPrice ? formatPrice(Number(filters.minPrice)) : "";
    const max = filters.maxPrice ? formatPrice(Number(filters.maxPrice)) : "";
    const label =
      min && max ? `${min} - ${max}` : min ? `From ${min}` : `Up to ${max}`;
    chips.push({
      label,
      clear: () => {
        setters.setMinPrice("");
        setters.setMaxPrice("");
      },
    });
  }

  if (filters.furnishing) {
    chips.push({ label: filters.furnishing, clear: () => setters.setFurnishing("") });
  }
  if (filters.locality) {
    chips.push({ label: filters.locality, clear: () => setters.setLocality("") });
  }
  if (filters.city && filters.city !== "Kolkata") {
    chips.push({ label: filters.city, clear: () => setters.setCity("") });
  }
  if (filters.constructionStatus) {
    chips.push({
      label: labelForValue(CONSTRUCTION_STATUS_OPTIONS, filters.constructionStatus),
      clear: () => setters.setConstructionStatus(""),
    });
  }
  if (filters.possession) {
    chips.push({
      label: labelForValue(POSSESSION_OPTIONS, filters.possession),
      clear: () => setters.setPossession(""),
    });
  }
  if (filters.availableFrom) {
    chips.push({
      label: labelForValue(AVAILABLE_FROM_OPTIONS, filters.availableFrom),
      clear: () => setters.setAvailableFrom(""),
    });
  }

  return chips;
}
