"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  EmptyState,
  OpsPanel,
  readableStatus,
  SearchBox,
  SectionHeader,
  Skeleton,
  adminStatusVariant,
  parseServiceAreas,
} from "@/components/admin/admin-primitives";
import { AllLeadsSection } from "@/components/admin/leads-section";
import { PropertyOpsModal } from "@/components/admin/property-ops-modal";
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

  const filteredUsers = useMemo(() => users.filter((u) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [u.name, u.phone, u.email, u.role]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(needle));
  }), [query, users]);

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

