"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { PropertySearchShell } from "@/components/search/property-search-shell";
import { getBrowseIntentLabel, RESULT_QUICK_FILTERS } from "@/components/properties/search-options";
import { PropertiesTrustBanner } from "@/features/properties-search/components/properties-trust-banner";
import { useAuth } from "@/lib/auth-context";
import { profileCanList } from "@/lib/capabilities";
import { OWNER_DASHBOARD_PATH } from "@/lib/dashboard-paths";
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
  /** When SearchWorkspaceHeader is shown, skip the duplicate inline search row. */
  hideInlineSearch?: boolean;
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
  hideInlineSearch = false,
}: PropertiesSearchChromeProps) {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const canList = user ? profileCanList(user) : false;
  const homeHref = canList ? OWNER_DASHBOARD_PATH : "/";
  const homeLabel = canList ? "Owner Dashboard" : "Home";
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

      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 lg:px-6">
          {!hideInlineSearch && (
            <PropertySearchShell
              initialParams={searchParams}
              onSearch={onSearchNavigate}
              freshOnly={freshOnly}
              readyToVisitOnly={readyToVisitOnly}
              onToggleMobileFilters={onToggleFilters}
            />
          )}
          <div className={cn("flex flex-wrap gap-2", !hideInlineSearch && "mt-3")}>
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
