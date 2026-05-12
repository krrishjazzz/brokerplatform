"use client";

import {
  BadgeCheck,
  BellRing,
  Building2,
  Eye,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Share,
  Target,
  UserCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { InfoPill, MatchSignal } from "@/components/broker/broker-primitives";
import {
  getAvailability,
  getBrokerSpecs,
  getFreshness,
  getListingVariant,
  getRequirementBudget,
  getRequirementFit,
} from "@/components/broker/formatters";
import type {
  BrokerMatchedRequirement as MatchedRequirement,
  BrokerProperty as Property,
} from "@/components/broker/types";
import { formatPrice } from "@/lib/utils";
import { getVisibilityLabel } from "@/lib/visibility";

interface BrokerPropertyCardProps {
  property: Property;
  onViewDetails: (property: Property) => void;
  onContactBroker: (phone: string, property?: Property) => void;
  onWhatsApp: (phone: string, property: Property) => void;
  onShare: (property: Property) => void;
  onFindRequirements: (property: Property) => void;
}

export function BrokerPropertyCard({ property, onViewDetails, onContactBroker, onWhatsApp, onShare, onFindRequirements }: BrokerPropertyCardProps) {
  const sourceLabel = property.sourceLabel || property.publicBrokerName || "Broker Network Property";
  const sourceName = property.sourceName || sourceLabel;
  const sourcePhone = property.sourcePhone || "";
  const sourceTone = property.sourceType === "YOUR_PROPERTY" ? "success" : property.sourceType === "KRRISHJAZZ_OWNER_PROPERTY" ? "blue" : "accent";
  const pricePerUnit = property.area ? Math.round(property.price / property.area) : 0;
  const freshness = getFreshness(property.updatedAt);
  const availability = getAvailability(property);
  const imageUrl = property.coverImage || property.images?.[0] || "";

  return (
    <article className="group overflow-hidden rounded-card border border-border bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <div className="grid sm:grid-cols-[180px_1fr] lg:grid-cols-[260px_1fr]">
        <div className="relative h-44 overflow-hidden bg-surface sm:h-full lg:h-full">
          {imageUrl ? (
            <img src={imageUrl} alt={property.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          ) : (
            <div className="flex h-full items-center justify-center text-primary">
              <Building2 size={48} />
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <Badge variant={getListingVariant(property.listingType)}>{property.listingType}</Badge>
            <Badge variant={freshness.variant}>
              <BellRing size={11} className="mr-1" />
              {freshness.label}
            </Badge>
          </div>
          <button
            type="button"
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-card transition-colors hover:bg-primary-light"
            onClick={() => onContactBroker(sourcePhone, property)}
            aria-label="Call broker"
          >
            <Phone size={18} />
          </button>
          {property.matchingRequirementsCount > 0 && (
            <div className="absolute bottom-3 left-3 rounded-card bg-foreground/85 px-3 py-2 text-white backdrop-blur">
              <p className="text-xs text-white/70">Demand signal</p>
              <p className="text-sm font-semibold">{property.matchingRequirementsCount} matching req</p>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col p-3 lg:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_210px]">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant={availability.variant}>{availability.label}</Badge>
                {property.verified && (
                  <Badge variant="success">
                    <BadgeCheck size={11} className="mr-1" />
                    Verified
                  </Badge>
                )}
                <Badge variant={sourceTone as any}>{sourceLabel}</Badge>
                <Badge>{property.propertyType}</Badge>
              </div>
              <h2 className="line-clamp-2 text-base font-semibold text-foreground sm:text-lg lg:text-xl">{property.title}</h2>
              <p className="mt-1.5 flex items-center gap-1 text-xs text-text-secondary sm:text-sm">
                <MapPin size={14} className="shrink-0 text-primary" />
                <span className="line-clamp-1">{property.locality ? `${property.locality}, ` : ""}{property.address}, {property.city}</span>
              </p>
            </div>

            <div className="rounded-card border border-primary/15 bg-primary-light p-3 lg:text-right">
              <p className="text-xs font-semibold uppercase text-text-secondary">Broker price</p>
              <p className="mt-1 text-xl font-bold text-primary lg:text-2xl">{formatPrice(property.price)}</p>
              {pricePerUnit > 0 && <p className="mt-1 text-xs text-text-secondary">Rs {pricePerUnit.toLocaleString()}/sqft</p>}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {getBrokerSpecs(property).map((spec) => (
              <div key={spec.label} className="rounded-btn border border-border bg-surface px-3 py-2">
                <p className="truncate text-sm font-semibold text-foreground">{spec.value}</p>
                <p className="mt-0.5 text-xs text-text-secondary">{spec.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 rounded-card border border-border bg-surface p-3 lg:grid-cols-[1fr_1fr_1fr]">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {sourceLabel.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{sourceName}</p>
                <p className="text-xs text-text-secondary">{sourceLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Target size={16} className="text-accent" />
              {property.matchingRequirementsCount} matching requirement{property.matchingRequirementsCount === 1 ? "" : "s"}
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <UserCheck size={16} className="text-success" />
              {sourcePhone || "Contact via KrrishJazz"}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-[1.4fr_1fr_auto] gap-2">
            <Button variant="accent" size="sm" onClick={() => onWhatsApp(sourcePhone, property)} className="w-full">
              <MessageCircle size={14} className="mr-2" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={() => onContactBroker(sourcePhone, property)} className="w-full">
              <Phone size={14} className="mr-2" />
              Call
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onViewDetails(property)} className="w-full" aria-label="Details">
              <Eye size={14} />
            </Button>
          </div>
          <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
            <Button variant="outline" size="sm" onClick={() => onFindRequirements(property)} className="w-full">
              <Target size={14} className="mr-2" />
              Match Requirement
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onShare(property)} className="w-full" aria-label="Share">
              <Share size={14} />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function BrokerPropertyDetailsModal({
  property,
  onClose,
  onFindRequirements,
  onWhatsApp,
}: {
  property: Property | null;
  onClose: () => void;
  onFindRequirements: (property: Property) => void;
  onWhatsApp: (phone: string, property: Property) => void;
}) {
  if (!property) return null;

  const images = property.images.length > 0 ? property.images : property.coverImage ? [property.coverImage] : [];
  const sourceLabel = property.sourceLabel || property.publicBrokerName || "Broker Network Property";
  const sourceName = property.sourceName || sourceLabel;
  const brokerPhone = property.sourcePhone || "";
  const freshness = getFreshness(property.updatedAt);
  const availability = getAvailability(property);
  const detailRows = [
    ["Listing Type", property.listingType],
    ["Category", property.category],
    ["Property Type", property.propertyType],
    ["Area", `${Math.round(property.area).toLocaleString()} ${property.areaUnit}`],
    ["Bedrooms", property.bedrooms ?? "N/A"],
    ["Bathrooms", property.bathrooms ?? "N/A"],
    ["Floor", property.floor != null && property.totalFloors != null ? `${property.floor} / ${property.totalFloors}` : "N/A"],
    ["Furnishing", property.furnishing || "N/A"],
    ["Age", property.ageYears != null ? `${property.ageYears} years` : "N/A"],
    ["Listing Reach", getVisibilityLabel(property.visibilityType)],
    ["Status", property.listingStatus || property.status],
    ["Matching Requirements", property.matchingRequirementsCount],
    ["Last Updated", new Date(property.updatedAt).toLocaleDateString("en-IN")],
  ];

  return (
    <Modal isOpen={Boolean(property)} onClose={onClose} title="Broker Property Details" className="max-w-5xl">
      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant={getListingVariant(property.listingType)}>{property.listingType}</Badge>
              <Badge variant={availability.variant}>{availability.label}</Badge>
              <Badge variant={freshness.variant}>{freshness.label}</Badge>
              {property.matchingRequirementsCount > 0 && <Badge variant="accent">{property.matchingRequirementsCount} matches</Badge>}
            </div>
            <h2 className="text-2xl font-semibold text-foreground">{property.title}</h2>
            <p className="mt-2 flex items-start gap-1 text-sm text-text-secondary">
              <MapPin size={14} className="mt-0.5 shrink-0" />
              {property.locality ? `${property.locality}, ` : ""}{property.address}, {property.city}, {property.state} {property.pincode}
            </p>
          </div>
          <div className="rounded-card border border-primary/20 bg-primary-light p-4 lg:text-right">
            <p className="text-xs font-semibold uppercase text-text-secondary">Network price</p>
            <p className="mt-1 text-2xl font-bold text-primary">{formatPrice(property.price)}</p>
            {property.area > 0 && (
              <p className="text-sm text-text-secondary">
                Rs {Math.round(property.price / property.area).toLocaleString()}/sqft
              </p>
            )}
          </div>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {images.slice(0, 6).map((image, index) => (
              <img key={`${image}-${index}`} src={image} alt={`${property.title} ${index + 1}`} className="h-36 w-full rounded-card border border-border object-cover" />
            ))}
          </div>
        )}

        <div className="grid gap-3 rounded-card border border-border bg-surface p-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-text-secondary">Supply Source</p>
            <p className="mt-1 font-semibold text-foreground">{sourceName}</p>
            <p className="text-xs text-text-secondary">{sourceLabel} - {brokerPhone || "Phone unavailable"}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Deal action</p>
            <p className="mt-1 font-semibold text-foreground">Call, WhatsApp, match requirements</p>
            <p className="text-xs text-text-secondary">Broker-to-broker contact is available here</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Demand signal</p>
            <p className="mt-1 font-semibold text-accent">{property.matchingRequirementsCount} requirement matches</p>
            <p className="text-xs text-text-secondary">Use Match to filter demand</p>
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-semibold text-foreground">Description</h3>
          <p className="text-sm leading-6 text-text-secondary">{property.description}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {detailRows.map(([label, value]) => (
            <div key={label} className="rounded-card border border-border bg-surface px-3 py-2">
              <p className="text-xs text-text-secondary">{label}</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {property.amenities.length > 0 && (
          <div>
            <h3 className="mb-2 font-semibold text-foreground">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity) => (
                <Badge key={amenity} variant="default">{amenity}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-3 pt-2 sm:grid-cols-3">
          <Button onClick={() => window.open(`tel:${brokerPhone}`, "_self")} disabled={!brokerPhone}>
            <Phone size={14} className="mr-2" />
            Call Broker
          </Button>
          <Button variant="outline" onClick={() => onWhatsApp(brokerPhone, property)}>
            <MessageCircle size={14} className="mr-2" />
            WhatsApp
          </Button>
          <Button variant="accent" onClick={() => onFindRequirements(property)}>
            <Target size={14} className="mr-2" />
            Match Requirements
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function MatchingRequirementsDrawer({
  property,
  requirements,
  loading,
  onClose,
  onCallBroker,
  onSendProperty,
  onShareProperty,
  onTrackAction,
}: {
  property: Property | null;
  requirements: MatchedRequirement[];
  loading: boolean;
  onClose: () => void;
  onCallBroker: (phone: string) => void;
  onSendProperty: (requirement: MatchedRequirement, property: Property) => void;
  onShareProperty: (property: Property) => void;
  onTrackAction: (payload: Record<string, unknown>) => void;
}) {
  if (!property) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-modal sm:border-l sm:border-border">
        <div className="border-b border-border bg-primary p-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-pill border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">
                <Target size={13} />
                Requirement matches
              </div>
              <h2 className="line-clamp-1 text-xl font-semibold">{property.title}</h2>
              <p className="mt-1 text-sm text-white/70">
                {property.locality || property.city} - {property.propertyType} - {formatPrice(property.price)}
              </p>
            </div>
            <button type="button" onClick={onClose} className="rounded-btn p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white" aria-label="Close matches">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4 grid grid-cols-3 gap-2">
            <MatchSignal label="Matched demand" value={requirements.length} />
            <MatchSignal label="Area" value={Math.round(property.area).toLocaleString()} />
            <MatchSignal label="Freshness" value={getFreshness(property.updatedAt).label} />
          </div>

          {loading ? (
            <div className="flex h-72 items-center justify-center rounded-card border border-border bg-surface">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : requirements.length === 0 ? (
            <div className="rounded-card border border-dashed border-border bg-surface p-8 text-center">
              <Target size={46} className="mx-auto mb-3 text-primary" />
              <h3 className="font-semibold text-foreground">No exact requirement match yet</h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                This inventory is still useful. Share it in broker groups or adjust budget/location filters from the requirements desk.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => onShareProperty(property)}>
                <Share size={14} className="mr-2" />
                Share Property
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {requirements.map((requirement) => {
                const score = requirement.match || getRequirementFit(property, requirement);
                return (
                  <div key={requirement.id} className="rounded-card border border-border bg-surface p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={score.variant}>{score.label}</Badge>
                      <Badge variant="blue">{requirement.propertyType}</Badge>
                      <Badge variant="accent">{getRequirementBudget(requirement)}</Badge>
                    </div>
                    <p className="mt-3 text-sm font-semibold leading-6 text-foreground">{requirement.description}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <InfoPill label="City" value={requirement.city} />
                      <InfoPill label="Broker" value={requirement.broker.name} />
                      <InfoPill label="Posted" value={new Date(requirement.createdAt).toLocaleDateString("en-IN")} />
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      <Button size="sm" variant="accent" onClick={() => onSendProperty(requirement, property)}>
                        <MessageCircle size={14} className="mr-2" />
                        Send Property
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        onTrackAction({
                          propertyId: property.id,
                          requirementId: requirement.id,
                          eventType: "BROKER_REQUIREMENT_CALL_CLICKED",
                          recipientId: requirement.broker.id,
                          metadata: { matchScore: score.score },
                        });
                        onCallBroker(requirement.broker.phone || "");
                      }}>
                        <Phone size={14} className="mr-2" />
                        Call Broker
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => {
                        onTrackAction({
                          propertyId: property.id,
                          requirementId: requirement.id,
                          eventType: "PROPERTY_SHARED",
                          recipientId: requirement.broker.id,
                          metadata: { channel: "NATIVE_SHARE", matchScore: score.score },
                        });
                        onShareProperty(property);
                      }}>
                        <Share size={14} className="mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
