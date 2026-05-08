"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  IndianRupee,
  Eye,
  Phone,
  Share,
  Heart,
  Loader2,
  Search,
  Filter,
  X,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import {
  PROPERTY_TYPES,
  INDIAN_STATES,
} from "@/lib/constants";

interface Property {
  id: string;
  slug: string;
  title: string;
  city: string;
  price: number;
  listingType: string;
  propertyType: string;
  coverImage: string | null;
  images: string[];
  assignedBrokerId: string | null;
  assignedBroker?: {
    name: string;
    phone: string;
  } | null;
  publicBrokerName: string;
  verified: boolean;
  area: number;
  areaUnit: string;
  bedrooms: number | null;
  bathrooms: number | null;
  furnishing: string | null;
  status: string;
}

export default function BrokerPropertiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListingType, setSelectedListingType] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const fetchProperties = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedListingType) params.set("listingType", selectedListingType);
      if (selectedCategory) params.set("category", selectedCategory);
      if (selectedPropertyType) params.set("propertyType", selectedPropertyType);
      if (selectedCity) params.set("city", selectedCity);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);

      const res = await fetch(`/api/broker/properties?${params}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedListingType, selectedCategory, selectedPropertyType, selectedCity, minPrice, maxPrice]);

  useEffect(() => {
    if (user?.role === "BROKER" && user.brokerStatus === "APPROVED") {
      fetchProperties();
    } else {
      router.push("/login");
    }
  }, [user, router, fetchProperties]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedListingType("");
    setSelectedCategory("");
    setSelectedPropertyType("");
    setSelectedCity("");
    setMinPrice("");
    setMaxPrice("");
  };

  const handleViewDetails = (slug: string) => {
    router.push(`/properties/${slug}`);
  };

  const handleContactBroker = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleWhatsApp = (phone: string, property: Property) => {
    const message = `Hi, I'm interested in your property: ${property.title} in ${property.city}. Price: ${formatPrice(property.price)}`;
    window.open(`https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleShare = (property: Property) => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `${property.title} - ${formatPrice(property.price)}`,
        url: `${window.location.origin}/properties/${property.slug}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/properties/${property.slug}`);
      // Could show a toast here
    }
  };

  if (!user || user.role !== "BROKER" || user.brokerStatus !== "APPROVED") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-border">
          <div className="px-6 py-6">
            <h1 className="text-2xl font-bold text-foreground">Broker Network Properties</h1>
            <p className="text-text-secondary mt-1">All accessible properties in the broker network</p>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar Filters */}
          <div className="w-64 bg-white border-r border-border overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Search</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                  <Input
                    placeholder="Property name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Listing Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Listing Type</label>
                <div className="space-y-2">
                  {["All Types", "BUY", "RENT"].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="listingType"
                        value={type === "All Types" ? "" : type}
                        checked={selectedListingType === (type === "All Types" ? "" : type)}
                        onChange={(e) => setSelectedListingType(e.target.value)}
                        className="w-4 h-4 text-primary cursor-pointer"
                      />
                      <span className="text-sm text-foreground">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">All Categories</option>
                  <option value="RESIDENTIAL">Residential</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="INDUSTRIAL">Industrial</option>
                  <option value="AGRICULTURAL">Agricultural</option>
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Property Type</label>
                <select
                  value={selectedPropertyType}
                  onChange={(e) => setSelectedPropertyType(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">All Property Types</option>
                  {selectedCategory && PROPERTY_TYPES[selectedCategory as keyof typeof PROPERTY_TYPES]?.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                  {!selectedCategory && Object.values(PROPERTY_TYPES).flat().map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">All Cities</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Price Range</label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              {(searchQuery || selectedListingType || selectedCategory || selectedPropertyType || selectedCity || minPrice || maxPrice) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <X size={14} />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <Loader2 size={40} className="animate-spin text-primary" />
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16">
                <Building2 size={56} className="mx-auto text-text-secondary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No properties found</h3>
                <p className="text-text-secondary">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {properties.map((property) => (
                  <BrokerPropertyCard
                    key={property.id}
                    property={property}
                    onViewDetails={handleViewDetails}
                    onContactBroker={handleContactBroker}
                    onWhatsApp={handleWhatsApp}
                    onShare={handleShare}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface BrokerPropertyCardProps {
  property: Property;
  onViewDetails: (slug: string) => void;
  onContactBroker: (phone: string) => void;
  onWhatsApp: (phone: string, property: Property) => void;
  onShare: (property: Property) => void;
}

function BrokerPropertyCard({ property, onViewDetails, onContactBroker, onWhatsApp, onShare }: BrokerPropertyCardProps) {
  const isDirectOwner = !property.assignedBrokerId;
  const brokerName = isDirectOwner ? "KrrishJazz" : property.assignedBroker?.name || "Unknown Broker";
  const brokerPhone = isDirectOwner ? process.env.NEXT_PUBLIC_PLATFORM_PHONE || "+91XXXXXXXXXX" : property.assignedBroker?.phone || "";
  
  const pricePerUnit = property.area ? Math.round(property.price / property.area) : 0;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-border flex flex-col lg:flex-row">
      {/* Property Image */}
      <div className="relative w-full lg:w-56 flex-shrink-0 bg-gray-200 h-44 lg:h-full">
        {(() => {
          const imageUrl = property.coverImage || property.images?.[0] || "";
          return imageUrl ? (
            <img
              src={imageUrl}
              alt={property.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface">
              <Building2 size={48} className="text-text-secondary" />
            </div>
          );
        })()}
        
        <div className="absolute top-3 left-3">
          <Badge variant={property.listingType === "BUY" ? "default" : "blue"}>
            {property.listingType}
          </Badge>
        </div>

        <div className="absolute bottom-3 right-3 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => onContactBroker(brokerPhone)}>
          <Phone size={18} className="text-primary" />
        </div>
      </div>

      <div className="p-4 lg:p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3 mb-3">
            <div>
              <h3 className="font-bold text-foreground text-lg line-clamp-2">{property.title}</h3>
              <div className="flex items-center gap-1 text-sm text-text-secondary mt-1">
                <MapPin size={16} />
                <span>{property.city}</span>
              </div>
            </div>
            <div className="text-right lg:text-left">
              <div className="text-2xl font-bold text-primary">
                ₹{(property.price / 10000000).toFixed(2)} Cr
              </div>
              {property.area && (
                <div className="text-sm text-text-secondary">₹{pricePerUnit.toLocaleString()}/sqft</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-border mb-3 text-sm text-text-secondary">
            {property.bedrooms && (
              <div>
                <div className="font-semibold text-foreground">{property.bedrooms} BHK</div>
                <div>Bedrooms</div>
              </div>
            )}
            {property.area && (
              <div>
                <div className="font-semibold text-foreground">{Math.round(property.area).toLocaleString()} {property.areaUnit}</div>
                <div>Area</div>
              </div>
            )}
            {property.bathrooms && (
              <div>
                <div className="font-semibold text-foreground">{property.bathrooms}</div>
                <div>Bathrooms</div>
              </div>
            )}
            <div>
              {property.furnishing ? (
                <>
                  <div className="font-semibold text-foreground">{property.furnishing}</div>
                  <div>Furnishing</div>
                </>
              ) : (
                <div className="font-semibold text-foreground">{property.propertyType}</div>
              )}
            </div>
          </div>

          <div className="text-sm text-text-secondary mb-4">
            <div className="font-medium text-foreground mb-1">Broker</div>
            <div>{brokerName}</div>
            <div className="mt-1 text-xs">{brokerPhone}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => onViewDetails(property.slug)}
            className="flex-1"
            size="sm"
          >
            <Eye size={14} className="mr-2" />
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onWhatsApp(brokerPhone, property)}
            className="flex-1"
          >
            WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onShare(property)}
            className="flex-1"
          >
            <Share size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}