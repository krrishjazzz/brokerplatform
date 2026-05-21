"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { PropertySearchShell } from "@/components/search/property-search-shell";
import { getBrowseIntentLabel, RESULT_QUICK_FILTERS } from "@/components/properties/search-options";
import { PropertiesTrustBanner } from "@/features/properties-search/components/properties-trust-banner";
import { cn } from "@/lib/utils";

type PropertiesSearchChromeProps = {
  listingType: string;
  category: string;
  preset?: string;
  city: string;
  onSearchNavigate: (params: URLSearchParams) => void;
  onToggleFilters: () => void;
  freshOnly: boolean;
  readyToVisitOnly: boolean;
  onQuickFilter: (action: string) => void;
};

export function PropertiesSearchChrome({
  listingType,
  category,
  preset,
  city,
  onSearchNavigate,
  onToggleFilters,
  freshOnly,
  readyToVisitOnly,
  onQuickFilter,
}: PropertiesSearchChromeProps) {
  const searchParams = useSearchParams();
  const displayCity = city.trim() || "Kolkata";
  const intentLabel = getBrowseIntentLabel(listingType, category, preset);

  return (
    <>
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 lg:px-6 lg:py-5">
          <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs font-medium text-text-secondary">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <ChevronRight size={12} className="text-text-tertiary" />
            <span className="text-primary">{intentLabel}</span>
            <ChevronRight size={12} className="text-text-tertiary" />
            <span className="text-foreground">{displayCity}</span>
          </nav>

          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Properties in {displayCity}
          </h1>

          <div className="mt-3">
            <PropertiesTrustBanner />
          </div>
        </div>
      </section>

      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 lg:px-6">
          <PropertySearchShell
            initialParams={searchParams}
            onSearch={onSearchNavigate}
            freshOnly={freshOnly}
            readyToVisitOnly={readyToVisitOnly}
            onToggleMobileFilters={onToggleFilters}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {RESULT_QUICK_FILTERS.map((filter) => {
              const Icon = filter.icon;
              const active =
                (filter.action === "fresh" && freshOnly) ||
                (filter.action === "ready" && readyToVisitOnly);
              return (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => onQuickFilter(filter.action)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-text-secondary hover:border-primary/35 hover:text-primary"
                  )}
                >
                  <Icon size={13} />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
