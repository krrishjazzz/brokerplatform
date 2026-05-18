"use client";

import { useState } from "react";
import Link from "next/link";
import { HorizontalCarousel } from "./horizontal-carousel";
import {
  BROWSE_BUY,
  BROWSE_COMMERCIAL,
  BROWSE_PLOTS,
  BROWSE_PROJECTS,
  BROWSE_RENT,
} from "./home-data";
import { cn } from "@/lib/utils";

const BROWSE_SEGMENTS = [
  { id: "buy", label: "Buy", items: BROWSE_BUY, viewAll: "/properties?listingType=BUY" },
  { id: "rent", label: "Rent", items: BROWSE_RENT, viewAll: "/properties?listingType=RENT" },
  { id: "commercial", label: "Commercial", items: BROWSE_COMMERCIAL, viewAll: "/properties?category=COMMERCIAL" },
  { id: "projects", label: "Projects", items: BROWSE_PROJECTS, viewAll: "/properties?listingType=BUY&q=project" },
  { id: "plots", label: "Plots / Land", items: BROWSE_PLOTS, viewAll: "/properties?propertyType=Residential%20Plot" },
] as const;

export function ConsolidatedBrowseSection() {
  const [activeId, setActiveId] = useState<(typeof BROWSE_SEGMENTS)[number]["id"]>("buy");
  const active = BROWSE_SEGMENTS.find((s) => s.id === activeId) ?? BROWSE_SEGMENTS[0];

  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Browse by property type</h2>
            <p className="mt-1 text-sm text-text-secondary">One place for residential, commercial, projects, and land.</p>
          </div>
          <Link href={active.viewAll} className="shrink-0 text-sm font-semibold text-primary hover:underline">
            View all {active.label.toLowerCase()} →
          </Link>
        </div>
        <div className="mt-4 flex gap-1 overflow-x-auto rounded-xl border border-border/80 bg-surface p-1 scrollbar-none">
          {BROWSE_SEGMENTS.map((segment) => (
            <button
              key={segment.id}
              type="button"
              onClick={() => setActiveId(segment.id)}
              className={cn(
                "shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                activeId === segment.id ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:bg-white hover:text-primary"
              )}
            >
              {segment.label}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <HorizontalCarousel items={active.items} variant="browse" />
        </div>
      </div>
    </section>
  );
}
