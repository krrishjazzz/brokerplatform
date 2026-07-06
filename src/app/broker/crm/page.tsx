"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  Loader2,
  MessageCircle,
  Phone,
  Plus,
  Search,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrokerPageShell } from "@/components/broker/broker-shell";
import { MetricCard } from "@/components/broker/broker-primitives";
import { AddClientModal, type AddClientForm } from "@/components/broker/crm/add-client-modal";
import { ClientDetailPanel } from "@/components/broker/crm/client-detail-panel";
import { SendPropertiesModal } from "@/components/broker/crm/send-properties-modal";
import {
  CRM_STAGE_OPTIONS,
  createBrokerClient,
  getBrokerClientDetail,
  type BrokerCrmClient,
  updateBrokerTask,
  useBrokerCrmClients,
  useBrokerCrmListings,
  useBrokerCrmToday,
} from "@/features/broker-crm";
import { openPhone, useBrokerAuthGuard } from "@/features/broker-exchange";
import { useToast } from "@/components/ui/toast";
import { cn, formatPrice } from "@/lib/utils";

type CrmTab = "today" | "leads" | "listings";

export default function BrokerCrmPage() {
  const { toast } = useToast();
  const { user, loading: authLoading, isReady } = useBrokerAuthGuard();
  const [tab, setTab] = useState<CrmTab>("today");
  const [stageFilter, setStageFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<BrokerCrmClient | null>(null);
  const [sendClient, setSendClient] = useState<BrokerCrmClient | null>(null);
  const [sendPreselected, setSendPreselected] = useState<string[]>([]);

  const { data: today, loading: todayLoading, refetch: refetchToday } = useBrokerCrmToday(isReady);
  const { clients, loading: clientsLoading, refetch: refetchClients, setClients } = useBrokerCrmClients(
    isReady,
    stageFilter || undefined,
    searchQuery || undefined
  );
  const { listings, loading: listingsLoading } = useBrokerCrmListings(isReady);

  const activeClients = useMemo(
    () => clients.filter((client) => !["WON", "LOST"].includes(client.stage)),
    [clients]
  );

  const handleAddClient = async (form: AddClientForm) => {
    setSubmitting(true);
    const { ok, data } = await createBrokerClient({
      name: form.name,
      phone: form.phone,
      intent: form.intent,
      city: form.city,
      propertyTypes: form.propertyType ? [form.propertyType] : [],
      budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      seriousness: form.seriousness,
      notes: form.notes,
      nextFollowUpAt: form.nextFollowUpAt ? new Date(form.nextFollowUpAt).toISOString() : undefined,
    });
    setSubmitting(false);
    if (ok && data?.client) {
      toast("Lead added to your CRM.", "success");
      setShowAddModal(false);
      refetchClients();
      refetchToday();
    } else {
      toast("Could not add lead. Check phone number or duplicates.", "error");
    }
  };

  const completeTask = async (taskId: string) => {
    const { ok } = await updateBrokerTask(taskId, { status: "DONE" });
    if (ok) {
      toast("Task marked done.", "success");
      refetchToday();
    }
  };

  const openSendModal = (client: BrokerCrmClient, propertyIds: string[] = []) => {
    setSendClient(client);
    setSendPreselected(propertyIds);
  };

  const openClient = async (client: BrokerCrmClient | { id: string }) => {
    if ("createdAt" in client) {
      setSelectedClient(client);
      return;
    }
    const { ok, data } = await getBrokerClientDetail(client.id);
    if (ok && data?.client) setSelectedClient(data.client);
  };

  if (authLoading || !user || !isReady) return null;

  return (
    <BrokerPageShell
      title="My CRM"
      subtitle="Private leads, follow-ups, and one-click WhatsApp — free for every partner broker."
      actions={
        <Button variant="inverse" size="sm" onClick={() => setShowAddModal(true)}>
          <UserPlus size={15} className="mr-2" />
          Add lead
        </Button>
      }
    >
      <section
        className="sticky z-20 border-b border-border bg-white shadow-sm"
        style={{ top: "var(--broker-header-height, 7rem)" }}
      >
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 lg:px-6">
          {([
            ["today", "Today"],
            ["leads", "Leads"],
            ["listings", "My listings"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                "shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                tab === value ? "bg-primary text-white" : "text-text-secondary hover:bg-surface"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-5 lg:px-6">
        {tab === "today" && (
          <TodayTab
            loading={todayLoading}
            data={today}
            onCompleteTask={completeTask}
            onOpenClient={openClient}
            onSend={openSendModal}
          />
        )}

        {tab === "leads" && (
          <LeadsTab
            loading={clientsLoading}
            clients={activeClients}
            stageFilter={stageFilter}
            setStageFilter={setStageFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenClient={openClient}
            onSend={openSendModal}
          />
        )}

        {tab === "listings" && (
          <ListingsTab
            loading={listingsLoading}
            listings={listings}
            clients={clients}
            onSendToClient={(listingId) => {
              if (clients.length === 0) {
                toast("Add a client lead first.", "error");
                return;
              }
              setSendPreselected([listingId]);
              setSendClient(null);
            }}
          />
        )}
      </div>

      <AddClientModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddClient} submitting={submitting} />

      <ClientDetailPanel
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
        onUpdated={(client) => {
          setClients((current) => current.map((item) => (item.id === client.id ? client : item)));
          setSelectedClient(client);
          refetchToday();
        }}
        onSendWhatsApp={(client) => {
          setSelectedClient(null);
          openSendModal(client, client.shortlistedIds);
        }}
      />

      <SendPropertiesModal
        isOpen={Boolean(sendClient) || sendPreselected.length > 0}
        onClose={() => {
          setSendClient(null);
          setSendPreselected([]);
          refetchClients();
          refetchToday();
        }}
        client={sendClient}
        clients={clients}
        listings={listings}
        preselectedIds={sendPreselected}
      />

      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-modal lg:hidden"
        aria-label="Add lead"
      >
        <Plus size={24} />
      </button>
    </BrokerPageShell>
  );
}

function TodayTab({
  loading,
  data,
  onCompleteTask,
  onOpenClient,
  onSend,
}: {
  loading: boolean;
  data: ReturnType<typeof useBrokerCrmToday>["data"];
  onCompleteTask: (id: string) => void;
  onOpenClient: (client: BrokerCrmClient) => void;
  onSend: (client: BrokerCrmClient) => void;
}) {
  if (loading || !data) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MetricCard label="Active leads" value={data.stats.activeClients} tone="default" />
        <MetricCard label="Overdue" value={data.stats.overdueCount} tone="warning" />
        <MetricCard label="Due today" value={data.stats.dueTodayCount} tone="accent" />
        <MetricCard label="New leads" value={data.stats.newLeads} tone="primary" />
      </div>

      <QueueSection title="Overdue follow-ups" empty="No overdue tasks.">
        {data.overdueTasks.map((task) => (
          <TaskRow key={task.id} task={task} onComplete={onCompleteTask} onOpenClient={onOpenClient} />
        ))}
      </QueueSection>

      <QueueSection title="Due today" empty="Nothing scheduled for today.">
        {data.todayTasks.map((task) => (
          <TaskRow key={task.id} task={task} onComplete={onCompleteTask} onOpenClient={onOpenClient} />
        ))}
      </QueueSection>

      <QueueSection title="Hot leads — no recent contact" empty="All hot leads are being followed up.">
        {data.hotStaleClients.map((client) => (
          <ClientRow key={client.id} client={client} onOpen={onOpenClient} onSend={onSend} />
        ))}
      </QueueSection>
    </div>
  );
}

function LeadsTab({
  loading,
  clients,
  stageFilter,
  setStageFilter,
  searchQuery,
  setSearchQuery,
  onOpenClient,
  onSend,
}: {
  loading: boolean;
  clients: BrokerCrmClient[];
  stageFilter: string;
  setStageFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onOpenClient: (client: BrokerCrmClient) => void;
  onSend: (client: BrokerCrmClient) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, city..."
            className="h-10 w-full rounded-btn border border-border pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setStageFilter("")}
          className={cn(
            "rounded-pill border px-3 py-1 text-xs font-semibold",
            !stageFilter ? "border-primary bg-primary text-white" : "border-border"
          )}
        >
          All
        </button>
        {CRM_STAGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setStageFilter(stageFilter === option.value ? "" : option.value)}
            className={cn(
              "rounded-pill border px-3 py-1 text-xs font-semibold",
              stageFilter === option.value ? "border-primary bg-primary text-white" : "border-border"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : clients.length === 0 ? (
        <div className="rounded-card border border-dashed border-border bg-white p-8 text-center">
          <UserPlus size={40} className="mx-auto mb-3 text-primary" />
          <p className="font-semibold text-foreground">No leads yet</p>
          <p className="mt-1 text-sm text-text-secondary">Add clients from calls and WhatsApp conversations.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => (
            <ClientRow key={client.id} client={client} onOpen={onOpenClient} onSend={onSend} />
          ))}
        </div>
      )}
    </div>
  );
}

function ListingsTab({
  loading,
  listings,
  clients,
  onSendToClient,
}: {
  loading: boolean;
  listings: ReturnType<typeof useBrokerCrmListings>["listings"];
  clients: BrokerCrmClient[];
  onSendToClient: (listingId: string) => void;
}) {
  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border bg-white p-8 text-center">
        <p className="font-semibold text-foreground">No listings in your CRM</p>
        <p className="mt-1 text-sm text-text-secondary">Post properties or get assigned listings to share with clients.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-text-secondary">{listings.length} listing{listings.length === 1 ? "" : "s"} you manage</p>
      {listings.map((listing) => (
        <div key={listing.id} className="flex flex-col gap-3 rounded-card border border-border bg-white p-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">{listing.title}</p>
            <p className="text-sm text-text-secondary">
              {formatPrice(listing.price)} · {listing.city} · {listing.enquiryCount} enquiries
            </p>
          </div>
          <Button variant="accent" size="sm" onClick={() => onSendToClient(listing.id)} disabled={clients.length === 0}>
            <MessageCircle size={14} className="mr-2" />
            Send to client
          </Button>
        </div>
      ))}
    </div>
  );
}

function QueueSection({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children : [children];
  const hasItems = items.some(Boolean) && items.length > 0 && !(items.length === 1 && !items[0]);

  return (
    <section className="rounded-card border border-border bg-white p-4 shadow-card">
      <h2 className="mb-3 text-sm font-semibold text-foreground">{title}</h2>
      {!hasItems ? <p className="text-sm text-text-secondary">{empty}</p> : <div className="space-y-2">{children}</div>}
    </section>
  );
}

function TaskRow({
  task,
  onComplete,
  onOpenClient,
}: {
  task: { id: string; title: string; dueAt: string; client: { id: string; name: string; phone: string } | null };
  onComplete: (id: string) => void;
  onOpenClient: (client: BrokerCrmClient) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-btn border border-border bg-surface px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
        <p className="text-xs text-text-secondary">
          <CalendarClock size={12} className="mr-1 inline" />
          {new Date(task.dueAt).toLocaleString("en-IN")}
        </p>
      </div>
      <div className="flex gap-1">
        {task.client && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onOpenClient({
                id: task.client!.id,
                name: task.client!.name,
                phone: task.client!.phone,
              } as BrokerCrmClient)
            }
          >
            Open
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => onComplete(task.id)}>
          Done
        </Button>
      </div>
    </div>
  );
}

function ClientRow({
  client,
  onOpen,
  onSend,
}: {
  client: BrokerCrmClient;
  onOpen: (client: BrokerCrmClient) => void;
  onSend: (client: BrokerCrmClient) => void;
}) {
  const stage = CRM_STAGE_OPTIONS.find((item) => item.value === client.stage)?.label || client.stage;

  return (
    <div className="rounded-card border border-border bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" className="min-w-0 text-left" onClick={() => onOpen(client)}>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{client.name}</p>
            <Badge variant={client.seriousness === "HOT" ? "accent" : "default"}>{client.seriousness}</Badge>
            <Badge variant="blue">{stage}</Badge>
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            {client.phone} · {client.city || "City not set"} · {client.intent}
          </p>
        </button>
        <div className="flex gap-2">
          <Button variant="accent" size="sm" onClick={() => onSend(client)}>
            <MessageCircle size={14} className="mr-1" />
            WhatsApp
          </Button>
          <Button variant="outline" size="sm" onClick={() => openPhone(client.phone)}>
            <Phone size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
