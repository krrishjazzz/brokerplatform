"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileCheck2,
  MapPin,
  MessageCircle,
  Star,
  Search,
  ShieldCheck,
  Sparkles,
  PlusCircle,
  TrendingUp,
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
  { label: "Under 25K", value: "25000" },
  { label: "Under 50K", value: "50000" },
  { label: "Under 50L", value: "5000000" },
  { label: "Under 1Cr", value: "10000000" },
  { label: "Under 2Cr", value: "20000000" },
];

const POPULAR_SEARCHES = [
  { label: "2 BHK New Town", params: { q: "2 BHK New Town", listingType: "RENT" } },
  { label: "Office Salt Lake", params: { q: "Office Salt Lake", category: "COMMERCIAL" } },
  { label: "Plot Rajarhat", params: { q: "Plot Rajarhat", propertyType: "Residential Plot" } },
  { label: "Family Home Ballygunge", params: { q: "Family Home Ballygunge", listingType: "BUY" } },
  { label: "Shop Park Street", params: { q: "Shop Park Street", propertyType: "Shop" } },
  { label: "PG Near Sector V", params: { q: "PG Near Sector V", category: "HOSPITALITY" } },
];

const CURATED_BUDGETS = [
  { label: "30L - 50L", href: "/properties?minPrice=3000000&maxPrice=5000000&listingType=BUY" },
  { label: "50L - 1Cr", href: "/properties?minPrice=5000000&maxPrice=10000000&listingType=BUY" },
  { label: "1Cr - 2Cr", href: "/properties?minPrice=10000000&maxPrice=20000000&listingType=BUY" },
  { label: "Rent under 25K", href: "/properties?listingType=RENT&maxPrice=25000" },
  { label: "Rent under 50K", href: "/properties?listingType=RENT&maxPrice=50000" },
  { label: "Commercial under 1Cr", href: "/properties?category=COMMERCIAL&maxPrice=10000000" },
];

const POPULAR_IN_CITY = [
  { title: "Apartments in New Town", href: "/properties?q=New Town&propertyType=Apartment" },
  { title: "Offices in Salt Lake", href: "/properties?q=Salt Lake&propertyType=Office Space" },
  { title: "Homes in Ballygunge", href: "/properties?q=Ballygunge&category=RESIDENTIAL" },
  { title: "Shops in Park Street", href: "/properties?q=Park Street&propertyType=Shop" },
  { title: "Plots in Rajarhat", href: "/properties?q=Rajarhat&propertyType=Residential Plot" },
  { title: "Warehouses near Bypass", href: "/properties?q=EM Bypass&propertyType=Warehouse / Godown" },
];

const TRUST_PROOF = [
  { title: "RERA and listing checks", desc: "Core details reviewed before showing trust badges.", icon: FileCheck2 },
  { title: "Photo and freshness review", desc: "Media quality and listing freshness tracked regularly.", icon: Clock3 },
  { title: "Managed callback workflow", desc: "KrrishJazz handles follow-up to reduce spam and drop-offs.", icon: MessageCircle },
];

