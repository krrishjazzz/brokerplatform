"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, ChevronDown, Home, Key, MapPin, Search, SlidersHorizontal } from "lucide-react";
import {
  BHK_OPTIONS,
  BUDGET_OPTIONS_BY_INTENT,
  buildSearchParams,
  FURNISHING_OPTIONS,
  INTENT_PROPERTY_TYPES,
  SEARCH_INTENT_TABS,
  type SearchIntentId,
} from "@/lib/search-intent-config";
import { SEARCH_LOCATION_OPTIONS } from "@/lib/search-location";
import { cn } from "@/lib/utils";

const TAB_ICONS = {
  buy: Home,
  rent: Key,
  commercial: Building2,
} as const;

type SmartSearchPanelProps = {
  className?: string;
  variant?: "hero" | "default";
};

export function SmartSearchPanel({ className, variant = "default" }: SmartSearchPanelProps) {
  const router = useRouter();
  const locationRef = useRef<HTMLDivElement>(null);
  const [intent, setIntent] = useState<SearchIntentId>("buy");
  const [location, setLocation] = useState("Kolkata");
  const [locationOpen, setLocationOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [propertyTypeId, setPropertyTypeId] = useState("any");
  const [budget, setBudget] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [furnishing, setFurnishing] = useState("");

  const budgetOptions = BUDGET_OPTIONS_BY_INTENT[intent];
  const propertyTypeOptions = INTENT_PROPERTY_TYPES[intent];

  useEffect(() => {
    setBudget("");
    setPropertyTypeId("any");
    setBedrooms("");
    setFurnishing("");
  }, [intent]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setLocationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const paramsString = useMemo(
    () =>
      buildSearchParams({
        intent,
        location,
        query,
        propertyTypeId,
        budget,
        bedrooms,
        furnishing,
      }).toString(),
    [intent, location, query, propertyTypeId, budget, bedrooms, furnishing]
  );

  const runSearch = () => {
    router.push(`/properties?${paramsString}`);
  };

  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_20px_60px_rgba(0,31,77,0.18)]",
        isHero && "min-w-0",
        className
      )}
    >
      <div className="flex border-b border-border bg-surface/60">
        {SEARCH_INTENT_TABS.map((tab) => {
          const Icon = TAB_ICONS[tab.id];
          const active = intent === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setIntent(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3.5 text-sm font-semibold transition-colors",
                active
                  ? "border-primary bg-white text-primary"
                  : "border-transparent text-text-secondary hover:bg-white hover:text-primary"
              )}
            >
              <Icon size={18} strokeWidth={active ? 2.25 : 2} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-4 sm:p-5">
        <div className="overflow-hidden rounded-xl border border-border/90">
          <div className="flex flex-col md:flex-row">
            <div
              ref={locationRef}
              className="relative border-b border-border md:min-w-[11.5rem] md:max-w-[14rem] md:shrink-0 md:border-b-0 md:border-r"
            >
              <button
                type="button"
                onClick={() => setLocationOpen((open) => !open)}
                className="flex h-full w-full items-center gap-2 px-4 py-3.5 text-left text-sm font-semibold text-foreground hover:bg-surface"
              >
                <MapPin size={17} className="shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate">{location}</span>
                <ChevronDown
                  size={14}
                  className={cn("ml-auto shrink-0 text-text-tertiary", locationOpen && "rotate-180")}
                />
              </button>
              {locationOpen && (
                <div className="absolute left-0 top-full z-50 max-h-48 min-w-full overflow-y-auto border border-border bg-white py-1 shadow-card md:min-w-[14rem]">
                  {SEARCH_LOCATION_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setLocation(option);
                        setLocationOpen(false);
                      }}
                      className={cn(
                        "block w-full px-3 py-2 text-left text-sm font-medium",
                        location === option ? "bg-primary-light text-primary" : "hover:bg-surface"
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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                placeholder="Search locality, project, landmark..."
                className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-text-secondary sm:text-[15px]"
                aria-label="Search locality, project, or landmark"
              />
            </div>
            <button
              type="button"
              onClick={runSearch}
              className="flex items-center justify-center gap-2 bg-primary px-5 py-3.5 text-sm font-bold text-white hover:bg-primary-dark sm:min-w-[7rem]"
            >
              <Search size={17} strokeWidth={2.5} />
              Search
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          <FilterSelect
            label="Property Type"
            value={propertyTypeId}
            onChange={setPropertyTypeId}
            options={propertyTypeOptions.map((o) => ({ label: o.label, value: o.id }))}
          />
          <FilterSelect
            label="Budget"
            value={budget}
            onChange={setBudget}
            options={budgetOptions.map((o) => ({ label: o.label, value: o.value }))}
          />
          <FilterSelect
            label="BHK"
            value={bedrooms}
            onChange={setBedrooms}
            options={BHK_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
          />
          <FilterSelect
            label="Furnishing"
            value={furnishing}
            onChange={setFurnishing}
            options={FURNISHING_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
          />
          <Link
            href={`/properties?${paramsString}`}
            className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary-light/40 min-[480px]:col-span-2 xl:col-span-1"
          >
            <SlidersHorizontal size={16} className="text-primary" />
            More Filters
          </Link>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer rounded-lg border border-border bg-white px-3 py-2.5 text-sm font-semibold text-foreground outline-none focus:border-primary"
      >
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
