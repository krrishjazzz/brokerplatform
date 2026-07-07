"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Loader2,
  MessageCircle,
  Phone,
  Search,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrokerPageShell } from "@/components/broker/broker-shell";
import { InfoPill } from "@/components/broker/broker-primitives";
import {
  getRequirementBudget,
} from "@/components/broker/formatters";
import type {
  BrokerMatchedProperty,
  BrokerMatchedRequirement,
  BrokerProperty,
  BrokerRequirement,
} from "@/features/broker-exchange/types";
import {
  openPhone,
  openWhatsApp,
  trackBrokerAction,
  useBrokerAuthGuard,
  useBrokerCollaborations,
  useBrokerInventory,
  useBrokerMatches,
  useBrokerOverview,
  useBrokerRequirementsList,
} from "@/features/broker-exchange";
import { useToast } from "@/components/ui/toast";
import { cn, formatPrice } from "@/lib/utils";

type DeskMode = "property" | "requirement";

function BrokerMatchesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, loading: authLoading, isReady } = useBrokerAuthGuard();
  const { data: overview } = useBrokerOverview(isReady);
  const { collaborations } = useBrokerCollaborations(isReady);
  const { properties, loading: inventoryLoading } = useBrokerInventory({}, isReady);
  const { requirements, loading: demandLoading } = useBrokerRequirementsList({}, isReady);
  const { loading: matchesLoading, matchedRequirements, matchedProperties, loadMatches, clearMatches } = useBrokerMatches();

  const [mode, setMode] = useState<DeskMode>("property");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [selectedRequirementId, setSelectedRequirementId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const hotProperties = useMemo(
    () => properties.filter((property) => property.matchingRequirementsCount > 0),
    [properties]
  );

  const hotRequirements = useMemo(
    () => requirements.filter((requirement) => requirement.matchedPropertiesCount > 0),
    [requirements]
  );

  const listItems = mode === "property" ? hotProperties : hotRequirements;

  const filteredList = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return listItems;
    return listItems.filter((item) => {
      if ("title" in item) {
        return item.title.toLowerCase().includes(query) || item.city.toLowerCase().includes(query);
      }
      return item.description.toLowerCase().includes(query) || item.city.toLowerCase().includes(query);
    });
  }, [listItems, searchQuery]);

  const selectedProperty = properties.find((item) => item.id === selectedPropertyId) || null;
  const selectedRequirement = requirements.find((item) => item.id === selectedRequirementId) || null;

  useEffect(() => {
    const propertyId = searchParams.get("propertyId");
    const requirementId = searchParams.get("requirementId");
    if (propertyId) {
      setMode("property");
      setSelectedPropertyId(propertyId);
      void loadMatches("property", propertyId);
    } else if (requirementId) {
      setMode("requirement");
      setSelectedRequirementId(requirementId);
      void loadMatches("requirement", requirementId);
    }
  }, [searchParams, loadMatches]);

  const selectProperty = async (property: BrokerProperty) => {
    setMode("property");
    setSelectedPropertyId(property.id);
    setSelectedRequirementId("");
    clearMatches();
    await loadMatches("property", property.id);
  };

  const selectRequirement = async (requirement: BrokerRequirement) => {
    setMode("requirement");
    setSelectedRequirementId(requirement.id);
    setSelectedPropertyId("");
    clearMatches();
    await loadMatches("requirement", requirement.id);
  };

  const handleShareMatch = (
    property: BrokerMatchedProperty | BrokerProperty,
    requirement: BrokerMatchedRequirement | BrokerRequirement
  ) => {
    const message = [
      "KrrishJazz Match",
      `Property: ${property.title}`,
      `Price: ${formatPrice(property.price)} · ${property.city}`,
      "",
      `Requirement: ${requirement.description}`,
      `Budget: ${getRequirementBudget(requirement)}`,
      "",
      "Please confirm availability, brokerage terms, and visit timing.",
    ].join("\n");

    trackBrokerAction({
      propertyId: property.id,
      requirementId: requirement.id,
      eventType: "PROPERTY_SHARED",
      metadata: { channel: "WHATSAPP", source: "MATCH_DESK" },
    });

    const phone =
      "broker" in requirement && requirement.broker.phone
        ? requirement.broker.phone
        : property.sourcePhone || "";

    if (!phone || phone.includes("XXXX")) {
      toast("Broker phone not available for this match.", "error");
      return;
    }
    openWhatsApp(phone, message);
  };

  if (authLoading || !user || !isReady) return null;

  const loadingList = inventoryLoading || demandLoading;
  const hasSelection = Boolean(selectedProperty || selectedRequirement);
  const matchResults = mode === "property" ? matchedRequirements : matchedProperties;

  return (
    <BrokerPageShell
      title="Match desk"
      subtitle="Split view — pick supply or demand, then action the best fits."
    >
      <section
        className="sticky z-20 border-b border-border bg-white shadow-sm"
        style={{ top: "var(--broker-header-height, 7rem)" }}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 lg:px-6">
          <div className="relative min-h-10 flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search matches..."
              className="h-10 w-full rounded-btn border border-border pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-1 rounded-btn border border-border p-1">
            <button
              type="button"
              onClick={() => setMode("property")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold",
                mode === "property" ? "bg-primary text-white" : "text-text-secondary"
              )}
            >
              From inventory
            </button>
            <button
              type="button"
              onClick={() => setMode("requirement")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold",
                mode === "requirement" ? "bg-primary text-white" : "text-text-secondary"
              )}
            >
              From demand
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 lg:grid-cols-[340px_1fr] lg:px-6">
        <aside className="rounded-card border border-border bg-white shadow-card">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">
              {mode === "property" ? "Inventory with demand" : "Demand with supply"}
            </p>
            <p className="text-xs text-text-secondary">
              {overview?.stats.hotMatchCount || 0} hot matches network-wide
            </p>
          </div>
          <div className="max-h-[520px] overflow-y-auto p-2">
            {loadingList ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : filteredList.length === 0 ? (
              <p className="p-4 text-sm text-text-secondary">No hot matches in this view yet.</p>
            ) : (
              filteredList.map((item) => {
                const active =
                  mode === "property"
                    ? selectedPropertyId === item.id
                    : selectedRequirementId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      mode === "property"
                        ? void selectProperty(item as BrokerProperty)
                        : void selectRequirement(item as BrokerRequirement)
                    }
                    className={cn(
                      "mb-2 w-full rounded-btn border px-3 py-2 text-left transition-colors",
                      active ? "border-primary bg-primary-light" : "border-border hover:border-primary/30"
                    )}
                  >
                    {"title" in item ? (
                      <>
                        <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="text-xs text-text-secondary">
                          {item.city} · {item.matchingRequirementsCount} req matches
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="line-clamp-2 text-sm font-semibold text-foreground">{item.description}</p>
                        <p className="text-xs text-text-secondary">
                          {item.city} · {item.matchedPropertiesCount} property matches
                        </p>
                      </>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="min-w-0 rounded-card border border-border bg-white shadow-card">
          {!hasSelection ? (
            <div className="flex h-full min-h-[420px] flex-col items-center justify-center p-8 text-center">
              <Target size={48} className="mb-4 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Select a listing or requirement</h3>
              <p className="mt-2 max-w-md text-sm text-text-secondary">
                Choose from the left panel to see ranked matches, share via WhatsApp, or track collaboration status.
              </p>
              {overview?.suggestedMatches?.[0] && (
                <Button
                  className="mt-5"
                  variant="accent"
                  onClick={() => {
                    const match = overview.suggestedMatches[0];
                    setMode("property");
                    setSelectedPropertyId(match.propertyId);
                    void loadMatches("property", match.propertyId);
                  }}
                >
                  Open top suggested match
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="border-b border-border px-4 py-4">
                {selectedProperty && (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="blue">{selectedProperty.propertyType}</Badge>
                      <Badge variant="accent">{selectedProperty.matchingRequirementsCount} matches</Badge>
                    </div>
                    <h2 className="mt-2 text-lg font-semibold text-foreground">{selectedProperty.title}</h2>
                    <p className="text-sm text-text-secondary">
                      {formatPrice(selectedProperty.price)} · {selectedProperty.city}
                    </p>
                  </>
                )}
                {selectedRequirement && (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="blue">{selectedRequirement.propertyType}</Badge>
                      <Badge variant="accent">{selectedRequirement.matchedPropertiesCount} matches</Badge>
                    </div>
                    <h2 className="mt-2 text-lg font-semibold text-foreground">{selectedRequirement.description}</h2>
                    <p className="text-sm text-text-secondary">{selectedRequirement.city}</p>
                  </>
                )}
              </div>

              <div className="space-y-3 p-4">
                {matchesLoading ? (
                  <div className="flex h-48 items-center justify-center">
                    <Loader2 className="animate-spin text-primary" />
                  </div>
                ) : matchResults.length === 0 ? (
                  <p className="text-sm text-text-secondary">No exact matches. Try widening budget or locality.</p>
                ) : mode === "property" ? (
                  (matchedRequirements as BrokerMatchedRequirement[]).map((requirement) => (
                    <div key={requirement.id} className="rounded-card border border-border bg-surface p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {requirement.match && (
                          <Badge variant={requirement.match.variant}>{requirement.match.label}</Badge>
                        )}
                        <Badge variant="accent">{getRequirementBudget(requirement)}</Badge>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-foreground">{requirement.description}</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <InfoPill label="City" value={requirement.city} />
                        <InfoPill label="Broker" value={requirement.broker.name} />
                        <InfoPill label="Posted" value={new Date(requirement.createdAt).toLocaleDateString("en-IN")} />
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <Button
                          size="sm"
                          variant="accent"
                          onClick={() => selectedProperty && handleShareMatch(selectedProperty, requirement)}
                        >
                          <MessageCircle size={14} className="mr-2" />
                          WhatsApp match
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPhone(requirement.broker.phone || "")}
                        >
                          <Phone size={14} className="mr-2" />
                          Call
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/broker/requirements?q=${encodeURIComponent(requirement.description.slice(0, 30))}`)}
                        >
                          View demand
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  (matchedProperties as BrokerMatchedProperty[]).map((property) => (
                    <div key={property.id} className="rounded-card border border-border bg-surface p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {property.match && <Badge variant={property.match.variant}>{property.match.label}</Badge>}
                        <Badge variant="blue">{property.propertyType}</Badge>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-foreground">{property.title}</p>
                      <p className="text-xs text-text-secondary">
                        {formatPrice(property.price)} · {property.city}
                      </p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <Button
                          size="sm"
                          variant="accent"
                          onClick={() => selectedRequirement && handleShareMatch(property, selectedRequirement)}
                        >
                          <MessageCircle size={14} className="mr-2" />
                          WhatsApp match
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPhone(property.sourcePhone || "")}
                        >
                          <Phone size={14} className="mr-2" />
                          Call broker
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/properties/${property.slug}`)}
                        >
                          <Building2 size={14} className="mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {collaborations.length > 0 && (
            <div className="border-t border-border px-4 py-4">
              <p className="mb-2 text-xs font-semibold uppercase text-text-secondary">Pipeline</p>
              <div className="flex flex-wrap gap-2">
                {collaborations.slice(0, 6).map((item) => (
                  <Badge key={item.id} variant="default">
                    {item.status} · {item.property?.title?.slice(0, 20) || "Property"}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </BrokerPageShell>
  );
}

export default function BrokerMatchesPage() {
  return (
    <Suspense fallback={null}>
      <BrokerMatchesContent />
    </Suspense>
  );
}
