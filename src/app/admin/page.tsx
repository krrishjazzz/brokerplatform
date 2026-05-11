"use client";

import { Fragment, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building,
  Clock,
  Users,
  UserCheck,
  MessageSquare,
  Settings,
  Menu,
  X,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  Activity,
  ExternalLink,
  ImageIcon,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { cn, formatPrice } from "@/lib/utils";
import { getVisibilityLabel } from "@/lib/visibility";

type Tab = "dashboard" | "pending-properties" | "all-properties" | "pending-brokers" | "all-users" | "all-leads" | "settings";

const NAV_ITEMS: { label: string; value: Tab; icon: React.ReactNode }[] = [
  { label: "Dashboard", value: "dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Pending Properties", value: "pending-properties", icon: <Clock size={18} /> },
  { label: "All Properties", value: "all-properties", icon: <Building size={18} /> },
  { label: "Pending Brokers", value: "pending-brokers", icon: <UserCheck size={18} /> },
  { label: "All Users", value: "all-users", icon: <Users size={18} /> },
  { label: "All Leads", value: "all-leads", icon: <MessageSquare size={18} /> },
  { label: "Settings", value: "settings", icon: <Settings size={18} /> },
];

const LEAD_STATUS_FLOW = [
  { value: "NEW", label: "New", hint: "Fresh enquiry" },
  { value: "CONTACTED", label: "Contacted", hint: "Callback done" },
  { value: "VISIT_SCHEDULED", label: "Visit Scheduled", hint: "Site visit fixed" },
  { value: "NEGOTIATING", label: "Negotiating", hint: "Deal discussion" },
  { value: "CLOSED", label: "Closed", hint: "Brokerage won" },
  { value: "LOST", label: "Lost", hint: "Dropped lead" },
];

function adminStatusVariant(status?: string) {
  switch (status) {
    case "LIVE":
    case "AVAILABLE":
    case "APPROVED":
    case "CONTACTED":
    case "VISIT_SCHEDULED":
    case "NEGOTIATING":
      return "success";
    case "PENDING_REVIEW":
    case "PENDING":
    case "ON_HOLD":
    case "NEW":
      return "warning";
    case "REJECTED":
    case "CLOSED":
    case "LOST":
      return "error";
    default:
      return "default";
  }
}

function readableStatus(status?: string) {
  return (status || "UNKNOWN").replaceAll("_", " ");
}

function formatDateTime(value?: string | null) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SectionHeader({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-5 rounded-card border border-primary/10 bg-white p-5 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {eyebrow && <p className="text-xs font-bold uppercase tracking-wide text-primary">{eyebrow}</p>}
          <h1 className="mt-1 text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">{description}</p>
        </div>
        {right}
      </div>
    </div>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full lg:w-80">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-btn border border-border bg-white pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-card border border-dashed border-primary/25 bg-white p-8 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
        <CheckCircle size={20} />
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-text-secondary">{description}</p>
    </div>
  );
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-76px)] bg-surface">
      {/* Mobile toggle */}
      <button
        onClick={() => setSideOpen(true)}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-primary p-3 text-white shadow-lg lg:hidden"
        aria-label="Open admin menu"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {sideOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSideOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-[76px] z-50 flex h-[calc(100vh-76px)] w-72 shrink-0 flex-col border-r border-border bg-white shadow-card transition-transform lg:sticky lg:translate-x-0 lg:shadow-none",
        sideOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">KrrishJazz Admin</p>
              <p className="text-xs text-text-secondary">{user.name || "Admin"} workspace</p>
            </div>
            <button onClick={() => setSideOpen(false)} className="rounded-full p-1 text-text-secondary hover:bg-surface lg:hidden" aria-label="Close admin menu">
              <X size={18} />
            </button>
          </div>
          <div className="mt-4 rounded-card bg-primary p-4 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck size={17} />
              Trust operations
            </div>
            <p className="mt-2 text-xs leading-5 text-white/80">Verify listings, brokers, and managed leads before users feel the rough edges.</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.value}
              onClick={() => { setActiveTab(item.value); setSideOpen(false); }}
              className={cn(
                "flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-sm transition-colors",
                activeTab === item.value
                  ? "bg-primary-light font-semibold text-primary"
                  : "text-text-secondary hover:bg-surface"
              )}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        {activeTab === "dashboard" && <DashboardSection />}
        {activeTab === "pending-properties" && <PendingPropertiesSection />}
        {activeTab === "all-properties" && <AllPropertiesSection />}
        {activeTab === "pending-brokers" && <PendingBrokersSection />}
        {activeTab === "all-users" && <AllUsersSection />}
        {activeTab === "all-leads" && <AllLeadsSection />}
        {activeTab === "settings" && <SettingsSection />}
      </main>
    </div>
  );
}

