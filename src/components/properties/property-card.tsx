"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Building2, Heart, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatIntentAwarePrice, getListingIntentFromProperty } from "@/lib/posting-field-sync";
import { cn } from "@/lib/utils";
import { trackPropertyMetric } from "@/lib/track-property-metric";
import type { Property, PropertySaveTarget } from "./types";
import { badgeVariant, getSmartSpecs, listingLabel } from "./property-display";

interface PropertyCardProps {
  property: Property;
  isLoggedIn?: boolean;
  isSaved?: boolean;
  trackSearchImpression?: boolean;
  onSave: (property: PropertySaveTarget) => void | Promise<void>;
  onShare?: (property: Property) => void;
}

function getDifferentiatingBadges(property: Property) {
  const badges: { label: string; icon: typeof Sparkles; tone: string }[] = [];

  if (property.listingStatus === "NEW_LAUNCH") {
    badges.push({
      label: "New Launch",
      icon: Sparkles,
      tone: "text-warning bg-warning-light border-warning/20",
    });
  }

  return badges;
}

export function PropertyCard({
  property,
  isSaved = false,
  trackSearchImpression = false,
  onSave,
}: PropertyCardProps) {
  const image = property.coverImage || property.images[0];
  const specs = getSmartSpecs(property).slice(0, 3);
  const compareBadges = getDifferentiatingBadges(property);
  const detailHref = `/properties/${property.slug}`;

  useEffect(() => {
    if (!trackSearchImpression || property.status !== "LIVE") return;
    trackPropertyMetric(property.slug, "SEARCH_IMPRESSION");
  }, [trackSearchImpression, property.slug, property.status]);

  const handleDetailNavigate = () => {
    trackPropertyMetric(property.slug, "CLICK");
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-white shadow-[0_8px_30px_rgba(0,31,77,0.06)] transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_12px_40px_rgba(0,31,77,0.1)]">
      <div className="grid sm:grid-cols-[200px_1fr] lg:grid-cols-[280px_1fr]">
        <Link
          href={detailHref}
          onClick={handleDetailNavigate}
          className="relative block min-h-[180px] overflow-hidden bg-surface sm:min-h-[200px]"
        >
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
          <div className="absolute left-3 top-3">
            <Badge variant={badgeVariant(property.listingType)}>{listingLabel(property.listingType)}</Badge>
          </div>
        </Link>

        <div className="relative flex min-w-0 flex-col p-4 lg:p-5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void onSave(property);
            }}
            className={cn(
              "absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-card transition-colors lg:right-5 lg:top-5",
              isSaved ? "text-error" : "text-text-secondary hover:text-accent"
            )}
            aria-label={isSaved ? "Remove from saved" : "Save property"}
            aria-pressed={isSaved}
          >
            <Heart size={17} className={cn(isSaved && "fill-current")} />
          </button>

          <Link href={detailHref} onClick={handleDetailNavigate} className="block pr-12">
            <p className="text-xl font-bold text-primary lg:text-2xl">
              {formatIntentAwarePrice(
                Number(property.price),
                getListingIntentFromProperty(
                  property as { typeSpecificDetails?: string | null; listingType?: string | null }
                )
              )}
            </p>
            <h2 className="mt-1 line-clamp-2 text-base font-semibold text-foreground group-hover:text-primary sm:text-lg">
              {property.title}
            </h2>
            <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary sm:text-sm">
              <MapPin size={14} className="shrink-0" />
              <span className="line-clamp-1">
                {(property as { publicLocationLine?: string }).publicLocationLine ||
                  `${property.locality ? `${property.locality}, ` : ""}${property.city}`}
              </span>
            </p>
          </Link>

          {specs.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {specs.map((spec) => (
                <span
                  key={spec.label}
                  className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground"
                >
                  {spec.icon}
                  {spec.value}
                </span>
              ))}
            </div>
          )}

          {compareBadges.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {compareBadges.map((signal) => {
                const Icon = signal.icon;
                return (
                  <span
                    key={signal.label}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-[11px] font-semibold",
                      signal.tone
                    )}
                  >
                    <Icon size={12} />
                    {signal.label}
                  </span>
                );
              })}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link href={`${detailHref}#enquire`} className="min-w-[8rem]" onClick={(e) => e.stopPropagation()}>
              <Button variant="accent" size="sm" className="w-full sm:min-w-[9rem]">
                Contact
              </Button>
            </Link>
            <Link
              href={detailHref}
              className="text-sm font-semibold text-primary hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                handleDetailNavigate();
              }}
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
