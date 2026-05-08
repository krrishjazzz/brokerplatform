"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  MapPin,
  Phone,
  MessageSquare,
  Search,
  Loader2,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatPrice } from "@/lib/utils";
import {
  PROPERTY_TYPES,
  INDIAN_STATES,
} from "@/lib/constants";

interface Requirement {
  id: string;
  description: string;
  propertyType: string;
  city: string;
  budgetMin: number | null;
  budgetMax: number | null;
  createdAt: string;
  broker: {
    name: string;
    phone: string;
  };
}

export default function BrokerRequirementsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [selectedUrgency, setSelectedUrgency] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    description: "",
    propertyType: "",
    city: "",
    budgetMin: "",
    budgetMax: "",
  });

  const fetchRequirements = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedPropertyType) params.set("propertyType", selectedPropertyType);
      if (selectedCity) params.set("city", selectedCity);
      if (minBudget) params.set("minBudget", minBudget);
      if (maxBudget) params.set("maxBudget", maxBudget);
      if (selectedUrgency) params.set("urgency", selectedUrgency);

      const res = await fetch(`/api/broker/requirements?${params}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setRequirements(data.requirements);
      }
    } catch (error) {
      console.error("Failed to fetch requirements:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedPropertyType, selectedCity, minBudget, maxBudget, selectedUrgency]);

  useEffect(() => {
    if (user?.role === "BROKER" && user.brokerStatus === "APPROVED") {
      fetchRequirements();
    } else {
      router.push("/login");
    }
  }, [user, router, fetchRequirements]);

  const handleCallBroker = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleWhatsApp = (phone: string, requirement: Requirement) => {
    const message = `Hi, regarding your requirement: ${requirement.description} in ${requirement.city}`;
    window.open(`https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleMatchProperty = (requirement: Requirement) => {
    // Could navigate to properties page with filters matching the requirement
    router.push(`/broker/properties?city=${requirement.city}&propertyType=${requirement.propertyType}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedPropertyType("");
    setSelectedCity("");
    setMinBudget("");
    setMaxBudget("");
    setSelectedUrgency("");
  };

  const handleSubmitRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.propertyType || !formData.city) {
      alert("Please fill in description, property type, and city");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/broker/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          description: formData.description,
          propertyType: formData.propertyType,
          city: formData.city,
          budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : undefined,
          budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : undefined,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          description: "",
          propertyType: "",
          city: "",
          budgetMin: "",
          budgetMax: "",
        });
        fetchRequirements(); // Refresh the list
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add requirement");
      }
    } catch (error) {
      console.error("Failed to add requirement:", error);
      alert("Failed to add requirement");
    } finally {
      setSubmitting(false);
    }
  };

  const getUrgencyBadge = (createdAt: string) => {
    const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (days < 7) return { label: "New", variant: "success" as const, icon: CheckCircle };
    if (days < 30) return { label: "Recent", variant: "default" as const, icon: Clock };
    return { label: "Old", variant: "warning" as const, icon: AlertCircle };
  };

  if (!user || user.role !== "BROKER" || user.brokerStatus !== "APPROVED") {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Broker Requirements</h1>
            <p className="text-text-secondary">Broker collaboration network - find leads and match properties</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Add Requirement
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-card border border-border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
            <div className="relative md:col-span-2">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
              <Input
                placeholder="Search requirements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={selectedPropertyType}
              onChange={(e) => setSelectedPropertyType(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Property Types</option>
              {Object.values(PROPERTY_TYPES).flat().map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Cities</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Any Age</option>
              <option value="new">New: 0-7 days</option>
              <option value="recent">Recent: 8-30 days</option>
              <option value="old">Old: 30+ days</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              disabled={!searchQuery && !selectedPropertyType && !selectedCity && !minBudget && !maxBudget && !selectedUrgency}
              className="h-10"
            >
              Clear Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <Input
              type="number"
              placeholder="Min Budget"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max Budget"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
            />
            <div className="flex items-center text-sm text-text-secondary md:col-span-2">
              Showing {requirements.length} matching requirement{requirements.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        {/* Requirements Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : requirements.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-text-secondary mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No requirements found</h3>
            <p className="text-text-secondary">Requirements posted by brokers will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {requirements.map((requirement) => (
              <RequirementCard
                key={requirement.id}
                requirement={requirement}
                onCallBroker={handleCallBroker}
                onWhatsApp={handleWhatsApp}
                onMatchProperty={handleMatchProperty}
                getUrgencyBadge={getUrgencyBadge}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Requirement Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Requirement"
      >
        <form onSubmit={handleSubmitRequirement} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description *
            </label>
            <Textarea
              placeholder="e.g., Need 2BHK apartment in Kolkata under 50 lakhs"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Property Type *
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                required
                className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select Property Type</option>
                {Object.values(PROPERTY_TYPES).flat().map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                City *
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                className="w-full px-3 py-2 border border-border rounded-btn text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select City</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Min Budget (₹)
              </label>
              <Input
                type="number"
                placeholder="e.g., 3000000"
                value={formData.budgetMin}
                onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Max Budget (₹)
              </label>
              <Input
                type="number"
                placeholder="e.g., 5000000"
                value={formData.budgetMax}
                onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(false)}
              disabled={submitting}
            >
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
    </div>
  );
}

interface RequirementCardProps {
  requirement: Requirement;
  onCallBroker: (phone: string) => void;
  onWhatsApp: (phone: string, requirement: Requirement) => void;
  onMatchProperty: (requirement: Requirement) => void;
  getUrgencyBadge: (createdAt: string) => { label: string; variant: "success" | "default" | "warning"; icon: any };
}

function RequirementCard({ requirement, onCallBroker, onWhatsApp, onMatchProperty, getUrgencyBadge }: RequirementCardProps) {
  const urgency = getUrgencyBadge(requirement.createdAt);
  const UrgencyIcon = urgency.icon;

  const budgetText = requirement.budgetMin && requirement.budgetMax
    ? `${formatPrice(Number(requirement.budgetMin))} - ${formatPrice(Number(requirement.budgetMax))}`
    : requirement.budgetMin
    ? `Above ${formatPrice(Number(requirement.budgetMin))}`
    : requirement.budgetMax
    ? `Up to ${formatPrice(Number(requirement.budgetMax))}`
    : "Budget not specified";

  return (
    <div className="bg-white rounded-card border border-border overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{requirement.description}</h3>
            <div className="flex items-center gap-1 text-sm text-text-secondary mb-2">
              <MapPin size={14} />
              {requirement.city}
            </div>
          </div>
          <Badge variant={urgency.variant} className="flex items-center gap-1">
            <UrgencyIcon size={12} />
            {urgency.label}
          </Badge>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4">
          <div className="text-sm">
            <span className="font-medium text-foreground">Property Type: </span>
            <span className="text-text-secondary">{requirement.propertyType}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium text-foreground">Budget: </span>
            <span className="text-text-secondary">{budgetText}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium text-foreground">Posted: </span>
            <span className="text-text-secondary">{new Date(requirement.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Posted By */}
        <div className="border-t border-border pt-4 mb-4">
          <div className="text-sm">
            <span className="font-medium text-foreground">Posted By: </span>
            <span className="text-text-secondary">{requirement.broker.name}</span>
          </div>
          <div className="text-sm mt-1">
            <span className="font-medium text-foreground">Phone: </span>
            <span className="text-text-secondary">{requirement.broker.phone}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCallBroker(requirement.broker.phone)}
            className="flex-1"
          >
            <Phone size={14} className="mr-1" />
            Call
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onWhatsApp(requirement.broker.phone, requirement)}
            className="flex-1"
          >
            <MessageSquare size={14} className="mr-1" />
            WhatsApp
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onMatchProperty(requirement)}
            className="flex-1"
          >
            Match Property
          </Button>
        </div>
      </div>
    </div>
  );
}
