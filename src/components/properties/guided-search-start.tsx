"use client";

import { Building2, Home, MapPin, SlidersHorizontal, Store } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuidedSearchStartProps {
  needsMoreFilters: boolean;
  variant?: "default" | "compact";
  onPick: (next: { category?: string; propertyType?: string; listingType?: string; query?: string }) => void;
}

export function GuidedSearchStart({ needsMoreFilters, variant = "default", onPick }: GuidedSearchStartProps) {
  const compact = variant === "compact";

  const starters = [
    { title: "Buy a home", desc: "Flats, villas, independent houses", icon: Home, tone: "bg-primary-light text-primary", next: { category: "RESIDENTIAL", listingType: "BUY" } },
    { title: "Rent a home", desc: "Ready-to-move rental homes", icon: Building2, tone: "bg-accent-light text-accent", next: { category: "RESIDENTIAL", listingType: "RENT" } },
    { title: "Commercial space", desc: "Offices, shops, showrooms", icon: Store, tone: "bg-success-light text-success", next: { category: "COMMERCIAL", propertyType: "Office Space" } },
    { title: "Plots and land", desc: "Investment land and plots", icon: MapPin, tone: "bg-warning-light text-[#9A5B00]", next: { propertyType: "Residential Plot" } },
  ];

  const localities = ["New Town", "Salt Lake", "Rajarhat", "Park Street", "Ballygunge", "Howrah"];

  return (
    <div className={cn("rounded-card border border-border bg-white shadow-card", compact ? "p-4" : "p-5")}>
      <div className={cn(compact ? "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" : "text-center")}>
        <div className={cn(compact ? "min-w-0" : "")}>
          {!compact && (
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
              <SlidersHorizontal size={22} />
            </div>
          )}
          <h3 className={cn("font-semibold text-foreground", compact ? "text-base" : "mt-4 text-xl")}>
            {needsMoreFilters ? "Add one more filter" : compact ? "Refine your search" : "Start with a filter"}
          </h3>
          <p className={cn("text-sm leading-6 text-text-secondary", compact ? "mt-1" : "mx-auto mt-2 max-w-xl")}>
            {needsMoreFilters
              ? "Buy, Rent, or Commercial alone is too broad. Add locality, budget, BHK, or property type to narrow these results."
              : compact
                ? "Live listings are below. Add location, budget, or property type for sharper matches."
                : "Browse live listings below, or add location, budget, and property type for sharper matches."}
          </p>
        </div>
      </div>

      <div className={cn("grid gap-3", compact ? "mt-4 sm:grid-cols-2 xl:grid-cols-4" : "mt-6 sm:grid-cols-2 xl:grid-cols-4")}>
        {starters.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => onPick(item.next)}
            className={cn(
              "group rounded-card border border-border bg-surface text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:shadow-card",
              compact ? "p-3" : "p-4"
            )}
          >
            <div className={cn("mb-3 flex items-center justify-center rounded-btn", item.tone, compact ? "h-9 w-9" : "mb-4 h-11 w-11")}>
              <item.icon size={compact ? 18 : 21} />
            </div>
            <p className={cn("font-semibold text-foreground group-hover:text-primary", compact && "text-sm")}>{item.title}</p>
            {!compact && <p className="mt-1 text-sm text-text-secondary">{item.desc}</p>}
          </button>
        ))}
      </div>

      <div className={cn("border-t border-border pt-4", compact ? "mt-4" : "mt-6")}>
        <p className="mb-3 text-xs font-semibold uppercase text-text-secondary">Popular localities</p>
        <div className="flex flex-wrap gap-2">
          {localities.map((locality) => (
            <button
              key={locality}
              type="button"
              onClick={() => onPick({ query: locality })}
              className="rounded-pill border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary-light hover:text-primary"
            >
              {locality}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
