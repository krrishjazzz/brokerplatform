"use client";

import Link from "next/link";
import { BellRing, Building2, Eye, Heart, Home, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import {
  buildPropertyWhatsAppUrl,
  formatPlatformPhoneDisplay,
  normalizePlatformPhoneForTel,
} from "@/lib/platform";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import type { Property, PropertySaveTarget } from "./types";
import { badgeVariant, getFreshness, getSmartSpecs, listingLabel } from "./property-display";

interface PropertyCardProps {
  property: Property;
  isLoggedIn: boolean;
  isSaved?: boolean;
  onSave: (property: PropertySaveTarget) => void | Promise<void>;
  onShare: (property: Property) => void;
}

export function PropertyCard({ property, isSaved = false, onSave }: PropertyCardProps) {
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
    <article className="group overflow-hidden rounded-2xl border border-border bg-white shadow-[0_8px_30px_rgba(0,31,77,0.06)] transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_12px_40px_rgba(0,31,77,0.1)]">
      <div className="grid sm:grid-cols-[200px_1fr] lg:grid-cols-[300px_1fr]">
        <div className="relative min-h-[200px] overflow-hidden bg-surface sm:min-h-[220px]">
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
            onClick={() => onSave(property)}
            className={cn(
              "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/92 shadow-card transition-colors",
              isSaved ? "text-error" : "text-text-secondary hover:text-accent"
            )}
            aria-label={isSaved ? "Remove from saved" : "Save property"}
            aria-pressed={isSaved}
          >
            <Heart size={17} className={cn(isSaved && "fill-current")} />
          </button>

          <div className="absolute bottom-3 left-3 rounded-lg bg-foreground/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
            1/{Math.max(property.images.length, property.coverImage ? 1 : 0) || 1}
          </div>
        </div>

        <div className="flex min-w-0 flex-col p-4 lg:p-5">
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

          <p className="mt-2 text-xs text-text-secondary">
            KrrishJazz:{" "}
            <a href={`tel:${normalizePlatformPhoneForTel()}`} className="font-semibold text-primary hover:underline">
              {formatPlatformPhoneDisplay()}
            </a>
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <a href={`tel:${normalizePlatformPhoneForTel()}`} className="min-w-0">
              <Button variant="accent" className="w-full" size="sm">
                <Phone size={14} className="mr-1.5" />
                Call
              </Button>
            </a>
            <a
              href={buildPropertyWhatsAppUrl(property)}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0"
            >
              <Button variant="outline" className="w-full" size="sm">
                <MessageCircle size={14} className="mr-1.5" />
                WhatsApp
              </Button>
            </a>
            <Link href={`/properties/${property.slug}#enquire`} className="min-w-0">
              <Button variant="outline" className="w-full" size="sm">
                <MessageCircle size={14} className="mr-1.5" />
                Enquire
              </Button>
            </Link>
            <Link href={`/properties/${property.slug}`} className="min-w-0">
              <Button variant="outline" className="w-full" size="sm" aria-label="View details">
                <Eye size={14} className="mr-1.5" />
                Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
