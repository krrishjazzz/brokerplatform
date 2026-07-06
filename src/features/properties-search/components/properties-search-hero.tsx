"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { IntentSearchPanel } from "@/components/search/intent-search-panel";
import { getBrowseIntentLabel } from "@/components/properties/search-options";
import { PropertiesTrustBanner } from "@/features/properties-search/components/properties-trust-banner";
import { useAuth } from "@/lib/auth-context";
import { getAppHomeHref } from "@/lib/dashboard-paths";

type PropertiesSearchHeroProps = {
  listingType: string;
  category: string;
  preset?: string;
  city: string;
  onSearchNavigate: (params: URLSearchParams) => void;
  onToggleFilters: () => void;
};

export function PropertiesSearchHero({
  listingType,
  category,
  preset,
  city,
  onSearchNavigate,
  onToggleFilters,
}: PropertiesSearchHeroProps) {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const homeHref = getAppHomeHref(user);
  const homeLabel = user ? "Search" : "Home";
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
          <div className="mt-2 flex flex-wrap gap-2 lg:hidden">
            <button
              type="button"
              onClick={onToggleFilters}
              className="rounded-full border border-dashed border-border bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-primary"
            >
              More filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
