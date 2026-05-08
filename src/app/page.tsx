"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Mic,
  Building2,
  Factory,
  Warehouse,
  Landmark,
  Trees,
  Hotel,
  CheckCircle2,
  UserCheck,
  Globe,
  BadgeDollarSign,
  ArrowRight,
  Star,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HERO_TABS = ["Buy", "Rent", "New Launch", "Commercial", "Plots/Land", "Projects"];

const CATEGORIES = [
  { icon: Building2, label: "Residential", href: "/properties?category=RESIDENTIAL" },
  { icon: Landmark, label: "Commercial", href: "/properties?category=COMMERCIAL" },
  { icon: Trees, label: "Agricultural", href: "/properties?category=AGRICULTURAL" },
  { icon: Factory, label: "Industrial", href: "/properties?category=INDUSTRIAL" },
  { icon: Warehouse, label: "Warehouse", href: "/properties?propertyType=Warehouse" },
  { icon: Hotel, label: "Projects", href: "/projects" },
];

const WHY_US = [
  { icon: CheckCircle2, title: "Verified Listings", desc: "Every property is verified before going live" },
  { icon: UserCheck, title: "Trusted Brokers", desc: "RERA verified brokers you can trust" },
  { icon: Globe, title: "Pan-India Network", desc: "Properties across all major cities" },
  { icon: BadgeDollarSign, title: "Zero Brokerage", desc: "Direct owner properties available" },
];

const POPULAR_SEARCHES = [
  "Flats in Mumbai",
  "2 BHK in Bangalore",
  "Plots in Hyderabad",
  "Villas in Pune",
  "Office in Delhi",
  "3 BHK in Chennai",
];

const CITIES = [
  { name: "Mumbai", color: "from-blue-500/20" },
  { name: "Delhi", color: "from-red-500/20" },
  { name: "Bangalore", color: "from-green-500/20" },
  { name: "Hyderabad", color: "from-purple-500/20" },
  { name: "Chennai", color: "from-yellow-500/20" },
  { name: "Pune", color: "from-pink-500/20" },
];

const TESTIMONIALS = [
  { name: "Rajesh Kumar", city: "Mumbai", text: "Found my dream apartment through KrishJazz. The process was smooth and the listings were genuine.", rating: 5 },
  { name: "Priya Sharma", city: "Bangalore", text: "As a broker, KrishJazz has helped me connect with serious buyers. Great platform!", rating: 5 },
  { name: "Amit Patel", city: "Delhi", text: "Sold my property within 2 weeks of listing. Highly recommend KrishJazz to everyone.", rating: 4 },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("Buy");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (activeTab === "Rent") params.set("listingType", "RENT");
    else if (activeTab === "Commercial") params.set("category", "COMMERCIAL");
    else params.set("listingType", "BUY");
    if (searchQuery) params.set("q", searchQuery);
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative bg-surface py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            Find Your Perfect Property
          </h1>
          <p className="text-text-secondary text-lg mb-8">
            Search from thousands of verified listings across India
          </p>

          {/* Tabs */}
          <div className="flex items-center justify-center gap-1 mb-6">
            {HERO_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-btn transition-colors",
                  activeTab === tab
                    ? "bg-primary text-white"
                    : "bg-white text-text-secondary hover:bg-primary-light"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="max-w-3xl mx-auto bg-white rounded-card shadow-modal p-2 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search size={20} className="text-text-secondary shrink-0" />
              <input
                type="text"
                placeholder="Search by city, locality, or property name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full py-2 text-sm bg-transparent outline-none placeholder:text-text-secondary"
              />
            </div>
            <button className="p-2 hover:bg-surface rounded-btn transition-colors">
              <MapPin size={20} className="text-text-secondary" />
            </button>
            <button className="p-2 hover:bg-surface rounded-btn transition-colors">
              <Mic size={20} className="text-text-secondary" />
            </button>
            <Button onClick={handleSearch} size="lg">
              Search
            </Button>
          </div>

          {/* Popular searches */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {POPULAR_SEARCHES.map((search) => (
              <Link
                key={search}
                href={`/properties?q=${encodeURIComponent(search)}`}
                className="px-3 py-1 bg-white text-xs text-text-secondary rounded-pill border border-border hover:border-primary hover:text-primary transition-colors"
              >
                {search}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROPERTY CATEGORIES */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-card border border-border hover:border-primary hover:shadow-card transition-all group"
              >
                <cat.icon size={32} className="text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-foreground">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-16 bg-surface">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Why Choose KrishJazz
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center p-6 bg-white rounded-card border border-border"
              >
                <item.icon size={32} className="text-primary mb-3" />
                <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-xs text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground text-center mb-12">
            How It Works
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {[
              { step: "1", title: "Search", desc: "Browse thousands of verified property listings" },
              { step: "2", title: "Enquire", desc: "Connect directly with owners and brokers" },
              { step: "3", title: "Move In", desc: "Finalize the deal and move into your dream home" },
            ].map((item, i) => (
              <div key={item.step} className="flex flex-col items-center text-center relative">
                <div className="w-12 h-12 bg-primary-light text-primary rounded-full flex items-center justify-center text-lg font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-text-secondary max-w-[200px]">{item.desc}</p>
                {i < 2 && (
                  <ArrowRight size={20} className="hidden md:block absolute -right-10 top-6 text-primary" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED CITIES */}
      <section className="py-16 bg-surface">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Explore Top Cities
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CITIES.map((city) => (
              <Link
                key={city.name}
                href={`/properties?city=${encodeURIComponent(city.name)}`}
                className="relative overflow-hidden rounded-card aspect-[3/4] bg-white border border-border hover:shadow-card transition-all group flex items-end"
              >
                <div className={cn("absolute inset-0 bg-gradient-to-b", city.color, "to-surface")} />
                <div className="relative p-4">
                  <h3 className="text-base font-semibold text-foreground">{city.name}</h3>
                  <p className="text-xs text-text-secondary">View Properties →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-6 bg-white rounded-card border border-border">
                <Quote size={24} className="text-primary/20 mb-3" />
                <p className="text-sm text-text-secondary mb-4">{t.text}</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center text-xs font-semibold text-primary">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-text-secondary">{t.city}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={12} className="fill-warning text-warning" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            List Your Property for Free
          </h2>
          <p className="text-white/80 mb-6">
            Reach thousands of potential buyers and tenants across India
          </p>
          <Link href="/login?intent=post">
            <Button variant="accent" size="lg">
              Post Property Free <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