/* ---------- Dashboard Stats ---------- */
function DashboardSection() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats").then((r) => r.json()).then(setStats).catch(console.error);
  }, []);

  const cards = stats
    ? [
        { label: "Pending Properties", value: stats.pendingProperties || 0, hint: "Verify first", icon: <Clock size={24} />, color: "text-warning" },
        { label: "Stale Listings", value: stats.staleProperties || 0, hint: "Refresh availability", icon: <AlertTriangle size={24} />, color: "text-error" },
        { label: "Hot Requirements", value: stats.hotRequirements || 0, hint: "Match inventory", icon: <Activity size={24} />, color: "text-accent" },
        { label: "Open Collaborations", value: stats.openCollaborations || 0, hint: "Broker workflow", icon: <Users size={24} />, color: "text-primary" },
        { label: "New Enquiries", value: stats.newEnquiries || 0, hint: "Managed callback", icon: <MessageSquare size={24} />, color: "text-success" },
        { label: "Pending Brokers", value: stats.pendingBrokers || 0, hint: "Trust review", icon: <UserCheck size={24} />, color: "text-primary" },
      ]
    : [];

  return (
    <div>
      <section className="mb-5 overflow-hidden rounded-card border border-primary/10 bg-primary text-white shadow-card">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px] lg:p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-white/70">Admin workspace</p>
            <h1 className="mt-2 text-3xl font-bold">KrrishJazz Control Centre</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/82">
              Keep listing trust, broker onboarding, and buyer callbacks moving with a clean approval queue.
            </p>
          </div>
          <div className="rounded-card bg-white/10 p-4">
            <p className="text-sm font-semibold">Today&apos;s focus</p>
            <div className="mt-3 space-y-2 text-sm text-white/85">
              <p>{stats?.pendingProperties || 0} properties waiting for verification</p>
              <p>{stats?.pendingBrokers || 0} broker applications need review</p>
              <p>{stats?.newEnquiries || 0} new enquiries need managed follow-up</p>
            </div>
          </div>
        </div>
      </section>
      {!stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-card border border-border p-6 animate-pulse">
              <div className="h-6 bg-surface rounded w-20 mb-2" />
              <div className="h-8 bg-surface rounded w-12" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-card border border-border bg-white p-5 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">{card.label}</p>
                <span className={cn("rounded-full bg-surface p-2", card.color)}>{card.icon}</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{card.value}</p>
              <p className="mt-1 text-xs text-text-secondary">{card.hint}</p>
            </div>
          ))}
        </div>
      )}
      {stats && (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <OpsQueueCard
            title="Verification Queue"
            value={stats.pendingProperties || 0}
            description="Properties waiting for KrrishJazz trust check before going live."
            action="Review properties"
          />
          <OpsQueueCard
            title="Freshness Queue"
            value={stats.staleProperties || 0}
            description="Live inventory that needs owner/broker availability reconfirmation."
            action="Refresh listings"
          />
          <OpsQueueCard
            title="Demand Queue"
            value={stats.activeRequirements || 0}
            description="Active requirements that should be matched against network inventory."
            action="Open matches"
          />
        </div>
      )}
    </div>
  );
}

function OpsQueueCard({ title, value, description, action }: { title: string; value: number; description: string; action: string }) {
  return (
    <div className="rounded-card border border-border bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
        </div>
        <span className="rounded-pill bg-primary-light px-3 py-1 text-sm font-semibold text-primary">{value}</span>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-text-secondary">{action}</p>
    </div>
  );
}

/* ---------- Pending Properties ---------- */
function PendingPropertiesSection() {
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

/* ---------- All Properties ---------- */
function AllPropertiesSection() {
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

  const filteredProperties = properties.filter((p) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [p.title, p.propertyType, p.city, p.locality, p.status]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(needle));
  });

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

