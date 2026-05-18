"use client";

import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QUICK_FILTERS, TRUST_FILTERS } from "@/components/properties/search-options";

type PropertiesSearchHeroProps = {
  hasSearchIntent: boolean;
  shownTotal: number;
  freshCount: number;
  verifiedCount: number;
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
  return (
    <section className="border-b border-border bg-primary-light">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_300px] lg:items-end">
          <div className="text-center lg:text-left">
            <div className="mb-3 inline-flex items-center gap-2 rounded-pill border border-primary/20 bg-white px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
              <Sparkles size={14} />
              {hasSearchIntent ? "Filtered search" : "Live listings"}
            </div>
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
              {hasSearchIntent ? "Choose filters. See better matches." : "Browse live properties in Kolkata"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              {hasSearchIntent
                ? "Start with location, budget, or property type so you only see listings that match your intent."
                : "Explore verified listings now, then narrow by locality, budget, or property type when you are ready."}
            </p>
          </div>

          <div className={cn("grid grid-cols-3 gap-2", shownTotal === 0 && !hasSearchIntent && "hidden lg:grid")}>
            <div className="rounded-card border border-border bg-surface p-3">
              <p className="text-xs text-text-secondary">{hasSearchIntent ? "Results" : "Live"}</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{shownTotal}</p>
            </div>
            <div className="rounded-card border border-success/20 bg-success/10 p-3">
              <p className="text-xs text-text-secondary">Fresh</p>
              <p className="mt-1 text-xl font-semibold text-success">{freshCount}</p>
            </div>
            <div className="rounded-card border border-primary/20 bg-primary-light p-3">
              <p className="text-xs text-text-secondary">Verified</p>
              <p className="mt-1 text-xl font-semibold text-primary">{verifiedCount}</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-5 max-w-5xl rounded-card border border-primary/15 bg-white p-2 shadow-card">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex min-h-12 flex-1 items-center gap-3 rounded-btn border border-border bg-surface px-3 focus-within:border-primary">
              <Search size={20} className="shrink-0 text-primary" />
              <input
                type="text"
                placeholder="Search city, locality, project, office, flat..."
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSearch();
                }}
                className="w-full bg-transparent text-sm outline-none placeholder:text-text-secondary"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={onSearch} className="flex-1 lg:flex-none">
                Search
              </Button>
              <Button onClick={onToggleFilters} variant="ghost" className="lg:hidden">
                <SlidersHorizontal size={16} className="mr-2" />
                Filters
              </Button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2 border-t border-border pt-2">
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
                    "inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-surface text-text-secondary hover:border-primary/40 hover:text-primary"
                  )}
                >
                  <Icon size={13} />
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {QUICK_FILTERS.map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={() => onQuickFilter(filter.action)}
                className={cn(
                  "rounded-pill border px-3 py-1.5 text-xs font-medium transition-colors",
                  "border-border bg-white text-text-secondary hover:border-primary/40 hover:text-primary"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
