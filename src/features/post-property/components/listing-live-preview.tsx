import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { getVisibilityLabel } from "@/lib/visibility";

export function ListingLivePreview({
  title,
  description,
  listingType,
  propertyType,
  city,
  locality,
  price,
  area,
  image,
  visibility,
  managedBy,
  amenitiesCount,
}: {
  title?: string;
  description?: string;
  listingType?: string;
  propertyType?: string;
  city?: string;
  locality?: string;
  price?: unknown;
  area?: unknown;
  image?: string;
  visibility?: string;
  managedBy?: string;
  amenitiesCount: number;
}) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 rounded-card border border-border bg-white p-4 shadow-card">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Live listing preview</p>
            <p className="text-xs text-text-secondary">How buyers and brokers will scan it.</p>
          </div>
          <Badge variant="blue">{getVisibilityLabel(visibility)}</Badge>
        </div>
        <div className="overflow-hidden rounded-card border border-border bg-white">
          <div className="relative h-44 bg-surface">
            {image ? (
              <img src={image} alt="Listing preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-primary">
                <Building2 size={42} />
              </div>
            )}
            <div className="absolute left-3 top-3 flex gap-1.5">
              <Badge variant="blue">{listingType || "Listing"}</Badge>
              <Badge variant="success">Managed</Badge>
            </div>
          </div>
          <div className="p-4">
            <p className="text-xl font-bold text-primary">
              {price ? formatPrice(Number(price)) : "Price pending"}
            </p>
            <h3 className="mt-2 line-clamp-2 text-base font-semibold text-foreground">
              {title || "Property title will appear here"}
            </h3>
            <p className="mt-1 line-clamp-1 text-sm text-text-secondary">
              {[locality, city].filter(Boolean).join(", ") || "Location pending"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-pill border border-border bg-surface px-3 py-1 text-xs font-semibold text-foreground">
                {propertyType || "Type"}
              </span>
              <span className="rounded-pill border border-border bg-surface px-3 py-1 text-xs font-semibold text-foreground">
                {area ? `${Number(area).toLocaleString("en-IN")} sqft` : "Area"}
              </span>
              <span className="rounded-pill border border-border bg-surface px-3 py-1 text-xs font-semibold text-foreground">
                {amenitiesCount} amenities
              </span>
            </div>
            <p className="mt-3 line-clamp-3 text-xs leading-5 text-text-secondary">
              {description || "Description preview helps you spot missing details before submission."}
            </p>
            <div className="mt-4 rounded-card border border-primary/20 bg-primary-light p-3">
              <p className="text-xs font-semibold text-primary">
                {managedBy || "KrrishJazz"} coordinates enquiries
              </p>
              <p className="mt-1 text-[11px] leading-4 text-text-secondary">
                Contact remains protected. Listing is free until deal closure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
