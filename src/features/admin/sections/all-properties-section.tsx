"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  LayoutDashboard,
  Building,
  Clock,
  Users,
  UserCheck,
  MessageSquare,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  Activity,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  EmptyState,
  SearchBox,
  SectionHeader,
  Skeleton,
  parseServiceAreas,
} from "@/components/admin/admin-primitives";
import { PropertyOpsModal } from "@/components/admin/property-ops-modal";
import { cn, formatPrice } from "@/lib/utils";

export function AllPropertiesSection() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [opsPropertyId, setOpsPropertyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const fetchProperties = useCallback(() => {
    setLoading(true);
    fetch("/api/properties?limit=50&allStatuses=true")
      .then((r) => r.json())
      .then((data) => setProperties(data.properties || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const statusVariant = (s: string) => {
    switch (s) {
      case "LIVE": return "success";
      case "PENDING_REVIEW": return "warning";
      case "REJECTED": return "error";
      case "SOLD": return "blue";
      default: return "default";
    }
  };

  const filteredProperties = useMemo(() => properties.filter((p) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [p.title, p.propertyType, p.city, p.locality, p.status]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(needle));
  }), [properties, query]);

  return (
    <div>
      <SectionHeader
        eyebrow="Inventory"
        title="All Properties"
        description="Scan live, pending, rejected, and closed inventory from one place, then open detailed ops controls when needed."
        right={<SearchBox value={query} onChange={setQuery} placeholder="Search title, city, type..." />}
      />
      {loading ? (
        <Skeleton />
      ) : filteredProperties.length === 0 ? (
        <EmptyState title="No properties found" description="Try a different search term or clear the filter to see the full inventory." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Title</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Type</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">City</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Price</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Status</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">{p.title}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.propertyType}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.city}</td>
                  <td className="px-4 py-3 text-foreground font-medium">{formatPrice(Number(p.price))}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(p.status) as any}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setOpsPropertyId(p.id)}>
                        <Eye size={14} className="mr-1" /> Ops
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => window.open(`/properties/${p.slug}`, "_blank")}>
                        <ExternalLink size={14} className="mr-1" /> Public
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <PropertyOpsModal
        propertyId={opsPropertyId}
        isOpen={!!opsPropertyId}
        onClose={() => setOpsPropertyId(null)}
        onChanged={fetchProperties}
      />
    </div>
  );
}

/* ---------- Pending Brokers ---------- */
