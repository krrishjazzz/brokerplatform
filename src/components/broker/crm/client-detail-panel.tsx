"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { BrokerCrmClient, BrokerCrmShare, CrmStage } from "@/features/broker-crm";
import { CRM_STAGE_OPTIONS, getBrokerClientDetail, updateBrokerClient } from "@/features/broker-crm";
import { openPhone } from "@/features/broker-exchange";
import { cn, formatPrice } from "@/lib/utils";

export function ClientDetailPanel({
  client,
  onClose,
  onUpdated,
  onSendWhatsApp,
}: {
  client: BrokerCrmClient | null;
  onClose: () => void;
  onUpdated: (client: BrokerCrmClient) => void;
  onSendWhatsApp: (client: BrokerCrmClient) => void;
}) {
  const [notes, setNotes] = useState("");
  const [stage, setStage] = useState<CrmStage>("NEW");
  const [shares, setShares] = useState<BrokerCrmShare[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!client) return;
    setNotes(client.notes);
    setStage(client.stage);
    void getBrokerClientDetail(client.id).then(({ ok, data }) => {
      if (ok && data) setShares(data.shares);
    });
  }, [client]);

  if (!client) return null;

  const budgetText =
    client.budgetMin || client.budgetMax
      ? `${client.budgetMin ? formatPrice(client.budgetMin) : "?"} – ${client.budgetMax ? formatPrice(client.budgetMax) : "?"}`
      : "Not set";

  const save = async () => {
    setSaving(true);
    const { ok, data } = await updateBrokerClient(client.id, { notes, stage });
    setSaving(false);
    if (ok && data?.client) onUpdated(data.client);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-modal">
        <div className="flex items-start justify-between border-b border-border p-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{client.name}</h2>
            <p className="text-sm text-text-secondary">{client.phone}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-surface" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="blue">{client.intent}</Badge>
            <Badge variant={client.seriousness === "HOT" ? "accent" : "default"}>{client.seriousness}</Badge>
            {client.city && <Badge>{client.city}</Badge>}
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <Info label="Budget" value={budgetText} />
            <Info label="Type" value={client.propertyTypes[0] || "Any"} />
            <Info label="Follow-up" value={client.nextFollowUpAt ? new Date(client.nextFollowUpAt).toLocaleString("en-IN") : "None"} />
            <Info label="Last contact" value={client.lastContactAt ? new Date(client.lastContactAt).toLocaleDateString("en-IN") : "Never"} />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-text-secondary">Pipeline stage</label>
            <div className="flex flex-wrap gap-1.5">
              {CRM_STAGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStage(option.value)}
                  className={cn(
                    "rounded-pill border px-3 py-1 text-xs font-semibold",
                    stage === option.value ? "border-primary bg-primary text-white" : "border-border"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-text-secondary">Notes</label>
            <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {shares.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-text-secondary">WhatsApp history</p>
              <ul className="space-y-2">
                {shares.slice(0, 5).map((share) => (
                  <li key={share.id} className="rounded-btn border border-border bg-surface px-3 py-2 text-xs">
                    <p className="font-medium text-foreground">
                      Sent {share.propertyIds.length} propert{share.propertyIds.length === 1 ? "y" : "ies"}
                    </p>
                    <p className="text-text-secondary">{new Date(share.createdAt).toLocaleString("en-IN")}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-border p-4 grid gap-2">
          <Button variant="accent" onClick={() => onSendWhatsApp(client)}>
            <MessageCircle size={16} className="mr-2" />
            Send properties on WhatsApp
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => openPhone(client.phone)}>
              <Phone size={16} className="mr-2" />
              Call
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-btn border border-border bg-surface px-3 py-2">
      <p className="text-[10px] text-text-secondary">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}
