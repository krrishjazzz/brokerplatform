"use client";

import {
  BellRing,
  Building2,
  Clock,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Target,
  UserCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { InfoTile, MatchSignal as RequirementMatchSignal } from "@/components/broker/broker-primitives";
import {
  getAgeSignal,
  getBudgetText,
  getMatchedPropertyBrokerName,
  getMatchedPropertyBrokerPhone,
  getMatchedPropertyFreshness,
  getPropertyFit,
} from "@/components/broker/formatters";
import type { BrokerMatchedProperty as MatchedProperty, BrokerRequirement as Requirement } from "@/components/broker/types";
import { formatPrice } from "@/lib/utils";
import { INDIAN_CITIES, PROPERTY_TYPES } from "@/lib/constants";

const REQUIREMENT_TEMPLATES = [
  {
    label: "2BHK buyer",
    description: "Need 2BHK apartment for family. Good locality, lift and parking preferred.",
    propertyType: "Apartment",
  },
  {
    label: "Office lease",
    description: "Need office space for 12-18 seats. Parking and power backup preferred.",
    propertyType: "Office",
  },
  {
    label: "Shop frontage",
    description: "Need shop on main road with good frontage and walk-in visibility.",
    propertyType: "Shop",
  },
];

export type RequirementFormData = {
  description: string;
  propertyType: string;
  locality: string;
  city: string;
  budgetMin: string;
  budgetMax: string;
};

interface RequirementCardProps {
  requirement: Requirement;
  onCallBroker: (phone: string, requirement?: Requirement) => void;
  onWhatsApp: (phone: string, requirement: Requirement) => void;
  onShareRequirement: (requirement: Requirement) => void;
  onMatchProperty: (requirement: Requirement) => void;
}

export function RequirementCard({ requirement, onCallBroker, onWhatsApp, onShareRequirement, onMatchProperty }: RequirementCardProps) {
  const age = getAgeSignal(requirement.createdAt);
  const budgetText = getBudgetText(requirement);
  const hasMatches = requirement.matchedPropertiesCount > 0;

  return (
    <article className="overflow-hidden rounded-card border border-border bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <div className="grid lg:grid-cols-[1fr_260px]">
        <div className="p-4 lg:p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant={age.variant}>
              <BellRing size={11} className="mr-1" />
              {age.label}
            </Badge>
            <Badge variant={hasMatches ? "accent" : "warning"}>
              <Target size={11} className="mr-1" />
              {hasMatches ? `${requirement.matchedPropertiesCount} matches` : "Inventory gap"}
            </Badge>
            <Badge variant="blue">{requirement.propertyType}</Badge>
          </div>

          <h2 className="line-clamp-2 text-base font-semibold leading-snug text-foreground sm:text-lg lg:text-xl">{requirement.description}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-secondary sm:text-sm">
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} className="text-primary" />
              {requirement.locality ? `${requirement.locality}, ` : ""}{requirement.city}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={14} className={age.tone} />
              Posted {new Date(requirement.createdAt).toLocaleDateString("en-IN")}
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <InfoTile label="Budget" value={budgetText} />
            <InfoTile label="Need" value={requirement.propertyType} />
            <InfoTile label="Network" value={hasMatches ? "Inventory available" : "Find supply"} highlight={hasMatches} />
          </div>
        </div>

        <div className="border-t border-border bg-surface p-4 lg:border-l lg:border-t-0 lg:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <UserCheck size={19} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{requirement.broker.name}</p>
              <p className="text-xs text-text-secondary">{requirement.broker.phone || "Phone unavailable"}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <Button variant="accent" size="sm" onClick={() => onMatchProperty(requirement)} className="w-full">
              <Building2 size={14} className="mr-2" />
              View Matches
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => onWhatsApp(requirement.broker.phone || "", requirement)}>
                <MessageCircle size={14} className="mr-1" />
                WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={() => onCallBroker(requirement.broker.phone || "", requirement)}>
                <Phone size={14} className="mr-1" />
                Call
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onShareRequirement(requirement)} className="w-full">
              <Share2 size={14} className="mr-2" />
              Share Requirement
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function AddRequirementModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  submitting,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  formData: RequirementFormData;
  setFormData: (data: RequirementFormData) => void;
  submitting: boolean;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Live Requirement">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="rounded-card border border-primary/20 bg-primary-light p-4">
          <p className="text-sm font-semibold text-primary">Capture demand while it is fresh</p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Add the requirement in the same language brokers use on calls. Clear demand improves matching quality.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {REQUIREMENT_TEMPLATES.map((template) => (
            <button
              key={template.label}
              type="button"
              onClick={() => setFormData({ ...formData, description: template.description, propertyType: template.propertyType })}
              className="rounded-pill border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:border-primary hover:text-primary"
            >
              {template.label}
            </button>
          ))}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Requirement *</label>
          <Textarea
            placeholder="e.g., Need 2BHK apartment in Kolkata under 50 lakhs, lift and parking preferred"
            value={formData.description}
            onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            required
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Property Type *</label>
            <select
              value={formData.propertyType}
              onChange={(event) => setFormData({ ...formData, propertyType: event.target.value })}
              required
              className="w-full rounded-btn border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select Property Type</option>
              {Object.values(PROPERTY_TYPES).flat().map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <Input
            label="Locality"
            placeholder="e.g. Salt Lake"
            value={formData.locality}
            onChange={(event) => setFormData({ ...formData, locality: event.target.value })}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">City *</label>
            <select
              value={formData.city}
              onChange={(event) => setFormData({ ...formData, city: event.target.value })}
              required
              className="w-full rounded-btn border border-border bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select City</option>
              {INDIAN_CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Min Budget"
            type="number"
            placeholder="e.g., 3000000"
            value={formData.budgetMin}
            onChange={(event) => setFormData({ ...formData, budgetMin: event.target.value })}
          />
          <Input
            label="Max Budget"
            type="number"
            placeholder="e.g., 5000000"
            value={formData.budgetMax}
            onChange={(event) => setFormData({ ...formData, budgetMax: event.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Requirement"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function MatchingPropertiesDrawer({
  requirement,
  properties,
  loading,
  onClose,
  onSendRequirement,
  onCallBroker,
  onShareProperty,
}: {
  requirement: Requirement | null;
  properties: MatchedProperty[];
  loading: boolean;
  onClose: () => void;
  onSendRequirement: (property: MatchedProperty, requirement: Requirement) => void;
  onCallBroker: (property: MatchedProperty) => void;
  onShareProperty: (property: MatchedProperty, requirement: Requirement) => void;
}) {
  if (!requirement) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-modal sm:border-l sm:border-border">
        <div className="border-b border-border bg-primary p-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-pill border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">
                <Target size={13} />
                Property matches
              </div>
              <h2 className="line-clamp-2 text-xl font-semibold">{requirement.description}</h2>
              <p className="mt-1 text-sm text-white/70">
                {requirement.locality || requirement.city} - {requirement.propertyType} - {getBudgetText(requirement)}
              </p>
            </div>
            <button type="button" onClick={onClose} className="rounded-btn p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white" aria-label="Close matches">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4 grid grid-cols-3 gap-2">
            <RequirementMatchSignal label="Matched supply" value={properties.length} />
            <RequirementMatchSignal label="Demand Source" value={requirement.broker.name} />
            <RequirementMatchSignal label="Posted" value={new Date(requirement.createdAt).toLocaleDateString("en-IN")} />
          </div>

          {loading ? (
            <div className="flex h-72 items-center justify-center rounded-card border border-border bg-surface">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-card border border-dashed border-border bg-surface p-8 text-center">
              <Building2 size={46} className="mx-auto mb-3 text-primary" />
              <h3 className="font-semibold text-foreground">No matching property yet</h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                This is a supply gap. Use it to source inventory from the network or post a matching property when you get one.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {properties.map((property) => {
                const score = getPropertyFit(requirement, property);
                const brokerName = getMatchedPropertyBrokerName(property);
                const brokerPhone = getMatchedPropertyBrokerPhone(property);
                const imageUrl = property.coverImage || property.images?.[0] || "";

                return (
                  <div key={property.id} className="overflow-hidden rounded-card border border-border bg-surface">
                    <div className="grid gap-0 sm:grid-cols-[150px_1fr]">
                      <div className="h-36 bg-white sm:h-full">
                        {imageUrl ? (
                          <img src={imageUrl} alt={property.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-primary">
                            <Building2 size={34} />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={score.variant}>{score.label}</Badge>
                          <Badge variant="blue">{property.listingType}</Badge>
                          <Badge variant="accent">{formatPrice(property.price)}</Badge>
                        </div>
                        <h3 className="mt-3 line-clamp-1 font-semibold text-foreground">{property.title}</h3>
                        <p className="mt-1 line-clamp-1 text-sm text-text-secondary">{property.locality ? `${property.locality}, ` : ""}{property.address}, {property.city}</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                          <InfoTile label="Area" value={`${Math.round(property.area).toLocaleString()} ${property.areaUnit}`} />
                          <InfoTile label="Supply Source" value={brokerPhone ? `${brokerName} - ${brokerPhone}` : brokerName} />
                          <InfoTile label="Freshness" value={getMatchedPropertyFreshness(property.updatedAt)} highlight />
                        </div>
                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                          <Button size="sm" variant="accent" onClick={() => onSendRequirement(property, requirement)}>
                            <MessageCircle size={14} className="mr-2" />
                            Send Demand
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onCallBroker(property)}>
                            <Phone size={14} className="mr-2" />
                            Call Broker
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => onShareProperty(property, requirement)}>
                            <Share2 size={14} className="mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
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