const FEATURED_VERIFIED = [
  { title: "3 BHK in New Town", meta: "New Town, Kolkata", price: "Rs 92L", href: "/properties?q=New Town&propertyType=Apartment&verified=true" },
  { title: "Office Space in Salt Lake", meta: "Sector V, Kolkata", price: "Rs 1.15Cr", href: "/properties?q=Salt Lake&propertyType=Office Space&verified=true" },
  { title: "2 BHK in Ballygunge", meta: "Ballygunge, Kolkata", price: "Rs 58K / month", href: "/properties?q=Ballygunge&listingType=RENT&verified=true" },
  { title: "Retail Shop in Park Street", meta: "Park Street, Kolkata", price: "Rs 1.7L / month", href: "/properties?q=Park Street&propertyType=Shop&verified=true" },
];

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

  const smartSuggestions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return POPULAR_SEARCHES.slice(0, 4).map((item) => item.label);
    return POPULAR_SEARCHES
      .map((item) => item.label)
      .filter((label) => label.toLowerCase().includes(keyword))
      .slice(0, 5);
  }, [search]);

  return (
    <main className="min-h-screen bg-surface pb-16 text-foreground">
      <section className="relative overflow-hidden border-b border-border-strong bg-gradient-to-b from-primary-light via-white to-surface">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 lg:px-6 lg:pb-12 lg:pt-12">
          <div className="mx-auto max-w-4xl text-center">
            <p className="inline-flex items-center gap-2 rounded-pill border border-accent/30 bg-accent-light px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#92400E] shadow-sm">
              <Sparkles size={14} />
              Premium, no-noise property discovery
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-[58px]">
              Find the right property faster.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-text-secondary">
              Clean search, verified signals, and managed follow-up. Everything essential, nothing extra.
            </p>
          </div>

          <div className="mx-auto mt-7 max-w-5xl rounded-card border border-border-strong bg-white p-3 shadow-lift">
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
                      <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-accent" />
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
              <div className="relative">
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
                {(search || smartSuggestions.length > 0) && (
                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 rounded-btn border border-border bg-white p-2 shadow-card">
                    <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">Smart Suggestions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {smartSuggestions.length > 0 ? smartSuggestions.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setSearch(item)}
                          className="rounded-pill border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary/30 hover:text-primary"
                        >
                          {item}
                        </button>
                      )) : (
                        <span className="px-2 py-1 text-xs text-text-secondary">No direct matches. Try locality or project name.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
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

          <div className="mx-auto mt-4 max-w-5xl rounded-card border border-border bg-white px-4 py-3 shadow-sm">
            <div className="grid gap-2 text-center sm:grid-cols-3 sm:text-left">
              <TrustPill icon={<ShieldCheck size={16} />} title="Verified Listings" />
              <TrustPill icon={<ShieldCheck size={16} />} title="No Spam Calls" />
              <TrustPill icon={<ShieldCheck size={16} />} title="Managed Closure Support" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">Browse by Budget</h2>
            <Link href="/properties" className="text-sm font-semibold text-accent hover:text-primary">
              Open filters
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CURATED_BUDGETS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-card border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary-light hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">Popular in Your City</h2>
            <Link href="/properties" className="text-sm font-semibold text-accent hover:text-primary">
              View all
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_IN_CITY.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-card border border-border bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <ArrowRight size={16} className="text-text-secondary transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">How KrrishJazz Verification Works</h2>
            <Link href="/properties?verified=true" className="text-sm font-semibold text-accent hover:text-primary">
              Explore verified listings
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {TRUST_PROOF.map((item) => (
              <div key={item.title} className="rounded-card border border-border bg-surface p-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-btn bg-primary-light text-primary">
                  <item.icon size={18} />
                </span>
                <p className="mt-3 text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">Featured Verified Picks</h2>
            <Link href="/properties?verified=true" className="text-sm font-semibold text-accent hover:text-primary">
              See all verified
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_VERIFIED.map((item) => (
              <Link key={item.title} href={item.href} className="group rounded-card border border-border bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-pill bg-success/10 px-2 py-1 text-[11px] font-semibold text-success">
                    <CheckCircle2 size={12} />
                    Verified
                  </span>
                  <Star size={14} className="text-warning" />
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-xs text-text-secondary">{item.meta}</p>
                <p className="mt-3 text-sm font-bold text-primary">{item.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="rounded-card border border-primary/15 bg-primary-light p-6">
            <div className="grid gap-5 lg:grid-cols-[1.1fr_auto] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">For Owners</p>
                <h2 className="mt-1 text-2xl font-semibold text-foreground">Post your property in 2 minutes</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                  Add key details once and get managed callbacks from serious buyers and tenants. No upfront listing fee.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-pill border border-primary/20 bg-white px-3 py-1 text-xs font-semibold text-primary">Free listing</span>
                  <span className="rounded-pill border border-primary/20 bg-white px-3 py-1 text-xs font-semibold text-primary">Verified lead handling</span>
                  <span className="rounded-pill border border-primary/20 bg-white px-3 py-1 text-xs font-semibold text-primary">Pay on closure</span>
                </div>
              </div>
              <Link href="/dashboard?tab=post">
                <Button size="lg" className="min-w-44">
                  <PlusCircle size={16} className="mr-2" />
                  Start Posting
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="overflow-hidden rounded-card border border-primary-dark/40 bg-primary-dark shadow-lift">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="p-6 lg:p-8">
                <span className="inline-flex items-center gap-2 rounded-pill border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                  <Briefcase size={12} />
                  For Brokers
                </span>
                <h2 className="mt-4 text-2xl font-semibold leading-tight text-white sm:text-3xl">
                  Join the KrrishJazz broker network. Close deals, not chase leads.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/85">
                  Access verified inventory, curated buyer requirements in your city, and a clean closure workflow. Free to apply. Approved within 1 business day.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link href="/login?as=broker">
                    <Button size="lg" className="min-w-44 bg-white text-primary shadow-sm hover:bg-white/95">
                      <Briefcase size={16} className="mr-2" />
                      Join as Broker
                    </Button>
                  </Link>
                  <Link
                    href="/login?as=broker"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-white underline-offset-4 hover:underline"
                  >
                    Already a broker? Login
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 border-t border-white/15 bg-white/[0.07] p-5 sm:grid-cols-3 lg:border-l lg:border-t-0 lg:p-6">
                {[
                  { icon: ClipboardList, title: "Active demand", desc: "Live buyer & tenant requirements." },
                  { icon: ShieldCheck, title: "Verified supply", desc: "Owner and partner inventory, KrrishJazz-checked." },
                  { icon: TrendingUp, title: "Clean closures", desc: "Brokerage paid only on deal closure." },
                ].map((item) => (
                  <div key={item.title} className="rounded-card border border-white/20 bg-white/15 p-4 shadow-sm">
                    <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-white text-primary shadow-sm">
                      <item.icon size={16} />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-white/85">{item.desc}</p>
                  </div>
                ))}
                <div className="sm:col-span-3">
                  <div className="flex flex-wrap items-center gap-3 rounded-card border border-white/20 bg-white/15 p-3 text-xs text-white/95">
                    <span className="inline-flex items-center gap-1.5 rounded-pill bg-accent-light px-2.5 py-1 font-semibold text-accent shadow-sm">
                      <BadgeCheck size={11} />
                      Free to apply
                    </span>
                    <span>RERA-verified network. Approval typically within 1 business day.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function TrustPill({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-pill border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm sm:justify-start">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-light text-accent">{icon}</span>
      {title}
    </div>
  );
}
