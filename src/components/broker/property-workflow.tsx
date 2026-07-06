"use client";

import { useState } from "react";
import {
  Building2,
  Eye,
  Loader2,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Share,
  Target,
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
  const sourcePhone = property.sourcePhone || "";
  const pricePerUnit = property.area ? Math.round(property.price / property.area) : 0;
  const freshness = getFreshness(property.updatedAt);
  const availability = getAvailability(property);
  const imageUrl = property.coverImage || property.images?.[0] || "";
  const visibilityLabel = getVisibilityLabel(property.visibilityType);
  const extraBadges = [
    property.verified ? "Verified" : null,
    property.listingType,
    property.propertyType,
  ].filter(Boolean).length;

  return (
    <article
      className="group overflow-hidden rounded-card border border-border bg-white shadow-card transition-all hover:shadow-lift"
      onClick={() => onViewDetails(property)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onViewDetails(property);
        }
      }}
    >
      <div className="grid sm:grid-cols-[160px_1fr] lg:grid-cols-[220px_1fr]">
        <div className="relative h-40 overflow-hidden bg-surface sm:h-full">
          {imageUrl ? (
            <img src={imageUrl} alt={property.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-primary">
              <Building2 size={40} />
            </div>
          )}
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            <Badge variant={freshness.variant} className="text-[10px]">
              {freshness.label}
            </Badge>
            {property.matchingRequirementsCount > 0 && (
              <Badge variant="accent" className="text-[10px]">
                {property.matchingRequirementsCount} matches
              </Badge>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-col p-3 lg:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                <Badge variant={availability.variant} className="text-[10px]">{availability.label}</Badge>
                <Badge variant="default" className="text-[10px]">{visibilityLabel}</Badge>
                {extraBadges > 0 && (
                  <span className="text-[10px] font-semibold text-text-secondary">+{extraBadges}</span>
                )}
              </div>
              <h2 className="line-clamp-2 text-base font-semibold text-foreground lg:text-lg">{property.title}</h2>
              <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
                <MapPin size={13} className="shrink-0 text-primary" />
                <span className="line-clamp-1">
                  {property.locality ? `${property.locality}, ` : ""}{property.city}
                </span>
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-lg font-bold text-primary lg:text-xl">{formatPrice(property.price)}</p>
              {pricePerUnit > 0 && (
                <p className="text-[10px] text-text-secondary">Rs {pricePerUnit.toLocaleString()}/sqft</p>
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-1.5 text-center sm:grid-cols-4">
            {getBrokerSpecs(property).slice(0, 4).map((spec) => (
              <div key={spec.label} className="rounded-btn border border-border bg-surface px-2 py-1.5">
                <p className="truncate text-xs font-semibold text-foreground">{spec.value}</p>
                <p className="text-[10px] text-text-secondary">{spec.label}</p>
              </div>
            ))}
          </div>

          <div
            className="mt-3 grid grid-cols-[1.2fr_1fr_auto] gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            <Button variant="accent" size="sm" onClick={() => onFindRequirements(property)} className="w-full">
              <Target size={14} className="mr-1.5" />
              Match
            </Button>
            <Button variant="outline" size="sm" onClick={() => onWhatsApp(sourcePhone, property)} className="w-full">
              <MessageCircle size={14} className="mr-1.5" />
              WhatsApp
            </Button>
            <CardMoreMenu
              onCall={() => onContactBroker(sourcePhone, property)}
              onShare={() => onShare(property)}
              onDetails={() => onViewDetails(property)}
              sourceLabel={sourceLabel}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function CardMoreMenu({
  onCall,
  onShare,
  onDetails,
  sourceLabel,
}: {
  onCall: () => void;
  onShare: () => void;
  onDetails: () => void;
  sourceLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setOpen((value) => !value)} aria-label="More actions">
        <MoreHorizontal size={16} />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-card border border-border bg-white py-1 shadow-modal">
            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-surface" onClick={() => { onCall(); setOpen(false); }}>
              <Phone size={13} /> Call
            </button>
            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-surface" onClick={() => { onShare(); setOpen(false); }}>
              <Share size={13} /> Share
            </button>
            <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-surface" onClick={() => { onDetails(); setOpen(false); }}>
              <Eye size={13} /> Details
            </button>
            <p className="border-t border-border px-3 py-2 text-[10px] text-text-secondary">{sourceLabel}</p>
          </div>
        </>
      )}
    </div>
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
