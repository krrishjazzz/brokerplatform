"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SEARCH_CITY_OPTIONS } from "@/lib/search-location";
import {
  getBrowseIntentLabel,
  QUICK_FILTERS,
  TRUST_FILTERS,
} from "@/components/properties/search-options";

type PropertiesSearchHeroProps = {
  hasSearchIntent: boolean;
  shownTotal: number;
  freshCount: number;
  verifiedCount: number;
  listingType: string;
  category: string;
  city: string;
  setCity: (value: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onToggleFilters: () => void;
  freshOnly: boolean;
  verifiedOnly: boolean;
  readyToVisitOnly: boolean;
  ownerListedOnly: boolean;
  budgetMatchOnly: boolean;
  onQuickFilter: (action: string) => void;
};

export function PropertiesSearchHero({
  hasSearchIntent,
  shownTotal,
  freshCount,
  verifiedCount,
  listingType,
  category,
  city,
  setCity,
  query,
  onQueryChange,
  onSearch,
  onToggleFilters,
  freshOnly,
  verifiedOnly,
  readyToVisitOnly,
  ownerListedOnly,
  budgetMatchOnly,
  onQuickFilter,
}: PropertiesSearchHeroProps) {
  const cityRef = useRef<HTMLDivElement>(null);
  const [cityOpen, setCityOpen] = useState(false);
  const displayCity = city.trim() || "Kolkata";
  const intentLabel = getBrowseIntentLabel(listingType, category);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setCityOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (!city.trim()) setCity(displayCity);
    onSearch();
  };

  return (
    <section className="border-b border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs font-medium text-text-secondary">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight size={12} className="text-text-tertiary" />
          <span className="text-primary">{intentLabel}</span>
          <ChevronRight size={12} className="text-text-tertiary" />
          <span className="text-foreground">{displayCity}</span>
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2rem]">
              Browse live properties in {displayCity}
            </h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary sm:text-base">
              Find verified properties with managed support and a seamless experience.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:min-w-[320px]">
            <StatCard icon={Target} label="Live Listings" value={shownTotal} />
            <StatCard icon={Sparkles} label="Fresh Listings" value={freshCount} tone="success" />
            <StatCard icon={ShieldCheck} label="Verified Listings" value={verifiedCount} tone="primary" />
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-[0_8px_30px_rgba(0,31,77,0.08)]">
          <div className="flex flex-col md:flex-row">
            <div
              ref={cityRef}
              className="relative border-b border-border md:min-w-[11.5rem] md:max-w-[14rem] md:shrink-0 md:border-b-0 md:border-r"
            >
              <button
                type="button"
                onClick={() => setCityOpen((open) => !open)}
                className="flex h-full w-full items-center gap-2 px-4 py-3.5 text-left text-sm font-semibold text-foreground hover:bg-surface"
              >
                <MapPin size={17} className="shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate">{displayCity}</span>
                <ChevronDown
                  size={14}
                  className={cn("shrink-0 text-text-tertiary transition-transform", cityOpen && "rotate-180")}
                />
              </button>
              {cityOpen && (
                <div className="absolute left-0 top-full z-50 max-h-48 min-w-full overflow-y-auto border border-border bg-white py-1 shadow-card md:min-w-[14rem]">
                  {SEARCH_CITY_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setCity(option);
                        setCityOpen(false);
                      }}
                      className={cn(
                        "block w-full px-4 py-2.5 text-left text-sm font-medium",
                        displayCity === option ? "bg-primary-light text-primary" : "hover:bg-surface"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-2.5 border-b border-border px-4 py-3 md:border-b-0 md:border-r md:py-3.5">
              <Search size={18} className="shrink-0 text-primary" />
              <input
                type="text"
                placeholder="Search locality, project, landmark..."
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-text-secondary sm:text-[15px]"
                aria-label="Search locality, project, or landmark"
              />
            </div>

            <div className="flex gap-2 p-2 md:p-0">
              <Button onClick={handleSearch} className="h-full flex-1 gap-2 md:min-w-[7.5rem] md:flex-none md:rounded-none">
                <Search size={17} strokeWidth={2.5} />
                Search
              </Button>
              <Button onClick={onToggleFilters} variant="outline" className="lg:hidden">
                <SlidersHorizontal size={16} />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border bg-surface/50 px-3 py-3">
            {TRUST_FILTERS.map((filter) => {
              const Icon = filter.icon;
              const active =
                (filter.action === "fresh" && freshOnly) ||
                (filter.action === "verified" && verifiedOnly) ||
                (filter.action === "ready" && readyToVisitOnly) ||
                (filter.action === "owner" && ownerListedOnly) ||
                (filter.action === "budget" && budgetMatchOnly);
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
            {QUICK_FILTERS.map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={() => onQuickFilter(filter.action)}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:border-primary/35 hover:text-primary"
              >
                {filter.label}
              </button>
            ))}
            <button
              type="button"
              onClick={onToggleFilters}
              className="rounded-full border border-dashed border-border bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary hover:border-primary/35 hover:text-primary lg:hidden"
            >
              More
            </button>
          </div>
        </div>

        {hasSearchIntent && (
          <p className="mt-3 text-xs text-text-secondary">
            Filters applied — refine using the sidebar or quick pills above.
          </p>
        )}
      </div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: typeof Target;
  label: string;
  value: number;
  tone?: "neutral" | "success" | "primary";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5 sm:px-4 sm:py-3",
        tone === "success" && "border-success/25 bg-success/5",
        tone === "primary" && "border-primary/20 bg-primary-light/50",
        tone === "neutral" && "border-border bg-surface"
      )}
    >
      <div className="flex items-center gap-1.5">
        <Icon
          size={14}
          className={cn(
            tone === "success" && "text-success",
            tone === "primary" && "text-primary",
            tone === "neutral" && "text-text-secondary"
          )}
        />
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary sm:text-[11px]">
          {label}
        </p>
      </div>
      <p
        className={cn(
          "mt-1 text-xl font-bold sm:text-2xl",
          tone === "success" && "text-success",
          tone === "primary" && "text-primary",
          tone === "neutral" && "text-foreground"
        )}
      >
        {value}
      </p>
    </div>
  );
}
