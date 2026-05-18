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

export function PendingBrokersSection() {
  const { toast } = useToast();
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/brokers?status=PENDING")
      .then((r) => r.json())
      .then((data) => setBrokers(data.brokers || []))
      .catch(() => toast("Could not load broker applications.", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/brokers/${id}/approve`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast(err?.error || "Broker approval failed.", "error");
        return;
      }
      setBrokers((prev) => prev.filter((b) => b.id !== id));
      toast("Broker approved for KrrishJazz network.", "success");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/brokers/${rejectModal}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast(err?.error || "Broker rejection failed.", "error");
        return;
      }
      setBrokers((prev) => prev.filter((b) => b.id !== rejectModal));
      setRejectModal(null);
      setRejectReason("");
      toast("Broker application rejected.", "success");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Broker trust"
        title="Pending Broker Applications"
        description="Approve brokers only after checking RERA, city coverage, experience, and service areas."
        right={<Badge variant="blue">{brokers.length} applications</Badge>}
      />

      {loading ? (
        <Skeleton />
      ) : brokers.length === 0 ? (
        <EmptyState title="No pending applications" description="The broker onboarding queue is clear for now." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Name</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">RERA</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Experience</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">City</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Service Areas</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brokers.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{b.profile?.name || "--"}</td>
                  <td className="px-4 py-3 text-text-secondary">{b.profile?.phone}</td>
                  <td className="px-4 py-3 text-text-secondary">{b.rera}</td>
                  <td className="px-4 py-3 text-text-secondary">{b.experience} years</td>
                  <td className="px-4 py-3 text-text-secondary">{b.city}</td>
                  <td className="px-4 py-3 text-text-secondary max-w-[180px] truncate">{parseServiceAreas(b.serviceAreas).join(", ") || b.city}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleApprove(b.id)} loading={actionLoading}>
                        <CheckCircle size={14} className="mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setRejectModal(b.id)}>
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

      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Broker">
        <div className="space-y-4">
          <Textarea
            label="Rejection Reason"
            placeholder="Why is this application being rejected?"
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

/* ---------- All Users ---------- */
