"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PropertyCard } from "@/components/properties/property-card";
import type { Property } from "@/components/properties/types";
import { useAuth } from "@/lib/auth-context";
import { usePropertyListingActions } from "@/features/properties-search/hooks/use-property-listing-actions";
import { Button } from "@/components/ui/button";

export function ProjectsPreview() {
  const { user } = useAuth();
  const { saveProperty, shareProperty, isPropertySaved } = usePropertyListingActions({
    isLoggedIn: Boolean(user),
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/properties?q=project&limit=9")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.properties) return;
        setProperties(data.properties);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-text-secondary">Loading projects...</p>;
  }

  if (properties.length === 0) {
    return (
      <div className="rounded-card border border-border bg-white p-8 text-center shadow-card">
        <p className="text-sm text-text-secondary">No live project listings yet. Post a requirement and KrrishJazz will check offline inventory.</p>
        <Link href="/properties?q=project&listingType=BUY" className="mt-4 inline-block">
          <Button variant="accent">Search projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-foreground">Featured projects</h2>
        <Link href="/properties?q=project&listingType=BUY" className="text-sm font-semibold text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="grid gap-4">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            isLoggedIn={Boolean(user)}
            isSaved={isPropertySaved(property.id)}
            onSave={saveProperty}
            onShare={shareProperty}
          />
        ))}
      </div>
    </div>
  );
}
