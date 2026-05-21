"use client";

import { BookmarkPlus, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

type PropertiesMobileActionBarProps = {
  activeFilterCount: number;
  sort: string;
  onSortChange: (value: string) => void;
  onPageReset: () => void;
  onToggleFilters: () => void;
  onSaveSearch: () => void;
};

export function PropertiesMobileActionBar({
  activeFilterCount,
  sort,
  onSortChange,
  onPageReset,
  onToggleFilters,
  onSaveSearch,
}: PropertiesMobileActionBarProps) {
  return (
    <div className="fixed inset-x-3 bottom-3 z-30 rounded-card border border-border bg-white p-2 shadow-modal lg:hidden">
      <div className="grid grid-cols-3 gap-2">
        <select
          value={sort}
          onChange={(e) => {
            onSortChange(e.target.value);
            onPageReset();
          }}
          className="min-h-10 rounded-btn border border-border bg-white px-2 text-xs font-semibold text-foreground outline-none focus:border-primary"
          aria-label="Sort properties"
        >
          <option value="">Sort</option>
          <option value="price_asc">Low price</option>
          <option value="price_desc">High price</option>
        </select>
        <Button onClick={onToggleFilters} variant="outline" className="w-full">
          <SlidersHorizontal size={16} className="mr-1.5" />
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </Button>
        <Button onClick={onSaveSearch} variant="accent" className="w-full gap-1">
          <BookmarkPlus size={16} />
          Save
        </Button>
      </div>
    </div>
  );
}
