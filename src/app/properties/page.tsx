"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import { PROPERTY_TYPES, FURNISHING_OPTIONS } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";

interface Property {
  id: string;
  slug: string;
  title: string;
  listingType: string;
  category: string;
  propertyType: string;
  price: number;
  area: number;
  areaUnit: string;
  bedrooms: number | null;
  bathrooms: number | null;
  city: string;
  address: string;
  images: string[];
  coverImage: string | null;
  furnishing: string | null;
  amenities: string[];
  createdAt: string;
  publicBrokerName: string;
  verified: boolean;
  postedBy: { name: string | null; role: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const LISTING_TABS = [
  { label: "Buy", value: "BUY" },
  { label: "Rent", value: "RENT" },
  { label: "Resale", value: "RESALE" },
  { label: "Lease", value: "LEASE" },
  { label: "Commercial", value: "COMMERCIAL" },
];

const CATEGORY_OPTIONS = [
  { label: "Residential", value: "RESIDENTIAL" },
  { label: "Commercial", value: "COMMERCIAL" },
  { label: "Industrial", value: "INDUSTRIAL" },
  { label: "Agricultural", value: "AGRICULTURAL" },
];

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter states
  const [listingType, setListingType] = useState(searchParams.get("listingType") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [propertyType, setPropertyType] = useState(searchParams.get("propertyType") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
  const [furnishing, setFurnishing] = useState(searchParams.get("furnishing") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (listingType) params.set("listingType", listingType);
    if (category) params.set("category", category);
    if (propertyType) params.set("propertyType", propertyType);
    if (city) params.set("city", city);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (furnishing) params.set("furnishing", furnishing);
    if (sort) params.set("sort", sort);
    if (query) params.set("q", query);
    params.set("page", page.toString());

    try {
      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      setProperties(data.properties || []);
      setPagination(data.pagination || null);
    } catch {
      console.error("Failed to fetch properties");
    } finally {
      setLoading(false);
    }
  }, [listingType, category, propertyType, city, minPrice, maxPrice, bedrooms, furnishing, sort, query, page]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleSaveProperty = async (propertyId: string) => {
    if (!user) {
      router.push("/login?redirect=/properties");
      return;
    }
    await fetch("/api/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId }),
    });
  };

  const clearFilters = () => {
    setListingType("");
    setCategory("");
    setPropertyType("");
    setCity("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setFurnishing("");
    setSort("");
    setQuery("");
    setPage(1);
  };

  const availablePropertyTypes = category
    ? PROPERTY_TYPES[category] || []
    : Object.values(PROPERTY_TYPES).flat();

  const badgeVariant = (type: string) => {
    switch (type) {
      case "BUY": return "blue";
      case "RENT": return "success";
      case "RESALE": return "warning";
      default: return "default";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 border border-border rounded-btn px-3 py-2">
          <Search size={18} className="text-text-secondary" />
          <input
            type="text"
            placeholder="Search properties..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchProperties()}
            className="w-full text-sm outline-none"
          />
        </div>
        <Button onClick={() => setFiltersOpen(!filtersOpen)} variant="ghost">
          <SlidersHorizontal size={16} className="mr-2" />
          Filters
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <aside className={cn(
          "w-72 shrink-0 bg-white border border-border rounded-card p-4 space-y-4 h-fit sticky top-20",
          filtersOpen ? "block" : "hidden lg:block"
        )}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Filters</h3>
            <button onClick={clearFilters} className="text-xs text-primary hover:underline">Clear All</button>
          </div>

          {/* Listing Type */}
          <div>
            <p className="text-xs font-medium text-text-secondary mb-2">Listing Type</p>
            <div className="flex flex-wrap gap-1">
              {LISTING_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setListingType(listingType === tab.value ? "" : tab.value)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-pill border transition-colors",
                    listingType === tab.value
                      ? "bg-primary text-white border-primary"
                      : "border-border text-text-secondary hover:border-primary"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <p className="text-xs font-medium text-text-secondary mb-2">Category</p>
            <div className="flex flex-wrap gap-1">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setCategory(category === opt.value ? "" : opt.value); setPropertyType(""); }}
                  className={cn(
                    "px-3 py-1 text-xs rounded-pill border transition-colors",
                    category === opt.value
                      ? "bg-primary text-white border-primary"
                      : "border-border text-text-secondary hover:border-primary"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Property Type */}
          {availablePropertyTypes.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-secondary mb-2">Property Type</p>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-border rounded-btn"
              >
                <option value="">All Types</option>
                {availablePropertyTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}

          {/* Price Range */}
          <div>
            <p className="text-xs font-medium text-text-secondary mb-2">Price Range</p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-border rounded-btn"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-border rounded-btn"
              />
            </div>
          </div>

          {/* BHK */}
          <div>
            <p className="text-xs font-medium text-text-secondary mb-2">BHK</p>
            <div className="flex gap-1">
              {["1", "2", "3", "4", "5"].map((bhk) => (
                <button
                  key={bhk}
                  onClick={() => setBedrooms(bedrooms === bhk ? "" : bhk)}
                  className={cn(
                    "w-8 h-8 text-xs rounded-btn border transition-colors",
                    bedrooms === bhk
                      ? "bg-primary text-white border-primary"
                      : "border-border text-text-secondary hover:border-primary"
                  )}
                >
                  {bhk}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div>
            <p className="text-xs font-medium text-text-secondary mb-2">City</p>
            <input
              type="text"
              placeholder="Enter city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-border rounded-btn"
            />
          </div>

          {/* Furnishing */}
          <div>
            <p className="text-xs font-medium text-text-secondary mb-2">Furnishing</p>
            <div className="flex flex-wrap gap-1">
              {FURNISHING_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFurnishing(furnishing === opt ? "" : opt)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-pill border transition-colors",
                    furnishing === opt
                      ? "bg-primary text-white border-primary"
                      : "border-border text-text-secondary hover:border-primary"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={fetchProperties} className="w-full" size="sm">
            Apply Filters
          </Button>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-secondary">
              {pagination ? `${pagination.total} properties found` : "Loading..."}
              {city && ` in ${city}`}
            </p>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-3 py-1.5 text-xs border border-border rounded-btn"
            >
              <option value="">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Property Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-card border border-border p-4 animate-pulse">
                  <div className="aspect-video bg-surface rounded-btn mb-3" />
                  <div className="h-4 bg-surface rounded w-3/4 mb-2" />
                  <div className="h-3 bg-surface rounded w-1/2 mb-2" />
                  <div className="h-5 bg-surface rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-text-secondary mb-2">No properties found</p>
              <p className="text-sm text-text-secondary">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {properties.map((property) => (
                <div key={property.id} className="bg-white rounded-card border border-border overflow-hidden hover:shadow-card transition-shadow flex flex-col lg:flex-row">
                  {/* Image */}
                  <div className="relative w-full lg:w-56 h-40 lg:h-auto bg-surface overflow-hidden">
                    {(property.coverImage || property.images[0]) && (
                      <img
                        src={property.coverImage || property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute top-2 left-2">
                      <Badge variant={badgeVariant(property.listingType) as any}>
                        {property.listingType === "BUY" ? "FOR SALE" : property.listingType === "RENT" ? "FOR RENT" : property.listingType}
                      </Badge>
                    </div>
                    <button
                      onClick={() => handleSaveProperty(property.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors"
                    >
                      <Heart size={16} className="text-text-secondary" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-foreground truncate mb-1">
                        {property.title}
                      </h3>
                      <p className="text-xs text-text-secondary flex items-center gap-1 mb-2">
                        <MapPin size={12} /> {property.address}, {property.city}
                      </p>
                      <div className="text-xl font-bold text-primary mb-2">
                        {formatPrice(Number(property.price))}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs text-text-secondary mb-3">
                        {property.bedrooms && (
                          <div className="flex items-center gap-1">
                            <BedDouble size={12} /> {property.bedrooms} BHK
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center gap-1">
                            <Bath size={12} /> {property.bathrooms} Bath
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Maximize size={12} /> {property.area} {property.areaUnit}
                        </div>
                        <div className="text-left">
                          <Badge variant="success">
                            {property.publicBrokerName || property.postedBy.name || "KrrishJazz"} Verified
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/properties/${property.slug}`} className="flex-1">
                        <Button variant="ghost" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <Link href={user ? `/properties/${property.slug}#enquire` : `/login?redirect=/properties/${property.slug}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          Enquire Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-text-secondary">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense>
      <PropertiesContent />
    </Suspense>
  );
}
