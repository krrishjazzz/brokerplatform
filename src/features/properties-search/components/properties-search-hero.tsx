"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { IntentSearchPanel } from "@/components/search/intent-search-panel";
import { getBrowseIntentLabel, RESULT_QUICK_FILTERS } from "@/components/properties/search-options";
import { PropertiesTrustBanner } from "@/features/properties-search/components/properties-trust-banner";
import { useAuth } from "@/lib/auth-context";
import { profileCanList } from "@/lib/capabilities";
import { getAppHomeHref } from "@/lib/dashboard-paths";
import { cn } from "@/lib/utils";

type PropertiesSearchHeroProps = {
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

export function PropertiesSearchHero({
  listingType,
  category,
  preset,
  city,
  onSearchNavigate,
  onToggleFilters,
  freshOnly,
  readyToVisitOnly,
  onQuickFilter,
}: PropertiesSearchHeroProps) {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const canList = user ? profileCanList(user) : false;
  const homeHref = getAppHomeHref(canList);
  const homeLabel = canList ? "Dashboard" : "Home";
  const displayCity = city.trim() || "Kolkata";
  const intentLabel = getBrowseIntentLabel(listingType, category, preset);

  return (
    <>
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 lg:px-6 lg:py-5">
          <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs font-medium text-text-secondary">
            <Link href={homeHref} className="hover:text-primary">
              {homeLabel}
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

      <div className="sticky top-16 z-30 border-b border-border bg-white/95 shadow-[0_4px_20px_rgba(0,31,77,0.06)] backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-3 lg:px-6">
          <IntentSearchPanel
            variant="embedded"
            initialParams={searchParams}
            onSearch={onSearchNavigate}
          />
          <div className="mt-2 flex flex-wrap gap-2">
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
            <button
              type="button"
              onClick={onToggleFilters}
              className="rounded-full border border-dashed border-border bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-primary lg:hidden"
            >
              More filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
