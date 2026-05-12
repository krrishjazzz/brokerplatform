"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Eye, MessageCircle, Phone, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  EmptyOpsText,
  EmptyState,
  formatDateTime,
  OpsMiniStat,
  readableStatus,
  SearchBox,
  SectionHeader,
  Skeleton,
  TimelineRow,
} from "@/components/admin/admin-primitives";
import { formatPrice } from "@/lib/utils";

const LEAD_STATUS_FLOW = [
  { value: "NEW", label: "New", hint: "Fresh enquiry" },
  { value: "CONTACTED", label: "Contacted", hint: "Callback done" },
  { value: "VISIT_SCHEDULED", label: "Visit Scheduled", hint: "Site visit fixed" },
  { value: "NEGOTIATING", label: "Negotiating", hint: "Deal discussion" },
  { value: "CLOSED", label: "Closed", hint: "Brokerage won" },
  { value: "LOST", label: "Lost", hint: "Dropped lead" },
];
/* ---------- All Leads ---------- */
export function AllLeadsSection() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [searchRequirements, setSearchRequirements] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  const fetchLeads = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/leads").then((r) => r.json()),
      fetch("/api/admin/search-requirements").then((r) => r.json()).catch(() => ({ requirements: [] })),
    ])
      .then(([leadData, requirementData]) => {
        setLeads(leadData.leads || []);
        setSearchRequirements(requirementData.requirements || []);
      })
      .catch(() => toast("Could not load leads.", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const leadStatusVariant = (status: string) => {
    if (status === "NEW") return "blue";
    if (status === "CONTACTED" || status === "VISIT_SCHEDULED" || status === "NEGOTIATING" || status === "CLOSED") return "success";
    if (status === "LOST") return "error";
    return "default";
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    setUpdatingLeadId(leadId);
    try {
      const note = noteDrafts[leadId]?.trim();
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, note }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast(data?.error || "Could not update lead status.", "error");
        return;
      }
      setLeads((current) => current.map((lead) => (lead.id === leadId ? data.lead : lead)));
      if (note) setNoteDrafts((current) => ({ ...current, [leadId]: "" }));
      toast(`Lead moved to ${readableStatus(status).toLowerCase()}.`, "success");
    } catch {
      toast("Could not update lead status.", "error");
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const addLeadNote = async (leadId: string) => {
    const note = noteDrafts[leadId]?.trim();
    if (!note) {
      toast("Write a note before saving.", "error");
      return;
    }

    setUpdatingLeadId(leadId);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ note }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast(data?.error || "Could not save lead note.", "error");
        return;
      }
      setLeads((current) => current.map((lead) => (lead.id === leadId ? data.lead : lead)));
      setNoteDrafts((current) => ({ ...current, [leadId]: "" }));
      toast("Lead note saved.", "success");
    } catch {
      toast("Could not save lead note.", "error");
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const updateLeadFollowUp = async (leadId: string, payload: Record<string, unknown>) => {
    setUpdatingLeadId(leadId);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast(data?.error || "Could not update follow-up.", "error");
        return;
      }
      setLeads((current) => current.map((lead) => (lead.id === leadId ? data.lead : lead)));
      setSelectedLead(data.lead);
      toast("Follow-up updated.", "success");
    } catch {
      toast("Could not update follow-up.", "error");
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const callLead = (lead: any) => {
    if (!lead.phone) {
      toast("Lead phone is not available.", "error");
      return;
    }
    window.open(`tel:${lead.phone}`, "_self");
  };

  const whatsAppLead = (lead: any) => {
    if (!lead.phone) {
      toast("Lead WhatsApp number is not available.", "error");
      return;
    }
    const message = [
      `Hi ${lead.name || "there"}, this is KrrishJazz.`,
      lead.property?.title ? `About: ${lead.property.title}` : "About your property requirement.",
      "Please confirm your requirement, budget, and suitable callback/visit time.",
    ].join("\n");
    window.open(`https://wa.me/${String(lead.phone).replace(/^\+/, "")}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const filteredLeads = useMemo(() => leads.filter((l) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [l.name, l.phone, l.property?.title, l.message, l.status]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(needle));
  }), [leads, query]);

  const statusCounts = useMemo(() => {
    const countByStatus = leads.reduce<Record<string, number>>((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});
    return LEAD_STATUS_FLOW.map((status) => ({
      ...status,
      count: countByStatus[status.value] || 0,
    }));
  }, [leads]);

  const priorityLeads = useMemo(
    () => [...leads].sort((a, b) => getLeadPriorityScore(b) - getLeadPriorityScore(a)).slice(0, 5),
    [leads]
  );

  return (
    <div>
      <SectionHeader
        eyebrow="Customer demand"
        title="All Leads / Enquiries"
        description="Track buyer and tenant enquiries so managed callbacks stay clean and fast."
        right={<SearchBox value={query} onChange={setQuery} placeholder="Search lead, phone, property..." />}
      />
      {loading ? (
        <Skeleton />
      ) : filteredLeads.length === 0 && searchRequirements.length === 0 ? (
        <EmptyState title="No enquiries found" description="New customer enquiries and matching requests will appear here." />
      ) : (
        <div className="space-y-4">
          {searchRequirements.length > 0 && (
            <div className="rounded-card border border-primary/20 bg-primary-light p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-primary">Assisted search requests</p>
                  <p className="text-xs text-text-secondary">Captured when customers could not find an exact property match.</p>
                </div>
                <Badge variant="blue">{searchRequirements.length} open</Badge>
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                {searchRequirements.slice(0, 6).map((request) => (
                  <div key={request.id} className="rounded-card border border-border bg-white p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{request.name}</p>
                        <p className="mt-1 text-xs text-text-secondary">{request.phone}</p>
                      </div>
                      <Badge variant="warning">{readableStatus(request.urgency || "NEW")}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-foreground">
                      {request.requirementType || "Property"} in {[request.locality, request.city].filter(Boolean).join(", ") || "city pending"}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      Budget: {request.budgetMax ? formatPrice(Number(request.budgetMax)) : "Ask"} Â· {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                    {request.note && <p className="mt-2 line-clamp-2 text-xs leading-5 text-text-secondary">{request.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {statusCounts.map((status) => (
              <div key={status.value} className="rounded-card border border-border bg-white p-3 shadow-card">
                <p className="text-xl font-bold text-foreground">{status.count}</p>
                <p className="mt-1 text-xs font-semibold text-foreground">{status.label}</p>
                <p className="mt-0.5 text-[11px] text-text-secondary">{status.hint}</p>
              </div>
            ))}
          </div>

          {priorityLeads.length > 0 && (
            <div className="rounded-card border border-warning/20 bg-warning-light p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Ops priority queue</p>
                  <p className="text-xs text-text-secondary">Leads scored by freshness, status, visit date, and note completeness.</p>
                </div>
                <Badge variant="warning">{priorityLeads.length} to review</Badge>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-5">
                {priorityLeads.map((lead) => (
                  <div key={lead.id} className="rounded-btn border border-border bg-white p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-1 text-sm font-semibold text-foreground">{lead.name}</p>
                      <Badge variant={leadStatusVariant(lead.status) as any}>{getLeadPriorityScore(lead)}</Badge>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-text-secondary">{lead.property?.title || lead.message || "General enquiry"}</p>
                    <p className="mt-2 text-[11px] font-semibold text-primary">{getLeadNextAction(lead)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-3 lg:hidden">
            {filteredLeads.map((l) => (
              <div key={l.id} className="rounded-card border border-border bg-white p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-1 font-semibold text-foreground">{l.name}</p>
                    <p className="mt-1 text-sm text-text-secondary">{l.phone}</p>
                  </div>
                  <Badge variant={leadStatusVariant(l.status) as any}>{readableStatus(l.status)}</Badge>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-foreground">{l.property?.title || l.message || "General enquiry"}</p>
                <p className="mt-2 text-xs font-semibold text-primary">{getLeadNextAction(l)}</p>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Button size="sm" variant="accent" onClick={() => callLead(l)}>
                    <Phone size={14} className="mr-1" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => whatsAppLead(l)}>
                    <MessageCircle size={14} className="mr-1" />
                    WA
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedLead(l)}>
                    <Eye size={14} className="mr-1" />
                    Detail
                  </Button>
                </div>

                <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                  <select
                    value={l.status}
                    disabled={updatingLeadId === l.id}
                    onChange={(event) => updateLeadStatus(l.id, event.target.value)}
                    className="min-h-10 rounded-btn border border-border bg-surface px-3 text-xs font-semibold text-foreground outline-none focus:border-primary disabled:opacity-60"
                  >
                    {LEAD_STATUS_FLOW.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                  <Button size="sm" onClick={() => addLeadNote(l.id)} loading={updatingLeadId === l.id}>
                    Save
                  </Button>
                </div>
                <Textarea
                  placeholder="Quick note after call..."
                  value={noteDrafts[l.id] || ""}
                  onChange={(event) => setNoteDrafts((current) => ({ ...current, [l.id]: event.target.value }))}
                  className="mt-2 min-h-20 bg-surface"
                />
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-card border border-border bg-white shadow-card lg:block">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Name</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Property</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Message</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Status</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Pipeline</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Latest Note</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Date</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Detail</th>
              </tr>
              </thead>
              <tbody>
              {filteredLeads.map((l) => (
                <Fragment key={l.id}>
                  <tr className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{l.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{l.phone}</td>
                    <td className="px-4 py-3 text-text-secondary max-w-[150px] truncate">{l.property?.title || "--"}</td>
                    <td className="px-4 py-3 text-text-secondary max-w-[200px] truncate">{l.message || "--"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={leadStatusVariant(l.status) as any}>
                        {readableStatus(l.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={l.status}
                        disabled={updatingLeadId === l.id}
                        onChange={(event) => updateLeadStatus(l.id, event.target.value)}
                        className="min-w-40 rounded-btn border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60"
                      >
                        {LEAD_STATUS_FLOW.map((status) => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-text-secondary max-w-[220px]">
                      <p className="line-clamp-2">{l.latestNote || "--"}</p>
                      {l.latestNoteActorName && <p className="mt-1 text-[11px] text-text-secondary">By {l.latestNoteActorName}</p>}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedLead(l)}>
                        <Eye size={14} className="mr-1" />
                        Detail
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-b border-border bg-surface/45">
                    <td colSpan={9} className="px-4 py-3">
                      <div className="flex flex-col gap-2 lg:flex-row lg:items-start">
                        <Textarea
                          placeholder="Add ops note: called buyer, visit fixed, owner confirmed, price discussed..."
                          value={noteDrafts[l.id] || ""}
                          onChange={(event) => setNoteDrafts((current) => ({ ...current, [l.id]: event.target.value }))}
                          className="min-h-20 flex-1 bg-white"
                        />
                        <Button size="sm" onClick={() => addLeadNote(l.id)} loading={updatingLeadId === l.id} className="lg:mt-1">
                          Save Note
                        </Button>
                      </div>
                    </td>
                  </tr>
                </Fragment>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <LeadDetailDrawer
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdate={updateLeadFollowUp}
        updating={!!selectedLead && updatingLeadId === selectedLead.id}
      />
    </div>
  );
}

function getLeadPriorityScore(lead: any) {
  let score = 20;
  if (lead.status === "NEW") score += 35;
  if (lead.status === "CONTACTED") score += 18;
  if (lead.visitDate) score += 18;
  if (!lead.latestNote) score += 15;
  const ageHours = lead.createdAt ? (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60) : 72;
  if (ageHours < 24) score += 14;
  if (ageHours > 72 && lead.status !== "CLOSED" && lead.status !== "LOST") score += 10;
  return Math.min(99, Math.round(score));
}

function getLeadNextAction(lead: any) {
  if (lead.status === "NEW") return "Call customer";
  if (!lead.latestNote) return "Add ops note";
  if (lead.status === "CONTACTED") return "Schedule visit";
  if (lead.status === "VISIT_SCHEDULED") return "Confirm visit";
  if (lead.status === "NEGOTIATING") return "Track closure";
  return "Review";
}

function LeadDetailDrawer({
  lead,
  isOpen,
  onClose,
  onUpdate,
  updating,
}: {
  lead: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (leadId: string, payload: Record<string, unknown>) => void;
  updating: boolean;
}) {
  const [priority, setPriority] = useState("NORMAL");
  const [nextAction, setNextAction] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [lastOutcome, setLastOutcome] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");

  useEffect(() => {
    if (!lead) return;
    setPriority(lead.priority || "NORMAL");
    setNextAction(lead.nextAction || getLeadNextAction(lead));
    setAssignedTo(lead.assignedTo || "");
    setLastOutcome(lead.lastOutcome || "");
    setFollowUpAt(lead.followUpAt ? new Date(lead.followUpAt).toISOString().slice(0, 16) : "");
  }, [lead]);

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-modal sm:border-l sm:border-border">
        <div className="border-b border-border bg-primary p-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-white/70">Lead detail</p>
              <h2 className="mt-1 text-xl font-semibold">{lead.name}</h2>
              <p className="mt-1 text-sm text-white/75">{lead.phone} Â· {readableStatus(lead.status)}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-btn p-2 text-white/80 hover:bg-white/10 hover:text-white" aria-label="Close lead detail">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <OpsMiniStat label="Priority score" value={getLeadPriorityScore(lead)} />
            <OpsMiniStat label="Follow-up" value={lead.followUpAt ? formatDateTime(lead.followUpAt) : "Not set"} />
          </div>

          <div className="mt-4 rounded-card border border-border bg-surface p-4">
            <p className="text-sm font-semibold text-foreground">Property context</p>
            <p className="mt-2 text-sm text-text-secondary">{lead.property?.title || "No property attached"}</p>
            <p className="mt-2 text-xs leading-5 text-text-secondary">{lead.message || "No customer message"}</p>
          </div>

          <div className="mt-4 rounded-card border border-border bg-white p-4 shadow-card">
            <p className="text-sm font-semibold text-foreground">Follow-up controls</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <select value={priority} onChange={(event) => setPriority(event.target.value)} className="min-h-11 rounded-btn border border-border bg-surface px-3 text-sm outline-none focus:border-primary">
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              <input type="datetime-local" value={followUpAt} onChange={(event) => setFollowUpAt(event.target.value)} className="min-h-11 rounded-btn border border-border bg-surface px-3 text-sm outline-none focus:border-primary" />
              <input value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} placeholder="Assigned admin" className="min-h-11 rounded-btn border border-border bg-surface px-3 text-sm outline-none focus:border-primary" />
              <input value={nextAction} onChange={(event) => setNextAction(event.target.value)} placeholder="Next action" className="min-h-11 rounded-btn border border-border bg-surface px-3 text-sm outline-none focus:border-primary" />
            </div>
            <Textarea value={lastOutcome} onChange={(event) => setLastOutcome(event.target.value)} placeholder="Last call outcome, visit update, negotiation note..." className="mt-3" />
            <Button
              className="mt-3 w-full"
              loading={updating}
              onClick={() => onUpdate(lead.id, { priority, followUpAt, assignedTo, nextAction, lastOutcome })}
            >
              Save Follow-up
            </Button>
          </div>

          <div className="mt-4 rounded-card border border-border bg-white p-4 shadow-card">
            <p className="text-sm font-semibold text-foreground">Timeline</p>
            <div className="mt-3 space-y-2">
              {(lead.notes || []).length ? (
                lead.notes.map((event: any) => (
                  <TimelineRow
                    key={event.id}
                    title={readableStatus(event.eventType)}
                    meta={`${formatDateTime(event.createdAt)} by ${event.actorName}`}
                    note={event.metadata?.note || event.metadata?.nextAction || event.metadata?.lastOutcome || ""}
                    variant="default"
                  />
                ))
              ) : (
                <EmptyOpsText text="No timeline events yet." />
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

