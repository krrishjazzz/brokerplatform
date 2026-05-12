"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle, ExternalLink, ImageIcon, MapPin, RefreshCw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  EmptyOpsText,
  formatDateTime,
  OpsMiniStat,
  OpsPanel,
  PersonBlock,
  readableStatus,
  Skeleton,
  TimelineRow,
  adminStatusVariant,
} from "@/components/admin/admin-primitives";
import { formatPrice } from "@/lib/utils";
import { getVisibilityLabel } from "@/lib/visibility";

export function PropertyOpsModal({
  propertyId,
  isOpen,
  onClose,
  onChanged,
}: {
  propertyId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { toast } = useToast();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [opsNote, setOpsNote] = useState("");

  const loadDetail = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setDetail(data.property);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    if (isOpen) loadDetail();
  }, [isOpen, loadDetail]);

  const runAction = async (action: "approve" | "reject" | "AVAILABLE" | "ON_HOLD" | "CLOSED") => {
    if (!detail) return;
    setActionLoading(true);
    try {
      let res: Response;
      if (action === "approve") {
        res = await fetch(`/api/admin/properties/${detail.id}/approve`, { method: "POST", credentials: "include" });
      } else if (action === "reject") {
        res = await fetch(`/api/admin/properties/${detail.id}/reject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ reason: opsNote || "Rejected during ops review" }),
        });
      } else {
        res = await fetch(`/api/properties/${detail.slug}/freshness`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ listingStatus: action, note: opsNote || "Updated from admin ops detail" }),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast(err?.error || "Action failed", "error");
        return;
      }

      setOpsNote("");
      await loadDetail();
      onChanged();
      toast("Property action completed.", "success");
    } finally {
      setActionLoading(false);
    }
  };

  const images: string[] = detail?.images || [];
  const latestFreshness = detail?.freshnessHistory?.[0] || null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Property Ops Detail" className="max-w-6xl">
      {loading || !detail ? (
        <Skeleton />
      ) : (
        <div className="space-y-5">
          <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
            <div className="overflow-hidden rounded-card border border-border bg-surface">
              {images[0] || detail.coverImage ? (
                <img src={images[0] || detail.coverImage} alt={detail.title} className="h-64 w-full object-cover" />
              ) : (
                <div className="flex h-64 items-center justify-center text-primary">
                  <ImageIcon size={46} />
                </div>
              )}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-1 p-2">
                  {images.slice(1, 5).map((image, index) => (
                    <img key={`${image}-${index}`} src={image} alt={`Property ${index + 2}`} className="h-16 w-full rounded-btn object-cover" />
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-card border border-border bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge variant={adminStatusVariant(detail.status) as any}>{readableStatus(detail.status)}</Badge>
                    <Badge variant={adminStatusVariant(detail.listingStatus) as any}>{readableStatus(detail.listingStatus)}</Badge>
                    <Badge variant="blue">{getVisibilityLabel(detail.visibilityType)}</Badge>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{detail.title}</h2>
                  <p className="mt-2 flex items-center gap-1 text-sm text-text-secondary">
                    <MapPin size={14} className="text-primary" />
                    {detail.locality ? `${detail.locality}, ` : ""}{detail.city}, {detail.state}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase text-text-secondary">Asking price</p>
                  <p className="text-2xl font-bold text-primary">{formatPrice(detail.price)}</p>
                  <p className="text-xs text-text-secondary">{detail.area?.toLocaleString("en-IN")} {detail.areaUnit}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <OpsMiniStat label="Enquiries" value={detail._count?.enquiries || 0} />
                <OpsMiniStat label="Saved" value={detail._count?.saved || 0} />
                <OpsMiniStat label="Collabs" value={detail._count?.collaborations || 0} />
                <OpsMiniStat label="Freshness" value={latestFreshness ? readableStatus(latestFreshness.availabilityStatus) : "Missing"} />
              </div>

              <div className="mt-4 rounded-card border border-border bg-surface p-3">
                <p className="text-xs font-semibold uppercase text-text-secondary">Ops note</p>
                <Textarea
                  className="mt-2"
                  placeholder="Availability proof, verification comment, rejection reason..."
                  value={opsNote}
                  onChange={(event) => setOpsNote(event.target.value)}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => runAction("approve")} loading={actionLoading}>
                  <CheckCircle size={14} className="mr-1" /> Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => runAction("AVAILABLE")} loading={actionLoading}>
                  <RefreshCw size={14} className="mr-1" /> Available
                </Button>
                <Button size="sm" variant="ghost" onClick={() => runAction("ON_HOLD")} loading={actionLoading}>Hold</Button>
                <Button size="sm" variant="ghost" onClick={() => runAction("CLOSED")} loading={actionLoading}>Closed</Button>
                <Button size="sm" variant="ghost" onClick={() => runAction("reject")} loading={actionLoading}>
                  <XCircle size={14} className="mr-1" /> Reject
                </Button>
                <Button size="sm" variant="ghost" onClick={() => window.open(`/properties/${detail.slug}`, "_blank")}>
                  <ExternalLink size={14} className="mr-1" /> Public Page
                </Button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <OpsPanel title="People">
              <PersonBlock title="Posted By" person={detail.postedBy} />
              <PersonBlock title="Assigned Broker" person={detail.assignedBroker} />
            </OpsPanel>

            <OpsPanel title="Freshness History">
              {detail.freshnessHistory?.length ? (
                detail.freshnessHistory.map((item: any) => (
                  <TimelineRow
                    key={item.id}
                    title={readableStatus(item.availabilityStatus)}
                    meta={`${formatDateTime(item.confirmedAt)} by ${item.confirmedBy?.name || "System"}`}
                    note={item.note}
                    variant={adminStatusVariant(item.availabilityStatus)}
                  />
                ))
              ) : (
                <EmptyOpsText text="No freshness checks recorded." />
              )}
            </OpsPanel>

            <OpsPanel title="Managed Enquiries">
              {detail.enquiries?.length ? (
                detail.enquiries.map((enquiry: any) => (
                  <TimelineRow
                    key={enquiry.id}
                    title={enquiry.name || enquiry.customer?.name || "Customer enquiry"}
                    meta={`${enquiry.phone || enquiry.customer?.phone || "No phone"} - ${formatDateTime(enquiry.createdAt)}`}
                    note={enquiry.message}
                    variant={adminStatusVariant(enquiry.status)}
                  />
                ))
              ) : (
                <EmptyOpsText text="No managed enquiries yet." />
              )}
            </OpsPanel>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <OpsPanel title="Collaborations">
              {detail.collaborations?.length ? (
                detail.collaborations.map((collab: any) => (
                  <TimelineRow
                    key={collab.id}
                    title={collab.requirement?.description || collab.lastAction}
                    meta={`${readableStatus(collab.status)} - ${collab.initiator?.name || "Broker"} to ${collab.recipient?.name || "Network"}`}
                    note={collab.requirement ? `${collab.requirement.locality ? `${collab.requirement.locality}, ` : ""}${collab.requirement.city} - ${collab.requirement.propertyType}` : collab.source}
                    variant={adminStatusVariant(collab.status)}
                  />
                ))
              ) : (
                <EmptyOpsText text="No broker collaborations yet." />
              )}
            </OpsPanel>

            <OpsPanel title="Activity Trail">
              {detail.activity?.length ? (
                detail.activity.map((event: any) => (
                  <TimelineRow
                    key={event.id}
                    title={readableStatus(event.eventType)}
                    meta={`${formatDateTime(event.createdAt)} by ${event.actor?.name || "System"}`}
                    note={event.metadata?.source || event.metadata?.channel || event.metadata?.reason || ""}
                    variant="default"
                  />
                ))
              ) : (
                <EmptyOpsText text="No activity events yet." />
              )}
            </OpsPanel>
          </section>
        </div>
      )}
    </Modal>
  );
}
