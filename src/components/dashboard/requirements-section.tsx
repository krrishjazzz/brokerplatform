"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList, Loader2, MapPin, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/utils";
import { INDIAN_CITIES, PROPERTY_TYPES } from "@/lib/constants";

interface Requirement {
  id: string;
  description: string;
  propertyType: string;
  locality?: string;
  city: string;
  budgetMin?: number;
  budgetMax?: number;
  status?: string;
  urgency?: string;
  clientSeriousness?: string;
  notes?: string | null;
  expiresAt?: string | null;
  matchedPropertiesCount?: number;
  createdAt: string;
}

export function RequirementsSection() {
  const { toast } = useToast();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [desc, setDesc] = useState("");
  const [propType, setPropType] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [urgency, setUrgency] = useState("NORMAL");
  const [clientSeriousness, setClientSeriousness] = useState("MEDIUM");
  const [notes, setNotes] = useState("");

  const fetchReqs = useCallback(() => {
    setLoading(true);
    fetch("/api/broker/requirements", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => setRequirements(data.requirements || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchReqs();
  }, [fetchReqs]);

  const allPropertyTypes = Object.values(PROPERTY_TYPES).flat();

  const handlePost = async () => {
    if (!desc || !propType || !city) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/broker/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          description: desc,
          propertyType: propType,
          locality,
          city,
          budgetMin: budgetMin ? Number(budgetMin) : undefined,
          budgetMax: budgetMax ? Number(budgetMax) : undefined,
          urgency,
          clientSeriousness,
          notes,
        }),
      });
      if (res.ok) {
        setDesc("");
        setPropType("");
        setLocality("");
        setCity("");
        setBudgetMin("");
        setBudgetMax("");
        setUrgency("NORMAL");
        setClientSeriousness("MEDIUM");
        setNotes("");
        setShowForm(false);
        fetchReqs();
        toast("Requirement posted.", "success");
      }
    } catch {
      toast("Failed to post requirement.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Requirements</h2>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "ghost" : "primary"} size="sm">
          {showForm ? "Cancel" : <><PlusCircle size={14} className="mr-1.5" /> Add Requirement</>}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-card shadow-card border border-border p-6 mb-6">
          <div className="space-y-4">
            <Textarea
              label="Description"
              placeholder="Describe the requirement..."
              value={desc}
              onChange={(event) => setDesc(event.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Property Type"
                options={allPropertyTypes.map((type) => ({ value: type, label: type }))}
                value={propType}
                onChange={(event) => setPropType(event.target.value)}
              />
              <Select
                label="City"
                options={[{ value: "", label: "Select city" }, ...INDIAN_CITIES.map((cityOption) => ({ value: cityOption, label: cityOption }))]}
                value={city}
                onChange={(event) => setCity(event.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Locality" placeholder="e.g. Salt Lake, Andheri" value={locality} onChange={(event) => setLocality(event.target.value)} />
              <Select
                label="Urgency"
                options={[
                  { value: "NORMAL", label: "Normal" },
                  { value: "HIGH", label: "High" },
                  { value: "HOT", label: "Hot client" },
                  { value: "LOW", label: "Low priority" },
                ]}
                value={urgency}
                onChange={(event) => setUrgency(event.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Min Budget (Rs)" type="number" placeholder="e.g. 5000000" value={budgetMin} onChange={(event) => setBudgetMin(event.target.value)} />
              <Input label="Max Budget (Rs)" type="number" placeholder="e.g. 15000000" value={budgetMax} onChange={(event) => setBudgetMax(event.target.value)} />
              <Select
                label="Client Seriousness"
                options={[
                  { value: "MEDIUM", label: "Medium" },
                  { value: "HIGH", label: "High" },
                  { value: "VERIFIED", label: "Verified by KJ" },
                  { value: "LOW", label: "Low" },
                ]}
                value={clientSeriousness}
                onChange={(event) => setClientSeriousness(event.target.value)}
              />
            </div>
            <Textarea
              label="Internal Notes"
              placeholder="Client timing, preferred towers, visit window, broker terms..."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
            <Button onClick={handlePost} loading={submitting} disabled={!desc || !propType || !city}>
              Post Requirement
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : requirements.length === 0 ? (
        <div className="bg-white rounded-card shadow-card p-8 text-center border border-border">
          <ClipboardList size={48} className="mx-auto text-text-secondary mb-3" />
          <p className="text-text-secondary">No requirements posted yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requirements.map((requirement) => (
            <div key={requirement.id} className="bg-white rounded-card shadow-card border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{requirement.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="blue">{requirement.propertyType}</Badge>
                    {requirement.urgency && (
                      <Badge variant={requirement.urgency === "HOT" ? "error" : requirement.urgency === "HIGH" ? "warning" : "default"}>
                        {requirement.urgency}
                      </Badge>
                    )}
                    {requirement.status && <Badge variant="default">{requirement.status}</Badge>}
                    <Badge variant="default">
                      <MapPin size={12} className="mr-1" /> {requirement.locality ? `${requirement.locality}, ` : ""}{requirement.city}
                    </Badge>
                    {(requirement.budgetMin || requirement.budgetMax) && (
                      <Badge variant="accent">
                        {requirement.budgetMin ? formatPrice(requirement.budgetMin) : "Any"} - {requirement.budgetMax ? formatPrice(requirement.budgetMax) : "Any"}
                      </Badge>
                    )}
                    {typeof requirement.matchedPropertiesCount === "number" && (
                      <Badge variant={requirement.matchedPropertiesCount > 0 ? "success" : "warning"}>
                        {requirement.matchedPropertiesCount} matches
                      </Badge>
                    )}
                  </div>
                  {requirement.notes && <p className="mt-3 text-sm text-text-secondary line-clamp-2">{requirement.notes}</p>}
                </div>
                <p className="text-xs text-text-secondary shrink-0">
                  {new Date(requirement.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
