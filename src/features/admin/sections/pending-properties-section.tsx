"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  EmptyState,
  SectionHeader,
  Skeleton,
} from "@/components/admin/admin-primitives";
import { PropertyOpsModal } from "@/components/admin/property-ops-modal";
import { formatPrice } from "@/lib/utils";

export function PendingPropertiesSection() {
  const { toast } = useToast();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [opsPropertyId, setOpsPropertyId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProps = useCallback(async () => {
    try {
      const res = await fetch("/api/properties?status=PENDING_REVIEW&limit=50");
      const data = await res.json();
      setProperties(data.properties || []);
    } catch {
      toast("Could not load pending properties.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchProps(); }, [fetchProps]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/properties/${id}/approve`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast(err?.error || "Property approval failed.", "error");
        return;
      }
      setProperties((prev) => prev.filter((p) => p.id !== id));
      toast("Property approved and moved live.", "success");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/properties/${rejectModal}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast(err?.error || "Property rejection failed.", "error");
        return;
      }
      setProperties((prev) => prev.filter((p) => p.id !== rejectModal));
      setRejectModal(null);
      setRejectReason("");
      toast("Property rejected with review note.", "success");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Verification queue"
        title="Pending Properties"
        description="Review property quality, owner details, images, and price signals before a listing becomes visible to buyers."
        right={<Badge variant="blue">{properties.length} waiting</Badge>}
      />

      {loading ? (
        <Skeleton />
      ) : properties.length === 0 ? (
        <EmptyState title="No pending properties" description="The listing queue is clear. New owner uploads will appear here for trust review." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Title</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Type</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">City</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Price</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Posted By</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">{p.title}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.propertyType}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.city}</td>
                  <td className="px-4 py-3 text-foreground font-medium">{formatPrice(Number(p.price))}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.postedBy?.name || "Unknown"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setOpsPropertyId(p.id)}>
                        <Eye size={14} className="mr-1" /> Ops
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => window.open(`/properties/${p.slug}`, "_blank")}>
                        <ExternalLink size={14} className="mr-1" /> Public
                      </Button>
                      <Button size="sm" onClick={() => handleApprove(p.id)} loading={actionLoading}>
                        <CheckCircle size={14} className="mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setRejectModal(p.id)}>
                        <XCircle size={14} className="mr-1" /> Reject
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
        onChanged={fetchProps}
      />

      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Property">
        <div className="space-y-4">
          <Textarea
            label="Rejection Reason"
            placeholder="Why is this property being rejected?"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button onClick={handleReject} loading={actionLoading}>Reject</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

