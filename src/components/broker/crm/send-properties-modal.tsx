"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import type { BrokerCrmClient, BrokerCrmListing } from "@/features/broker-crm";
import { sharePropertiesToClient } from "@/features/broker-crm";
import { cn, formatPrice } from "@/lib/utils";

export function SendPropertiesModal({
  isOpen,
  onClose,
  client,
  clients,
  listings,
  preselectedIds = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  client: BrokerCrmClient | null;
  clients: BrokerCrmClient[];
  listings: BrokerCrmListing[];
  preselectedIds?: string[];
}) {
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [messagePreview, setMessagePreview] = useState("");
  const [sending, setSending] = useState(false);

  const activeClient = clients.find((item) => item.id === selectedClientId) || client;

  useEffect(() => {
    if (isOpen) {
      setSelected(preselectedIds.slice(0, 5));
      setSelectedClientId(client?.id || clients[0]?.id || "");
    }
  }, [isOpen, preselectedIds, client, clients]);

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : current.length < 5 ? [...current, id] : current
    );
  };

  const handleSend = async () => {
    if (!activeClient || selected.length === 0) return;
    setSending(true);
    const { ok, data } = await sharePropertiesToClient({
      clientId: activeClient.id,
      propertyIds: selected,
      customMessage: messagePreview || undefined,
    });
    setSending(false);
    if (ok && data?.whatsappUrl) {
      window.open(data.whatsappUrl, "_blank");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={activeClient ? `Send to ${activeClient.name}` : "Send properties"} className="max-w-2xl">
      {!activeClient && clients.length === 0 ? (
        <p className="text-sm text-text-secondary">Add a client lead first.</p>
      ) : (
        <div className="space-y-4">
          {clients.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-secondary">Client</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="h-10 w-full rounded-btn border border-border px-3 text-sm"
              >
                {clients.map((item) => (
                  <option key={item.id} value={item.id}>{item.name} · {item.phone}</option>
                ))}
              </select>
            </div>
          )}
          <p className="text-sm text-text-secondary">Select up to 5 listings. WhatsApp opens with a ready message.</p>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {listings.length === 0 ? (
              <p className="text-sm text-text-secondary">No listings in your CRM yet. Post or assign properties first.</p>
            ) : (
              listings.map((listing) => {
                const active = selected.includes(listing.id);
                return (
                  <button
                    key={listing.id}
                    type="button"
                    onClick={() => toggle(listing.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-card border p-3 text-left transition-colors",
                      active ? "border-primary bg-primary-light" : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-btn bg-surface">
                      {listing.coverImage ? (
                        <img src={listing.coverImage} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{listing.title}</p>
                      <p className="text-xs text-text-secondary">
                        {formatPrice(listing.price)} · {listing.city}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-text-secondary">Custom message (optional)</label>
            <Textarea
              rows={4}
              placeholder="Leave blank to use the auto-generated template..."
              value={messagePreview}
              onChange={(e) => setMessagePreview(e.target.value)}
            />
          </div>

          <Button variant="accent" className="w-full" disabled={!activeClient || selected.length === 0 || sending} onClick={handleSend}>
            <MessageCircle size={16} className="mr-2" />
            {sending ? "Preparing..." : `Send ${selected.length} on WhatsApp`}
          </Button>
        </div>
      )}
    </Modal>
  );
}
