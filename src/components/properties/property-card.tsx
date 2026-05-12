"use client";

import Link from "next/link";
import { BellRing, Building2, Eye, Heart, Home, MapPin, MessageCircle, Share2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import type { Property } from "./types";
import { badgeVariant, getFreshness, getSmartSpecs, listingLabel } from "./property-display";

interface PropertyCardProps {
  property: Property;
  isLoggedIn: boolean;
  onSave: (propertyId: string) => void;
  onShare: (property: Property) => void;
}

export function PropertyCard({ property, isLoggedIn, onSave, onShare }: PropertyCardProps) {
  const freshness = getFreshness(property.updatedAt);
  const image = property.coverImage || property.images[0];
  const pricePerUnit = property.area > 0 ? Math.round(property.price / property.area).toLocaleString("en-IN") : null;
  const brokerName = "KrrishJazz";
  const specs = getSmartSpecs(property).slice(0, 3);
  const trustSignals = [
    property.verified ? { label: "Verified", icon: ShieldCheck, tone: "text-success bg-success/10 border-success/20" } : null,
    property.readyToVisit ? { label: "Ready to Visit", icon: Eye, tone: "text-accent bg-accent/10 border-accent/20" } : null,
    getFreshness(property.updatedAt).score === "high" ? { label: "Fresh", icon: BellRing, tone: "text-primary bg-primary-light border-primary/20" } : null,
    property.ownerListed ? { label: "Owner Listed", icon: Home, tone: "text-warning bg-warning-light border-warning/20" } : null,
  ].filter(Boolean).slice(0, 3) as { label: string; icon: typeof ShieldCheck; tone: string }[];

  return (
    <article className="group overflow-hidden rounded-card border border-border bg-white shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lift">
      <div className="grid sm:grid-cols-[170px_1fr] lg:grid-cols-[310px_1fr]">
        <div className="relative h-44 overflow-hidden bg-surface sm:h-full lg:h-full">
          <Link href={`/properties/${property.slug}`} className="block h-full">
            {image ? (
              <img
                src={image}
                alt={property.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-primary">
                <Building2 size={48} />
              </div>
            )}
          </Link>

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <Badge variant={badgeVariant(property.listingType)}>{listingLabel(property.listingType)}</Badge>
          </div>

          <button
            type="button"
            onClick={() => onSave(property.id)}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/92 text-text-secondary shadow-card transition-colors hover:text-accent"
            aria-label="Save property"
          >
            <Heart size={17} />
          </button>

          <div className="absolute bottom-3 left-3 rounded-pill bg-foreground/82 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            {property.images.length || (property.coverImage ? 1 : 0)} photo{property.images.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="flex min-w-0 flex-col p-3 lg:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <Link href={`/properties/${property.slug}`} className="block">
                <h2 className="line-clamp-2 text-base font-semibold text-foreground group-hover:text-primary sm:text-lg lg:text-xl">{property.title}</h2>
              </Link>
              <p className="mt-1.5 flex items-center gap-1 text-xs text-text-secondary sm:text-sm">
                <MapPin size={14} />
                <span className="line-clamp-1">{property.locality ? `${property.locality}, ` : ""}{property.city}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="blue">{property.propertyType}</Badge>
                <Badge variant={freshness.variant}>
                  <BellRing size={11} className="mr-1" />
                  {freshness.label}
                </Badge>
              </div>
            </div>

            <div className="shrink-0 sm:text-right">
              <p className="text-xl font-bold text-primary lg:text-2xl">{formatPrice(Number(property.price))}</p>
              {pricePerUnit && <p className="mt-1 text-xs text-text-secondary">Rs {pricePerUnit}/sqft</p>}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {specs.map((spec) => (
              <span key={spec.label} className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground">
                {spec.icon}
                {spec.value}
              </span>
            ))}
          </div>

          <div className="mt-3 grid gap-2 rounded-card border border-primary/10 bg-primary-light/60 p-3 sm:grid-cols-[1fr_auto]">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-primary text-xs font-bold">
                {brokerName.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{brokerName}</p>
                <p className="text-xs text-text-secondary">KrrishJazz managed contact</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <ShieldCheck size={15} />
              Contact protected
            </div>
          </div>

          {trustSignals.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {trustSignals.map((signal) => {
                const Icon = signal.icon;
                return (
                  <span key={signal.label} className={cn("inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-xs font-semibold", signal.tone)}>
                    <Icon size={13} />
                    {signal.label}
                  </span>
                );
              })}
            </div>
          )}

          <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-2">
            <Link href={isLoggedIn ? `/properties/${property.slug}#enquire` : `/login?redirect=/properties/${property.slug}`} className="min-w-0">
              <Button variant="accent" className="w-full" size="sm">
                <MessageCircle size={14} className="mr-2" />
                Get Callback
              </Button>
            </Link>
            <Link href={`/properties/${property.slug}`}>
              <Button variant="outline" size="sm" aria-label="View details">
                <Eye size={14} className="mr-2" />
                <span className="hidden sm:inline">Details</span>
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => onShare(property)}
              className="inline-flex items-center justify-center rounded-btn border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary-light hover:text-primary"
              aria-label="Share property"
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
