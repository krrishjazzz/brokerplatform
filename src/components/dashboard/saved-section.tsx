"use client";

import { useEffect, useState } from "react";
import { Heart, Home, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { SavedProperty } from "@/components/dashboard/types";

function parseImageList(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function SavedSection() {
  const [saved, setSaved] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/saved", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        const items = (data.saved || []).map((savedItem: any) => ({
          id: savedItem.property.id,
          title: savedItem.property.title,
          city: savedItem.property.city,
          price: savedItem.property.price,
          coverImage: savedItem.property.coverImage,
          images: parseImageList(savedItem.property.images),
          propertyType: savedItem.property.propertyType,
          slug: savedItem.property.slug,
        }));
        setSaved(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-6">Saved Properties</h2>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : saved.length === 0 ? (
        <div className="bg-white rounded-card shadow-card p-8 text-center border border-border">
          <Heart size={48} className="mx-auto text-text-secondary mb-3" />
          <p className="text-text-secondary">No saved properties.</p>
          <Button className="mt-4" onClick={() => (window.location.href = "/properties")}>
            Browse Properties
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map((property) => (
            <a
              key={property.id}
              href={`/properties/${property.slug}`}
              className="bg-white rounded-card shadow-card border border-border overflow-hidden hover:shadow-lift transition-shadow"
            >
              <div className="h-40 bg-surface">
                {property.coverImage || property.images[0] ? (
                  <img src={property.coverImage || property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home size={32} className="text-text-secondary" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="font-medium text-foreground truncate">{property.title}</p>
                <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
                  <MapPin size={14} /> {property.city}
                </p>
                <p className="text-primary font-semibold mt-2">{formatPrice(property.price)}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
