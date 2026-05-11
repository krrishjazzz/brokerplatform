"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Factory,
  Home,
  MapPin,
  Search,
  ShieldCheck,
  Store,
  Trees,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SEARCH_TABS = [
  { label: "Buy", params: { listingType: "BUY" } },
  { label: "Rent", params: { listingType: "RENT" } },
  { label: "Commercial", params: { category: "COMMERCIAL" } },
  { label: "Plots", params: { propertyType: "Plot" } },
];

const POPULAR_SEARCHES = [
  "2 BHK in New Town",
  "Office in Salt Lake",
  "Shop in Park Street",
  "Warehouse in Howrah",
  "Plot in Rajarhat",
];

const PROPERTY_TYPES = [
  {
    label: "Flats & Homes",
    meta: "Apartments, villas, houses",
    href: "/properties?category=RESIDENTIAL",
    icon: Home,
    tone: "bg-primary-light text-primary",
  },
  {
    label: "Offices",
    meta: "Ready offices and leases",
    href: "/properties?category=COMMERCIAL&propertyType=Office",
    icon: Building2,
    tone: "bg-accent-light text-accent",
  },
  {
    label: "Shops",
    meta: "Retail, showroom, frontage",
    href: "/properties?category=COMMERCIAL&propertyType=Shop",
    icon: Store,
    tone: "bg-success-light text-success",
  },
  {
    label: "Plots",
    meta: "Land and investment plots",
    href: "/properties?propertyType=Residential%20Plot",
    icon: Trees,
    tone: "bg-warning-light text-[#9A5B00]",
  },
  {
    label: "Warehouses",
    meta: "Storage and logistics",
    href: "/properties?propertyType=Warehouse",
    icon: Warehouse,
    tone: "bg-primary-light text-accent",
  },
  {
    label: "Industrial",
    meta: "Factory, shed, land",
    href: "/properties?category=INDUSTRIAL",
    icon: Factory,
    tone: "bg-primary-light text-primary",
  },
];

const CITY_LINKS = ["Kolkata", "New Town", "Salt Lake", "Rajarhat", "Ballygunge", "Howrah"];

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(SEARCH_TABS[0]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");

  const buildParams = (overrideSearch = search) => {
    const params = new URLSearchParams();
    Object.entries(activeTab.params).forEach(([key, value]) => params.set(key, value));
    if (overrideSearch.trim()) params.set("q", overrideSearch.trim());
    if (city.trim()) params.set("city", city.trim());
    if (budget) params.set("maxPrice", budget);
    return params;
  };

  const runSearch = () => {
    router.push(`/properties?${buildParams().toString()}`);
  };

  return (
    <main className="min-h-screen bg-surface pb-16 text-foreground">
      <section className="relative overflow-hidden border-b border-border bg-primary-light">
        <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-10 lg:px-6 lg:pb-16 lg:pt-14">
          <div className="mx-auto max-w-4xl text-center">
            <p className="inline-flex items-center gap-2 rounded-pill border border-primary/20 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm">
              <BadgeCheck size={16} />
              Verified property search
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Find a property that feels right.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-text-secondary">
              Search homes, offices, shops, plots, and warehouses with free owner listings and KrrishJazz-assisted closure.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-5xl rounded-card border border-primary/15 bg-white p-3 shadow-lift">
            <div className="flex justify-center border-b border-border">
              <div className="flex w-full gap-1 overflow-x-auto px-1 sm:w-auto">
                {SEARCH_TABS.map((tab) => (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "relative min-w-24 px-5 py-3 text-sm font-semibold transition-colors",
                      activeTab.label === tab.label
                        ? "text-primary"
                        : "text-text-secondary hover:text-primary"
                    )}
                  >
                    {tab.label}
                    {activeTab.label === tab.label && (
                      <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2 pt-3 lg:grid-cols-[1fr_1.3fr_170px_auto]">
              <div className="flex min-h-12 items-center gap-2 rounded-btn border border-border bg-surface px-3 focus-within:border-primary">
                <MapPin size={18} className="shrink-0 text-primary" />
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="City or locality"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-text-secondary"
                />
              </div>
              <div className="flex min-h-12 items-center gap-2 rounded-btn border border-border bg-surface px-3 focus-within:border-primary">
                <Search size={18} className="shrink-0 text-primary" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && runSearch()}
                  placeholder="Search flat, office, shop, plot..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-text-secondary"
                />
              </div>
              <select
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                className="min-h-12 rounded-btn border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="">Budget</option>
                <option value="3000000">Under 30L</option>
                <option value="5000000">Under 50L</option>
                <option value="10000000">Under 1Cr</option>
                <option value="50000">Rent under 50K</option>
              </select>
              <Button onClick={runSearch} size="lg" className="min-h-12">
                Search
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <span className="text-xs font-semibold text-text-secondary">Popular:</span>
              {POPULAR_SEARCHES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => router.push(`/properties?${buildParams(item).toString()}`)}
                  className="rounded-pill border border-border bg-white px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-primary/40 hover:bg-primary-light hover:text-primary"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-5 grid max-w-3xl gap-2 sm:grid-cols-3">
            <TrustPill icon={<ShieldCheck size={16} />} title="Free owner listings" />
            <TrustPill icon={<BadgeCheck size={16} />} title="1 month brokerage on closure" />
            <TrustPill icon={<Search size={16} />} title="Managed callbacks" />
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-primary">Browse Properties</p>
              <h2 className="mt-1 text-2xl font-semibold text-foreground">Start with what you need</h2>
            </div>
            <Link href="/properties" className="text-sm font-semibold text-accent hover:text-primary">
              Open filters
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PROPERTY_TYPES.map((type) => (
              <Link
                key={type.label}
                href={type.href}
                className="group rounded-card border border-border bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-btn", type.tone)}>
                    <type.icon size={21} />
                  </div>
                  <ArrowRight size={18} className="text-text-secondary transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{type.label}</h3>
                <p className="mt-1 text-sm text-text-secondary">{type.meta}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-white py-9">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Popular localities</h2>
            <p className="hidden text-sm text-text-secondary sm:block">Tap a location to see matching properties</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {CITY_LINKS.map((item) => (
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

      <section className="bg-primary py-9 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <div>
            <p className="text-sm font-medium text-white/70">Owners and brokers</p>
            <h2 className="mt-1 text-2xl font-semibold">Have a property to list?</h2>
            <p className="mt-1 text-sm text-white/75">Post free. Brokerage applies only when KrrishJazz helps close the deal.</p>
          </div>
          <Link href="/dashboard?tab=post">
            <Button variant="ghost" size="lg" className="w-full bg-white text-primary hover:bg-primary-light sm:w-auto">
              Post Property
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

function TrustPill({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-pill border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
      <span className="text-primary">{icon}</span>
      {title}
    </div>
  );
}