function PropertyOpsModal({
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
                  onChange={(e) => setOpsNote(e.target.value)}
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

function OpsMiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-btn border border-border bg-surface p-3">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function OpsPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-white p-4 shadow-card">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function PersonBlock({ title, person }: { title: string; person?: any }) {
  if (!person) return <EmptyOpsText text={`${title}: not assigned.`} />;
  const profile = person.brokerProfile;
  return (
    <div className="rounded-btn border border-border bg-surface p-3">
      <p className="text-xs font-semibold uppercase text-text-secondary">{title}</p>
      <p className="mt-1 font-semibold text-foreground">{person.name || person.phone || "Unknown"}</p>
      <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
        <Phone size={12} /> {person.phone || "No phone"}
      </p>
      {profile && (
        <div className="mt-2 flex flex-wrap gap-1">
          {profile.rera && <Badge variant="blue">RERA</Badge>}
          <Badge variant="accent">{profile.responseScore || 70}% response</Badge>
          <Badge variant="default">{profile.completedCollaborations || 0} collabs</Badge>
        </div>
      )}
    </div>
  );
}

function TimelineRow({
  title,
  meta,
  note,
  variant,
}: {
  title: string;
  meta: string;
  note?: string | null;
  variant: string;
}) {
  return (
    <div className="rounded-btn border border-border bg-surface p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <Badge variant={variant as any}>{variant === "default" ? "event" : title.split(" ")[0]}</Badge>
      </div>
      <p className="mt-1 text-xs text-text-secondary">{meta}</p>
      {note && <p className="mt-2 line-clamp-2 text-xs leading-5 text-text-secondary">{note}</p>}
    </div>
  );
}

function EmptyOpsText({ text }: { text: string }) {
  return <p className="rounded-btn border border-dashed border-border bg-surface p-3 text-sm text-text-secondary">{text}</p>;
}

function parseServiceAreas(value?: string) {
  try {
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/* ---------- Pending Brokers ---------- */
function PendingBrokersSection() {
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
function AllUsersSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const roleVariant = (r: string) => {
    switch (r) {
      case "ADMIN": return "error";
      case "BROKER": return "blue";
      case "OWNER": return "warning";
      default: return "default";
    }
  };

  const filteredUsers = users.filter((u) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [u.name, u.phone, u.email, u.role]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(needle));
  });

  return (
    <div>
      <SectionHeader
        eyebrow="Accounts"
        title="All Users"
        description="Search customers, owners, brokers, and admins from the same account table."
        right={<SearchBox value={query} onChange={setQuery} placeholder="Search name, phone, role..." />}
      />
      {loading ? (
        <Skeleton />
      ) : filteredUsers.length === 0 ? (
        <EmptyState title="No users found" description="Try another name, phone number, email, or role." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Name</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Email</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Role</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{u.name || "--"}</td>
                  <td className="px-4 py-3 text-text-secondary">{u.phone}</td>
                  <td className="px-4 py-3 text-text-secondary">{u.email || "--"}</td>
                  <td className="px-4 py-3"><Badge variant={roleVariant(u.role) as any}>{u.role}</Badge></td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- All Leads ---------- */
function AllLeadsSection() {
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

  const filteredLeads = leads.filter((l) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [l.name, l.phone, l.property?.title, l.message, l.status]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(needle));
  });

  const statusCounts = LEAD_STATUS_FLOW.map((status) => ({
    ...status,
    count: leads.filter((lead) => lead.status === status.value).length,
  }));
  const priorityLeads = [...leads]
    .sort((a, b) => getLeadPriorityScore(b) - getLeadPriorityScore(a))
    .slice(0, 5);

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
                      Budget: {request.budgetMax ? formatPrice(Number(request.budgetMax)) : "Ask"} · {new Date(request.createdAt).toLocaleDateString()}
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

          <div className="overflow-x-auto rounded-card border border-border bg-white shadow-card">
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
              <p className="mt-1 text-sm text-white/75">{lead.phone} · {readableStatus(lead.status)}</p>
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

/* ---------- Settings ---------- */
function SettingsSection() {
  return (
    <div>
      <SectionHeader
        eyebrow="Policy"
        title="Ops Settings"
        description="Current operational rules are shown as policy cards until backed by persistent, permissioned controls."
      />
      <div className="rounded-card border border-border bg-white p-6 shadow-card">
        <p className="text-sm text-text-secondary">
          Fake toggles were removed here because they create operational risk. These controls should only return once they are backed by persistent settings, audit events, and admin permissions.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Verification policy", "Manual KrrishJazz review stays on for trust."],
            ["Freshness expiry", "Live listings should be reconfirmed every 14 days."],
            ["Lead policy", "Customer contact remains KrrishJazz-managed first."],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-card border border-border bg-surface p-4">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Skeleton ---------- */
function Skeleton() {
  return (
    <div className="bg-white rounded-card border border-border p-6 animate-pulse space-y-4">
      <div className="h-4 bg-surface rounded w-1/3" />
      <div className="h-10 bg-surface rounded" />
      <div className="h-10 bg-surface rounded" />
      <div className="h-10 bg-surface rounded" />
    </div>
  );
}
