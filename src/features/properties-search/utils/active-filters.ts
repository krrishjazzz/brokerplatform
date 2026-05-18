import { formatPrice } from "@/lib/utils";

export type ActiveFilterChip = {
  label: string;
  clear: () => void;
};

type FilterState = {
  listingType: string;
  category: string;
  propertyType: string;
  locality: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  furnishing: string;
  freshOnly: boolean;
  verifiedOnly: boolean;
  readyToVisitOnly: boolean;
  ownerListedOnly: boolean;
  budgetMatchOnly: boolean;
  availability: string;
};

type FilterSetters = {
  setListingType: (v: string) => void;
  setCategory: (v: string) => void;
  setPropertyType: (v: string) => void;
  setLocality: (v: string) => void;
  setCity: (v: string) => void;
  setMinPrice: (v: string) => void;
  setMaxPrice: (v: string) => void;
  setBedrooms: (v: string) => void;
  setFurnishing: (v: string) => void;
  setFreshOnly: (v: boolean) => void;
  setVerifiedOnly: (v: boolean) => void;
  setReadyToVisitOnly: (v: boolean) => void;
  setOwnerListedOnly: (v: boolean) => void;
  setBudgetMatchOnly: (v: boolean) => void;
  setAvailability: (v: string) => void;
};

export function buildActiveFilters(
  filters: FilterState,
  setters: FilterSetters
): ActiveFilterChip[] {
  return [
    filters.listingType && { label: filters.listingType, clear: () => setters.setListingType("") },
    filters.category && {
      label: filters.category,
      clear: () => {
        setters.setCategory("");
        setters.setPropertyType("");
      },
    },
    filters.propertyType && { label: filters.propertyType, clear: () => setters.setPropertyType("") },
    filters.locality && { label: filters.locality, clear: () => setters.setLocality("") },
    filters.city && { label: filters.city, clear: () => setters.setCity("") },
    filters.minPrice && {
      label: `Min ${formatPrice(Number(filters.minPrice))}`,
      clear: () => setters.setMinPrice(""),
    },
    filters.maxPrice && {
      label: `Max ${formatPrice(Number(filters.maxPrice))}`,
      clear: () => setters.setMaxPrice(""),
    },
    filters.bedrooms && { label: `${filters.bedrooms} BHK`, clear: () => setters.setBedrooms("") },
    filters.furnishing && { label: filters.furnishing, clear: () => setters.setFurnishing("") },
    filters.freshOnly && { label: "Fresh", clear: () => setters.setFreshOnly(false) },
    filters.verifiedOnly && { label: "Verified", clear: () => setters.setVerifiedOnly(false) },
    filters.readyToVisitOnly && { label: "Ready to Visit", clear: () => setters.setReadyToVisitOnly(false) },
    filters.ownerListedOnly && { label: "Owner Listed", clear: () => setters.setOwnerListedOnly(false) },
    filters.budgetMatchOnly && { label: "Budget Match", clear: () => setters.setBudgetMatchOnly(false) },
    filters.availability && {
      label: filters.availability.replaceAll("_", " "),
      clear: () => setters.setAvailability(""),
    },
  ].filter(Boolean) as ActiveFilterChip[];
}
