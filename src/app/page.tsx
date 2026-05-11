"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Factory,
  Home,
  MapPin,
  MessageCircle,
  PlusCircle,
  Search,
  ShieldCheck,
  Store,
  Trees,
  UserCheck,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SearchTab = {
  label: string;
  helper: string;
  params: Record<string, string>;
  typeSuggestions: string[];
  placeholder: string;
};

const SEARCH_TABS: SearchTab[] = [
  {
    label: "Buy",
    helper: "Homes, plots, resale",
    params: { listingType: "BUY" },
    typeSuggestions: ["Apartment", "Independent House", "Villa", "Residential Plot"],
    placeholder: "Search locality, project, landmark...",
  },
  {
    label: "Rent",
    helper: "Flats and houses",
    params: { listingType: "RENT" },
    typeSuggestions: ["Apartment", "Builder Floor", "Studio Apartment", "Independent House"],
    placeholder: "Search flat, society, locality...",
  },
  {
    label: "Commercial",
    helper: "Office, shop, showroom",
    params: { category: "COMMERCIAL" },
    typeSuggestions: ["Office Space", "Shop", "Showroom", "Co-working Space"],
    placeholder: "Search office, shop, market, tower...",
  },
  {
    label: "PG / Living",
    helper: "PG, hostel, serviced",
    params: { category: "HOSPITALITY" },
    typeSuggestions: ["PG / Co-living", "Hostel", "Serviced Apartment", "Guest House"],
    placeholder: "Search PG, serviced apartment, area...",
  },
  {
    label: "Plots / Land",
    helper: "Plots, farm, industrial",
    params: { propertyType: "Residential Plot" },
    typeSuggestions: ["Residential Plot", "Commercial Land", "Industrial Plot", "Farm Land"],
    placeholder: "Search plot, land, village, road...",
  },
];

const BUDGET_OPTIONS = [
  { label: "Budget", value: "" },
  { label: "Rent under 25K", value: "25000" },
  { label: "Rent under 50K", value: "50000" },
  { label: "Under 50L", value: "5000000" },
  { label: "Under 1Cr", value: "10000000" },
  { label: "Under 2Cr", value: "20000000" },
];

const POPULAR_SEARCHES: Array<{ label: string; params: Record<string, string> }> = [
  { label: "2 BHK New Town", params: { q: "2 BHK New Town", listingType: "RENT" } },
  { label: "Office Salt Lake", params: { q: "Office Salt Lake", category: "COMMERCIAL" } },
  { label: "Shop Park Street", params: { q: "Shop Park Street", propertyType: "Shop" } },
  { label: "Warehouse Gurugram", params: { q: "Warehouse Gurugram", category: "INDUSTRIAL" } },
  { label: "Plot Rajarhat", params: { q: "Plot Rajarhat", propertyType: "Residential Plot" } },
];

const QUICK_ACTIONS = [
  {
    title: "Post property free",
    desc: "KrrishJazz charges only after closure.",
    href: "/dashboard?tab=post",
    icon: PlusCircle,
  },
  {
    title: "Broker network",
    desc: "Share inventory with controlled visibility.",
    href: "/login?mode=broker",
    icon: UserCheck,
  },
  {
    title: "Assisted search",
    desc: "Tell us when search is not enough.",
    href: "/properties",
    icon: MessageCircle,
  },
];

const PROPERTY_SHORTCUTS = [
  {
    label: "Homes",
    meta: "Flats, villas, houses",
    href: "/properties?category=RESIDENTIAL",
    icon: Home,
  },
  {
    label: "Offices",
    meta: "Ready offices, leases",
    href: "/properties?category=COMMERCIAL&propertyType=Office%20Space",
    icon: Building2,
  },
  {
    label: "Shops",
    meta: "Retail and showroom",
    href: "/properties?category=COMMERCIAL&propertyType=Shop",
    icon: Store,
  },
  {
    label: "Plots",
    meta: "Land and investment",
    href: "/properties?propertyType=Residential%20Plot",
    icon: Trees,
  },
  {
    label: "Warehouses",
    meta: "Storage, logistics",
    href: "/properties?propertyType=Warehouse%20%2F%20Godown",
    icon: Warehouse,
  },
  {
    label: "Industrial",
    meta: "Factory, shed, plot",
    href: "/properties?category=INDUSTRIAL",
    icon: Factory,
  },
];

