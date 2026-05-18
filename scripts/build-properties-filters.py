from pathlib import Path

src = Path("src/app/properties/page.tsx").read_text(encoding="utf-8")

start = src.index("        <aside")
end = src.index("        </aside>", start) + len("        </aside>")

aside = src[start:end]

header = '''"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterChip, FilterGroup } from "@/components/properties/filter-primitives";
import { CATEGORY_OPTIONS, LISTING_TABS } from "@/components/properties/search-options";
import { FURNISHING_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PropertiesSearchFiltersState } from "@/features/properties-search/types/filters-state";

type PropertiesFiltersSidebarProps = PropertiesSearchFiltersState & {
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  availablePropertyTypes: string[];
  shownTotal: number;
  onApply: () => void;
};

export function PropertiesFiltersSidebar({
  filtersOpen,
  setFiltersOpen,
  listingType,
  setListingType,
  category,
  setCategory,
  propertyType,
  setPropertyType,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  bedrooms,
  setBedrooms,
  city,
  setCity,
  locality,
  setLocality,
  furnishing,
  setFurnishing,
  freshOnly,
  setFreshOnly,
  verifiedOnly,
  setVerifiedOnly,
  readyToVisitOnly,
  setReadyToVisitOnly,
  ownerListedOnly,
  setOwnerListedOnly,
  budgetMatchOnly,
  applyQuickFilter,
  setPage,
  clearFilters,
  availablePropertyTypes,
  shownTotal,
  onApply,
}: PropertiesFiltersSidebarProps) {
  return (
'''

footer = "\n  );\n}\n"

# Fix aside - remove className cn wrapper from page, keep inner content only
inner_start = aside.index(">") + 1
# find first > after aside tag
aside_open_end = aside.index(">", aside.index("<aside")) + 1
inner = aside[aside_open_end:].rsplit("</aside>", 1)[0]

out = header + aside + footer
Path("src/features/properties-search/components/properties-filters-sidebar.tsx").write_text(out, encoding="utf-8")
print("wrote filters", len(out))
