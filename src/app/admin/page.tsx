"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { cn, formatPrice } from "@/lib/utils";

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
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Mobile toggle */}
      <button
        onClick={() => setSideOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 p-3 bg-primary text-white rounded-full shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {sideOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSideOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-64 bg-white border-r border-border shrink-0 flex flex-col fixed lg:sticky top-16 h-[calc(100vh-64px)] z-50 transition-transform lg:translate-x-0",
        sideOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Admin Panel</p>
            <p className="text-xs text-text-secondary">{user.name || "Admin"}</p>
          </div>
          <button onClick={() => setSideOpen(false)} className="lg:hidden p-1">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.value}
              onClick={() => { setActiveTab(item.value); setSideOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-btn transition-colors",
                activeTab === item.value
                  ? "bg-blue-50 text-primary font-medium"
                  : "text-text-secondary hover:bg-surface"
              )}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-surface p-4 lg:p-6 overflow-y-auto">
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
        { label: "Total Users", value: stats.totalUsers || 0, icon: <Users size={24} />, color: "text-primary" },
        { label: "Total Properties", value: stats.totalProperties || 0, icon: <Building size={24} />, color: "text-accent" },
        { label: "Pending Properties", value: stats.pendingProperties || 0, icon: <Clock size={24} />, color: "text-warning" },
        { label: "Pending Brokers", value: stats.pendingBrokers || 0, icon: <UserCheck size={24} />, color: "text-blue-500" },
        { label: "Total Enquiries", value: stats.totalEnquiries || 0, icon: <MessageSquare size={24} />, color: "text-success" },
      ]
    : [];

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground mb-4">Dashboard Overview</h1>
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
            <div key={card.label} className="bg-white rounded-card border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-text-secondary">{card.label}</p>
                <span className={card.color}>{card.icon}</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Pending Properties ---------- */
function PendingPropertiesSection() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProps = useCallback(async () => {
    try {
      const res = await fetch("/api/properties?status=PENDING_REVIEW&limit=50");
      const data = await res.json();
      setProperties(data.properties || []);
    } catch {
      console.error("Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProps(); }, [fetchProps]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await fetch(`/api/admin/properties/${id}/approve`, { method: "POST" });
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(true);
    try {
      await fetch(`/api/admin/properties/${rejectModal}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      setProperties((prev) => prev.filter((p) => p.id !== rejectModal));
      setRejectModal(null);
      setRejectReason("");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground mb-4">Pending Properties</h1>

      {loading ? (
        <Skeleton />
      ) : properties.length === 0 ? (
        <p className="text-sm text-text-secondary">No pending properties</p>
      ) : (
        <div className="bg-white rounded-card border border-border overflow-x-auto">
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

  useEffect(() => {
    fetch("/api/properties?limit=50&allStatuses=true")
      .then((r) => r.json())
      .then((data) => setProperties(data.properties || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusVariant = (s: string) => {
    switch (s) {
      case "LIVE": return "success";
      case "PENDING_REVIEW": return "warning";
      case "REJECTED": return "error";
      case "SOLD": return "blue";
      default: return "default";
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground mb-4">All Properties</h1>
      {loading ? (
        <Skeleton />
      ) : (
        <div className="bg-white rounded-card border border-border overflow-x-auto">
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
              {properties.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">{p.title}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.propertyType}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.city}</td>
                  <td className="px-4 py-3 text-foreground font-medium">{formatPrice(Number(p.price))}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(p.status) as any}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost">
                      <Eye size={14} className="mr-1" /> View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- Pending Brokers ---------- */
function PendingBrokersSection() {
  const [brokers, setBrokers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/brokers?status=PENDING")
      .then((r) => r.json())
      .then((data) => setBrokers(data.brokers || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await fetch(`/api/admin/brokers/${id}/approve`, { method: "POST" });
      setBrokers((prev) => prev.filter((b) => b.id !== id));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(true);
    try {
      await fetch(`/api/admin/brokers/${rejectModal}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      setBrokers((prev) => prev.filter((b) => b.id !== rejectModal));
      setRejectModal(null);
      setRejectReason("");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground mb-4">Pending Broker Applications</h1>

      {loading ? (
        <Skeleton />
      ) : brokers.length === 0 ? (
        <p className="text-sm text-text-secondary">No pending applications</p>
      ) : (
        <div className="bg-white rounded-card border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Name</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">RERA</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Experience</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">City</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brokers.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{b.profile?.name || "—"}</td>
                  <td className="px-4 py-3 text-text-secondary">{b.profile?.phone}</td>
                  <td className="px-4 py-3 text-text-secondary">{b.rera}</td>
                  <td className="px-4 py-3 text-text-secondary">{b.experience} years</td>
                  <td className="px-4 py-3 text-text-secondary">{b.city}</td>
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

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground mb-4">All Users</h1>
      {loading ? (
        <Skeleton />
      ) : (
        <div className="bg-white rounded-card border border-border overflow-x-auto">
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
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{u.name || "—"}</td>
                  <td className="px-4 py-3 text-text-secondary">{u.phone}</td>
                  <td className="px-4 py-3 text-text-secondary">{u.email || "—"}</td>
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
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/leads")
      .then((r) => r.json())
      .then((data) => setLeads(data.leads || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground mb-4">All Leads / Enquiries</h1>
      {loading ? (
        <Skeleton />
      ) : leads.length === 0 ? (
        <p className="text-sm text-text-secondary">No enquiries yet</p>
      ) : (
        <div className="bg-white rounded-card border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Name</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Property</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Message</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Status</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{l.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{l.phone}</td>
                  <td className="px-4 py-3 text-text-secondary max-w-[150px] truncate">{l.property?.title || "—"}</td>
                  <td className="px-4 py-3 text-text-secondary max-w-[200px] truncate">{l.message || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={l.status === "NEW" ? "blue" : l.status === "CONTACTED" ? "success" : "default"}>
                      {l.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(l.createdAt).toLocaleDateString()}</td>
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
      <h1 className="text-xl font-bold text-foreground mb-4">Site Settings</h1>
      <div className="bg-white rounded-card border border-border p-6">
        <p className="text-sm text-text-secondary mb-4">
          Configure platform settings, SMS templates, and notification preferences.
        </p>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Auto-approve properties</p>
              <p className="text-xs text-text-secondary">Properties will go live without review</p>
            </div>
            <button className="w-10 h-5 bg-border rounded-full relative">
              <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform" />
            </button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">SMS notifications</p>
              <p className="text-xs text-text-secondary">Send SMS for status updates</p>
            </div>
            <button className="w-10 h-5 bg-primary rounded-full relative">
              <span className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform" />
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Maintenance mode</p>
              <p className="text-xs text-text-secondary">Disable public access temporarily</p>
            </div>
            <button className="w-10 h-5 bg-border rounded-full relative">
              <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform" />
            </button>
          </div>
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