const LOCALITY_LINKS = ["New Town", "Salt Lake", "Ballygunge", "Park Street", "Golf Course Road", "Udyog Vihar"];

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SearchTab>(SEARCH_TABS[0]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [propertyType, setPropertyType] = useState("");

  const buildParams = (overrides: Record<string, string> = {}) => {
    const params = new URLSearchParams();
    Object.entries(activeTab.params).forEach(([key, value]) => params.set(key, value));
    if (search.trim()) params.set("q", search.trim());
    if (city.trim()) params.set("city", city.trim());
    if (budget) params.set("maxPrice", budget);
    if (propertyType) params.set("propertyType", propertyType);
    Object.entries(overrides).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params;
  };

  const setTab = (tab: SearchTab) => {
    setActiveTab(tab);
    setPropertyType("");
  };

  const runSearch = () => {
    router.push(`/properties?${buildParams().toString()}`);
  };

  const runPopularSearch = (params: Record<string, string>) => {
    router.push(`/properties?${new URLSearchParams(params).toString()}`);
  };

  return (
    <main className="min-h-screen bg-surface pb-16 text-foreground">
      <section className="relative overflow-hidden bg-primary-light">
        <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
        <div className="mx-auto max-w-7xl px-4 pb-9 pt-7 lg:px-6 lg:pb-12 lg:pt-9">
          <div className="mx-auto max-w-4xl text-center">
            <p className="inline-flex items-center gap-2 rounded-pill border border-primary/20 bg-white px-3.5 py-1.5 text-sm font-semibold text-primary shadow-sm">
              <ShieldCheck size={16} />
              Verified search with KrrishJazz-managed callbacks
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-[56px]">
              Search property without the noise.
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-text-secondary">
              Find homes, offices, shops, plots, PGs, and warehouses from one clean search. Customers see KrrishJazz as the trusted contact.
            </p>
          </div>

          <div className="mx-auto mt-6 max-w-5xl rounded-card border border-primary/15 bg-white p-3 shadow-lift">
            <div className="flex justify-center border-b border-border">
              <div className="flex w-full gap-1 overflow-x-auto px-1 sm:w-auto">
                {SEARCH_TABS.map((tab) => (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => setTab(tab)}
                    className={cn(
                      "relative min-w-28 px-4 py-2.5 text-left transition-colors sm:text-center",
                      activeTab.label === tab.label ? "text-primary" : "text-text-secondary hover:text-primary"
                    )}
                  >
                    <span className="block text-sm font-semibold">{tab.label}</span>
                    <span className="mt-0.5 block text-[11px] font-medium text-text-secondary">{tab.helper}</span>
                    {activeTab.label === tab.label && (
                      <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2 pt-3 lg:grid-cols-[1fr_1.45fr_180px_auto]">
              <label className="flex min-h-11 items-center gap-2 rounded-btn border border-border bg-surface px-3 focus-within:border-primary">
                <MapPin size={18} className="shrink-0 text-primary" />
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="City or locality"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-text-secondary"
                />
              </label>
              <label className="flex min-h-11 items-center gap-2 rounded-btn border border-border bg-surface px-3 focus-within:border-primary">
                <Search size={18} className="shrink-0 text-primary" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && runSearch()}
                  placeholder={activeTab.placeholder}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-text-secondary"
                />
              </label>
              <select
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                className="min-h-11 rounded-btn border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                {BUDGET_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value}>{option.label}</option>
                ))}
              </select>
              <Button onClick={runSearch} size="lg" className="min-h-11 px-8">
                Search
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <span className="text-xs font-semibold text-text-secondary">Property type:</span>
              {activeTab.typeSuggestions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPropertyType(propertyType === type ? "" : type)}
                  className={cn(
                    "rounded-pill border px-3 py-1.5 text-xs font-semibold transition-colors",
                    propertyType === type
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-text-secondary hover:border-primary/40 hover:bg-primary-light hover:text-primary"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-text-secondary">Popular:</span>
              {POPULAR_SEARCHES.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => runPopularSearch(item.params)}
                  className="rounded-pill border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-primary/40 hover:bg-primary-light hover:text-primary"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-4 grid max-w-3xl gap-2 sm:grid-cols-3">
            <TrustPill icon={<BadgeCheck size={16} />} title="Verified listings" />
            <TrustPill icon={<PlusCircle size={16} />} title="Free posting" />
            <TrustPill icon={<ShieldCheck size={16} />} title="Closure-first brokerage" />
          </div>
        </div>
      </section>

      <section className="-mt-5 pb-7">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid gap-3 md:grid-cols-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group rounded-card border border-border bg-white p-4 shadow-lift transition-all hover:-translate-y-0.5 hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-btn bg-primary-light text-primary">
                    <action.icon size={21} />
                  </span>
                  <ArrowRight size={18} className="text-text-secondary transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-foreground">{action.title}</h2>
                <p className="mt-1 text-sm leading-5 text-text-secondary">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-9">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-primary">Popular Categories</p>
              <h2 className="mt-1 text-2xl font-semibold text-foreground">Browse only when search is not enough</h2>
            </div>
            <Link href="/properties" className="text-sm font-semibold text-accent hover:text-primary">
              Open all filters
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {PROPERTY_SHORTCUTS.map((shortcut) => (
              <Link
                key={shortcut.label}
                href={shortcut.href}
                className="group rounded-card border border-border bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-primary-light text-primary">
                    <shortcut.icon size={20} />
                  </div>
                  <ArrowRight size={17} className="text-text-secondary transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{shortcut.label}</h3>
                <p className="mt-1 text-xs leading-5 text-text-secondary">{shortcut.meta}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">High-intent localities</h2>
              <p className="text-sm text-text-secondary">Shortcuts for fast search, not a wall of data.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {LOCALITY_LINKS.map((item) => (
              <Link
                key={item}
                href={`/properties?q=${encodeURIComponent(item)}`}
                className="rounded-pill border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary-light hover:text-primary"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function TrustPill({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-pill border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
      <span className="text-primary">{icon}</span>
      {title}
    </div>
  );
}
