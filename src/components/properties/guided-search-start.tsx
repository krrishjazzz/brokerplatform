"use client";

import { Building2, Home, MapPin, SlidersHorizontal, Store } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuidedSearchStartProps {
  needsMoreFilters: boolean;
  onPick: (next: { category?: string; propertyType?: string; listingType?: string; query?: string }) => void;
}

export function GuidedSearchStart({ needsMoreFilters, onPick }: GuidedSearchStartProps) {
  const starters = [
    { title: "Buy a home", desc: "Flats, villas, independent houses", icon: Home, tone: "bg-primary-light text-primary", next: { category: "RESIDENTIAL", listingType: "BUY" } },
    { title: "Rent a home", desc: "Ready-to-move rental homes", icon: Building2, tone: "bg-accent-light text-accent", next: { category: "RESIDENTIAL", listingType: "RENT" } },
    { title: "Commercial space", desc: "Offices, shops, showrooms", icon: Store, tone: "bg-success-light text-success", next: { category: "COMMERCIAL", propertyType: "Office Space" } },
    { title: "Plots and land", desc: "Investment land and plots", icon: MapPin, tone: "bg-warning-light text-[#9A5B00]", next: { propertyType: "Residential Plot" } },
  ];

  const localities = ["New Town", "Salt Lake", "Rajarhat", "Park Street", "Ballygunge", "Howrah"];

  return (
    <div className="rounded-card border border-border bg-white p-5 shadow-card">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
          <SlidersHorizontal size={22} />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-foreground">{needsMoreFilters ? "Add one more filter" : "Start with a filter"}</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-text-secondary">
          {needsMoreFilters
            ? "Buy, Rent, or Commercial alone is too broad. Add locality, budget, BHK, or property type so the results stay useful."
            : "We will show properties after you choose a need, location, budget, or search term. This keeps the page easy instead of overwhelming."}
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {starters.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => onPick(item.next)}
            className="group rounded-card border border-border bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:shadow-card"
          >
            <div className={cn("mb-4 flex h-11 w-11 items-center justify-center rounded-btn", item.tone)}>
              <item.icon size={21} />
            </div>
            <p className="font-semibold text-foreground group-hover:text-primary">{item.title}</p>
            <p className="mt-1 text-sm text-text-secondary">{item.desc}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 border-t border-border pt-4">
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
