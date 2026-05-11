"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LayoutDashboard,
  Building2,
  Factory,
  PlusCircle,
  Users,
  MessageSquare,
  Heart,
  User,
  ClipboardList,
  Menu,
  X,
  TrendingUp,
  Home,
  Upload,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  AlertTriangle,
  XCircle,
  Edit,
  Phone,
  Mail,
  MapPin,
  Loader2,
  Store,
  Trees,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  PROPERTY_TYPES,
  PROPERTY_CATEGORY_OPTIONS,
  PROPERTY_TYPE_GUIDE,
  AMENITIES,
  CATEGORY_AMENITIES,
  FURNISHING_OPTIONS,
  AREA_UNITS,
  INDIAN_STATES,
  INDIAN_CITIES,
} from "@/lib/constants";
import { propertySchema, type PropertyInput } from "@/lib/validations";

// ─── Types ──────────────────────────────────────────────────────────────────────

type Tab =
  | "overview"
  | "properties"
  | "post"
  | "leads"
  | "enquiries"
  | "saved"
  | "profile"
  | "application"
  | "requirements";

interface NavItem {
  id: Tab;
  label: string;
  icon: React.ReactNode;
}

interface DashboardStats {
  totalProperties: number;
  liveProperties: number;
  totalLeads: number;
  newLeads: number;
}

interface PropertyRow {
  id: string;
  title: string;
  propertyType: string;
  locality?: string;
  city: string;
  address?: string;
  price: number;
  status: string;
  listingStatus?: string;
  visibilityType?: string;
  coverImage?: string | null;
  images?: string[];
  bedrooms?: number | null;
  latestFreshness?: {
    availabilityStatus: string;
    confirmedAt?: string;
    expiresAt?: string | null;
    note?: string | null;
  } | null;
  _count?: { enquiries: number };
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DashboardRequirement {
  id: string;
  description: string;
  propertyType: string;
  locality?: string;
  city: string;
  budgetMin: number | null;
  budgetMax: number | null;
  matchedPropertiesCount: number;
  status?: string;
  urgency?: string;
  clientSeriousness?: string;
  notes?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

interface LeadRow {
  id: string;
  customerName: string;
  phone: string;
  propertyTitle: string;
  propertySlug?: string;
  message: string;
  date: string;
  status: string;
  visitDate?: string | null;
}

const LEAD_PIPELINE = [
  { value: "NEW", label: "New enquiry", ownerHint: "KrrishJazz has received this buyer interest." },
  { value: "CONTACTED", label: "Contacted", ownerHint: "The customer callback has been handled." },
  { value: "VISIT_SCHEDULED", label: "Visit scheduled", ownerHint: "A site visit is being coordinated." },
  { value: "NEGOTIATING", label: "Negotiating", ownerHint: "Price or terms are under discussion." },
  { value: "CLOSED", label: "Closed", ownerHint: "Deal closure completed." },
  { value: "LOST", label: "Lost", ownerHint: "This lead did not convert." },
] as const;

function leadStatusLabel(status?: string) {
  return LEAD_PIPELINE.find((item) => item.value === status)?.label || (status || "NEW").replaceAll("_", " ");
}

function leadStatusHint(status?: string) {
  return LEAD_PIPELINE.find((item) => item.value === status)?.ownerHint || "KrrishJazz is tracking this enquiry.";
}

function leadStatusVariant(status?: string) {
  if (status === "NEW") return "warning";
  if (status === "CONTACTED" || status === "VISIT_SCHEDULED" || status === "NEGOTIATING" || status === "CLOSED") return "success";
  if (status === "LOST") return "error";
  return "default";
}

interface SavedProperty {
  id: string;
  title: string;
  city: string;
  price: number;
  coverImage: string | null;
  images: string[];
  propertyType: string;
  slug: string;
}

// ─── Nav config ─────────────────────────────────────────────────────────────────

function getNavItems(role: string, brokerStatus?: string | null): NavItem[] {
  const iconSize = 20;
  if (role === "CUSTOMER") {
    return [
      { id: "enquiries", label: "My Enquiries", icon: <MessageSquare size={iconSize} /> },
      { id: "saved", label: "Saved Properties", icon: <Heart size={iconSize} /> },
      { id: "post", label: "Post Property", icon: <PlusCircle size={iconSize} /> },
      { id: "profile", label: "Profile", icon: <User size={iconSize} /> },
    ];
  }
  if (role === "BROKER" && brokerStatus !== "APPROVED") {
    return [
      { id: "application", label: "Application Status", icon: <ClipboardList size={iconSize} /> },
      { id: "profile", label: "Profile", icon: <User size={iconSize} /> },
    ];
  }
  const items: NavItem[] = [
    { id: "overview", label: "Today's Work", icon: <LayoutDashboard size={iconSize} /> },
    { id: "properties", label: "My Properties", icon: <Building2 size={iconSize} /> },
    { id: "post", label: "Post Property", icon: <PlusCircle size={iconSize} /> },
    { id: "leads", label: "Leads", icon: <Users size={iconSize} /> },
  ];
  if (role === "OWNER") {
    items.push(
      { id: "enquiries", label: "My Enquiries", icon: <MessageSquare size={iconSize} /> },
      { id: "saved", label: "Saved Properties", icon: <Heart size={iconSize} /> }
    );
  }
  if (role === "BROKER") {
    items.push({ id: "requirements", label: "Requirements", icon: <ClipboardList size={iconSize} /> });
  }
  items.push({ id: "profile", label: "Profile", icon: <User size={iconSize} /> });
  return items;
}

function getDefaultTab(role: string, brokerStatus?: string | null): Tab {
  if (role === "CUSTOMER") return "enquiries";
  if (role === "BROKER" && brokerStatus !== "APPROVED") return "application";
  return "overview";
}

const validTabs: Tab[] = [
  "overview",
  "properties",
  "post",
  "leads",
  "enquiries",
  "saved",
  "profile",
  "application",
  "requirements",
];

// ─── Dashboard Page ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const requestedTab = searchParams.get("tab");
      const allowedTabs = getNavItems(user.role, user.brokerStatus).map((item) => item.id);
      if (requestedTab && validTabs.includes(requestedTab as Tab) && allowedTabs.includes(requestedTab as Tab)) {
        setActiveTab(requestedTab as Tab);
      } else {
        setActiveTab(getDefaultTab(user.role, user.brokerStatus));
      }
    }
  }, [user, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const navItems = getNavItems(user.role, user.brokerStatus);

  return (
    <div className="min-h-screen bg-surface">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-background border-r border-border flex flex-col transition-transform duration-200 shadow-card lg:top-[76px] lg:z-30 lg:h-[calc(100vh-76px)] lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* User section */}
        <div className="p-5 border-b border-border bg-primary-light">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary text-white shadow-sm flex items-center justify-center font-semibold text-sm shrink-0">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate">{user.name || "User"}</p>
              <Badge variant={user.role === "ADMIN" ? "error" : user.role === "BROKER" ? "blue" : user.role === "OWNER" ? "accent" : "default"}>
                {user.role}
              </Badge>
            </div>
            <button
              className="ml-auto lg:hidden p-1 hover:bg-surface rounded-btn"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} className="text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-colors border border-transparent",
                activeTab === item.id
                  ? "bg-primary text-white shadow-card"
                  : "text-text-secondary hover:bg-primary-light hover:text-primary"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        <div className="hidden items-center justify-center gap-3 bg-primary-light px-4 py-4 text-sm font-semibold text-foreground lg:flex">
          <AlertTriangle size={20} className="text-primary" />
          <span>Post property for free. KrrishJazz charges one month brokerage only after a successful closure.</span>
          <button type="button" onClick={() => setActiveTab("post")} className="font-bold text-accent hover:underline">
            Post Free
          </button>
        </div>
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-surface rounded-btn">
            <Menu size={24} className="text-foreground" />
          </button>
          <h1 className="font-semibold text-foreground">Dashboard</h1>
        </div>

        <main className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:px-8 lg:py-6">
          {activeTab === "overview" && <OverviewSection />}
          {activeTab === "properties" && <MyPropertiesSection />}
          {activeTab === "post" && <PostPropertySection onPosted={() => setActiveTab("properties")} />}
          {activeTab === "leads" && <LeadsSection />}
          {activeTab === "enquiries" && <EnquiriesSection />}
          {activeTab === "saved" && <SavedSection />}
          {activeTab === "profile" && <ProfileSection user={user} />}
          {activeTab === "application" && <ApplicationStatusSection brokerStatus={user.brokerStatus} />}
          {activeTab === "requirements" && <RequirementsSection />}
        </main>
      </div>
    </div>
  );
}

// ─── Overview ───────────────────────────────────────────────────────────────────

function OverviewSection() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ownedProperties, setOwnedProperties] = useState<PropertyRow[]>([]);
  const [requirements, setRequirements] = useState<DashboardRequirement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadWorkDesk() {
      if (!user) return;
      setLoading(true);
      try {
        const statsReq = fetch("/api/dashboard/stats", { credentials: "include" }).then((r) => r.json());
        const propertiesReq =
          user.role === "CUSTOMER"
            ? Promise.resolve({ properties: [] })
            : fetch("/api/properties?postedBy=me", { credentials: "include" }).then((r) => r.json()).catch(() => ({ properties: [] }));
        const requirementsReq =
          user.role === "BROKER" && user.brokerStatus === "APPROVED"
            ? fetch("/api/broker/requirements", { credentials: "include" }).then((r) => r.json()).catch(() => ({ requirements: [] }))
            : Promise.resolve({ requirements: [] });

        const [statsData, propertiesData, requirementsData] = await Promise.all([statsReq, propertiesReq, requirementsReq]);
        if (!mounted) return;

        setStats(statsData);
        setOwnedProperties(propertiesData.properties || []);
        setRequirements(requirementsData.requirements || []);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadWorkDesk();
    return () => {
      mounted = false;
    };
  }, [user]);

  const totalProperties = stats?.totalProperties ?? ownedProperties.length;
  const liveProperties = stats?.liveProperties ?? ownedProperties.filter((property) => property.status === "LIVE").length;
  const totalLeads = stats?.totalLeads ?? 0;
  const newLeads = stats?.newLeads ?? 0;
  const pendingReview = ownedProperties.filter((property) => property.status === "PENDING_REVIEW" || property.status === "PENDING").length;
  const onHold = ownedProperties.filter((property) => property.listingStatus === "ON_HOLD").length;
  const staleListings = ownedProperties.filter((property) => {
    if (!property.updatedAt) return false;
    if (property.status !== "LIVE" && property.listingStatus !== "AVAILABLE") return false;
    const days = Math.floor((Date.now() - new Date(property.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
    return days >= 10;
  }).length;
  const activeDemand = requirements.length;
  const matchedDemand = requirements.filter((requirement) => requirement.matchedPropertiesCount > 0).length;
  const totalRequirementMatches = requirements.reduce((sum, requirement) => sum + requirement.matchedPropertiesCount, 0);
  const freshDemand = requirements.filter((requirement) => {
    const days = Math.floor((Date.now() - new Date(requirement.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return days < 7;
  }).length;

  const metrics = [
    { label: "Responses", value: newLeads, hint: "New buyer interest", icon: <Phone size={22} />, tone: "border-warning/20 bg-warning-light text-warning" },
    { label: "Live Listings", value: liveProperties, hint: `${staleListings} need refresh`, icon: <Building2 size={22} />, tone: "border-success/20 bg-success-light text-success" },
    { label: "Pending Actions", value: pendingReview + onHold + staleListings, hint: "Verification and freshness", icon: <ClipboardList size={22} />, tone: "border-error/20 bg-error-light text-error" },
    { label: "Broker Matches", value: totalRequirementMatches, hint: "Potential demand matches", icon: <TrendingUp size={22} />, tone: "border-primary/20 bg-primary-light text-primary" },
  ];

  const workQueue = [
    {
      title: `${newLeads} response${newLeads === 1 ? "" : "s"} waiting`,
      desc: "Review interested buyers and respond quickly.",
      icon: <Phone size={18} />,
      cta: "Open leads",
      href: "/dashboard?tab=leads",
      tone: "text-warning bg-warning/10 border-warning/20",
    },
    {
      title: `${staleListings} listing${staleListings === 1 ? "" : "s"} need freshness`,
      desc: "Refresh availability before brokers or users ask.",
      icon: <Clock size={18} />,
      cta: "Review inventory",
      href: "/dashboard?tab=properties",
      tone: "text-primary bg-primary-light border-primary/20",
    },
    {
      title: `${activeDemand} active requirement${activeDemand === 1 ? "" : "s"}`,
      desc: user?.role === "BROKER" ? "Match demand against network inventory." : "Relevant broker demand can improve listing movement.",
      icon: <ClipboardList size={18} />,
      cta: user?.role === "BROKER" ? "Open demand" : "Post inventory",
      href: user?.role === "BROKER" ? "/broker/requirements" : "/dashboard?tab=post",
      tone: "text-accent bg-accent/10 border-accent/20",
    },
    {
      title: "Add fresh supply",
      desc: "New inventory keeps the network alive.",
      icon: <PlusCircle size={18} />,
      cta: "Post property",
      href: "/dashboard?tab=post",
      tone: "text-success bg-success/10 border-success/20",
    },
  ];

  return (
    <div className="space-y-5">
      {loading ? (
        <div className="flex items-center justify-center rounded-card border border-border bg-white py-16 shadow-card">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <section className="overflow-hidden rounded-card border border-border bg-white shadow-card">
            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="p-6 text-foreground">
                <div className="mb-4 inline-flex items-center gap-2 rounded-pill border border-primary/15 bg-primary-light px-3 py-1.5 text-xs font-semibold text-primary">
                  <Clock size={14} />
                  Welcome to your dashboard
                </div>
                <h2 className="text-3xl font-semibold text-foreground">Your Listings</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                  Manage free listings, responses, freshness, and KrrishJazz-assisted deal closure in one clean owner workspace.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button onClick={() => router.push("/dashboard?tab=post")}>
                    <PlusCircle size={16} className="mr-2" />
                    Post Property
                  </Button>
                  {user?.role === "BROKER" && (
                    <Button variant="outline" onClick={() => router.push("/broker/requirements")}>
                      <ClipboardList size={16} className="mr-2" />
                      Open Demand
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-primary-light p-4">
                <MiniOpsStat label="Total inventory" value={totalProperties} />
                <MiniOpsStat label="Managed leads" value={totalLeads} />
                <MiniOpsStat label="Pending review" value={pendingReview} />
                <MiniOpsStat label="On hold" value={onHold} />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-card border border-border bg-white p-5 shadow-card transition-shadow hover:shadow-lift">
                <div className="mb-4 flex items-center justify-between">
                  <div className={cn("rounded-btn border p-2.5", metric.tone)}>{metric.icon}</div>
                  <Badge variant="default">Today</Badge>
                </div>
                <p className="text-2xl font-bold text-foreground">{metric.value.toLocaleString("en-IN")}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{metric.label}</p>
                <p className="mt-1 text-xs text-text-secondary">{metric.hint}</p>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-card border border-border bg-white p-5 shadow-card">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">Action Queue</h3>
                  <p className="mt-1 text-sm text-text-secondary">The next actions that create deal movement.</p>
                </div>
                <Badge variant="blue">Operational</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {workQueue.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => router.push(item.href)}
                    className="group rounded-card border border-border bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:shadow-card"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className={cn("rounded-btn border p-2", item.tone)}>{item.icon}</div>
                      <span className="text-xs font-semibold text-primary group-hover:text-accent">{item.cta}</span>
                    </div>
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-text-secondary">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-card border border-border bg-white p-5 shadow-card">
              <div className="mb-4">
                <h3 className="font-semibold text-foreground">Network Pulse</h3>
                <p className="mt-1 text-sm text-text-secondary">Signals that keep the work moving.</p>
              </div>
              <div className="space-y-3">
                <PulseRow label="Fresh demand" value={freshDemand} variant="success" />
                <PulseRow label="Matched demand" value={matchedDemand} variant="accent" />
                <PulseRow label="Inventory health" value={liveProperties} variant="blue" />
                <PulseRow label="Follow-up load" value={newLeads} variant="warning" />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-card border border-border bg-white p-5 shadow-card">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">Inventory Watchlist</h3>
                  <p className="mt-1 text-sm text-text-secondary">Refresh, hold, or close listings before they become stale.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push("/dashboard?tab=properties")}>
                  Review
                </Button>
              </div>
              <div className="space-y-3">
                {ownedProperties.slice(0, 4).map((property) => (
                  <div key={property.id} className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{property.title}</p>
                      <p className="text-xs text-text-secondary">{property.city} - {property.propertyType}</p>
                    </div>
                    <Badge variant={property.status === "LIVE" ? "success" : property.status === "PENDING_REVIEW" ? "warning" : "default"}>
                      {(property.listingStatus || property.status).replaceAll("_", " ")}
                    </Badge>
                  </div>
                ))}
                {ownedProperties.length === 0 && (
                  <EmptyWorkHint icon={<Building2 size={22} />} title="No inventory yet" desc="Post your first property to start creating network supply." action="Post property" onClick={() => router.push("/dashboard?tab=post")} />
                )}
              </div>
            </div>

            <div className="rounded-card border border-border bg-white p-5 shadow-card">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">Demand Snapshot</h3>
                  <p className="mt-1 text-sm text-text-secondary">Requirements brokers can act on now.</p>
                </div>
                {user?.role === "BROKER" && (
                  <Button variant="outline" size="sm" onClick={() => router.push("/broker/requirements")}>
                    Open
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {requirements.slice(0, 4).map((requirement) => (
                  <div key={requirement.id} className="rounded-card border border-border bg-surface p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-semibold text-foreground">{requirement.description}</p>
                        <p className="mt-1 text-xs text-text-secondary">
                          {requirement.city} - {requirement.propertyType} - {formatRequirementBudget(requirement)}
                        </p>
                      </div>
                      <Badge variant={requirement.matchedPropertiesCount > 0 ? "accent" : "warning"}>
                        {requirement.matchedPropertiesCount} matches
                      </Badge>
                    </div>
                  </div>
                ))}
                {requirements.length === 0 && (
                  <EmptyWorkHint icon={<ClipboardList size={22} />} title="No demand loaded" desc="Broker requirements will appear here as live demand builds." action={user?.role === "BROKER" ? "Add demand" : "Post inventory"} onClick={() => router.push(user?.role === "BROKER" ? "/broker/requirements" : "/dashboard?tab=post")} />
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

// ─── My Properties ──────────────────────────────────────────────────────────────

function MiniOpsStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-border bg-white p-4 shadow-sm">
      <p className="text-xl font-bold text-foreground">{value.toLocaleString("en-IN")}</p>
      <p className="mt-1 text-xs font-medium text-text-secondary">{label}</p>
    </div>
  );
}

function PulseRow({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "success" | "accent" | "blue" | "warning";
}) {
  const tone = {
    success: "bg-success-light text-success",
    accent: "bg-accent-light text-accent",
    blue: "bg-primary-light text-primary",
    warning: "bg-warning/10 text-warning",
  }[variant];

  return (
    <div className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface p-3">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className={cn("rounded-pill px-2.5 py-1 text-xs font-bold", tone)}>
        {value.toLocaleString("en-IN")}
      </span>
    </div>
  );
}

function EmptyWorkHint({
  icon,
  title,
  desc,
  action,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-card border border-dashed border-border bg-surface p-5 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
        {icon}
      </div>
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm leading-5 text-text-secondary">{desc}</p>
      <Button variant="secondary" size="sm" className="mt-4" onClick={onClick}>
        {action}
      </Button>
    </div>
  );
}

function formatRequirementBudget(requirement: DashboardRequirement) {
  if (requirement.budgetMin && requirement.budgetMax) {
    return `${formatPrice(requirement.budgetMin)} - ${formatPrice(requirement.budgetMax)}`;
  }
  if (requirement.budgetMin) return `From ${formatPrice(requirement.budgetMin)}`;
  if (requirement.budgetMax) return `Up to ${formatPrice(requirement.budgetMax)}`;
  return "Budget flexible";
}

function MyPropertiesSection() {
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingSlug, setRefreshingSlug] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchMyProperties = useCallback(() => {
    setLoading(true);
    fetch("/api/properties?postedBy=me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setProperties(d.properties || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMyProperties();
  }, [fetchMyProperties]);

  const statusVariant = (s: string) => {
    if (s === "LIVE" || s === "APPROVED" || s === "ACTIVE" || s === "AVAILABLE") return "success";
    if (s === "PENDING_REVIEW" || s === "PENDING" || s === "ON_HOLD") return "warning";
    if (s === "REJECTED" || s === "CLOSED") return "error";
    return "default";
  };

  const statusLabel = (s: string) => {
    if (s === "PENDING_REVIEW") return "Pending Review";
    if (s === "ON_HOLD") return "On Hold";
    return s.replaceAll("_", " ");
  };

  const getFreshnessSignal = (property: PropertyRow) => {
    const latest = property.latestFreshness;
    if (latest?.availabilityStatus === "CLOSED") return { label: "Closed", variant: "error" as const, hint: latest.note || "Marked closed" };
    if (latest?.availabilityStatus === "ON_HOLD") return { label: "On hold", variant: "warning" as const, hint: latest.note || "Paused by owner/broker" };
    if (!latest) return { label: "Needs check", variant: "warning" as const, hint: "No availability confirmation yet" };
    if (latest.expiresAt && new Date(latest.expiresAt).getTime() < Date.now()) {
      return { label: "Stale", variant: "error" as const, hint: "Availability expired" };
    }
    if (latest.availabilityStatus === "AVAILABLE") {
      return { label: "Fresh", variant: "success" as const, hint: `Confirmed ${new Date(latest.confirmedAt || property.updatedAt || Date.now()).toLocaleDateString("en-IN")}` };
    }
    return { label: statusLabel(latest.availabilityStatus), variant: "default" as const, hint: latest.note || "Awaiting verification" };
  };

  const updateFreshness = async (slug: string, listingStatus: "AVAILABLE" | "ON_HOLD" | "CLOSED") => {
    setRefreshingSlug(slug);
    try {
      const res = await fetch(`/api/properties/${slug}/freshness`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ listingStatus }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setNotice({ type: "error", text: err?.error || "Failed to update listing" });
        return;
      }

      await fetchMyProperties();
      setNotice({ type: "success", text: "Listing status updated." });
    } catch {
      setNotice({ type: "error", text: "Failed to update listing" });
    } finally {
      setRefreshingSlug(null);
    }
  };

  const getListingHealthScore = (property: PropertyRow) => {
    let score = 24;
    if ((property.images?.length || 0) >= 3 || property.coverImage) score += 18;
    if (property.status === "LIVE") score += 18;
    if (property.latestFreshness?.availabilityStatus === "AVAILABLE") score += 16;
    if (property.locality && property.city) score += 10;
    if (property._count?.enquiries) score += Math.min(14, property._count.enquiries * 3);
    return Math.min(96, score);
  };

  const getPropertyId = (id: string) => id.slice(-8).toUpperCase();

  const getDuration = (value?: string) => {
    if (!value) return "Posted recently";
    const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24)));
    if (days === 0) return "Posted today";
    if (days === 1) return "Posted 1 day ago";
    return `Posted ${days} days ago`;
  };

  return (
    <div>
      <div className="mb-5">
        <p className="mb-2 text-sm font-medium text-foreground">Welcome to your dashboard</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Your Listings</h2>
            <p className="text-sm text-text-secondary mt-1">Manage free listings, verification, freshness and responses.</p>
          </div>
          <Button onClick={() => window.location.href = "/dashboard?tab=post"}>Post Property</Button>
        </div>
      </div>
      {notice && (
        <div className={cn("mb-4 rounded-card border px-4 py-3 text-sm font-medium", notice.type === "success" ? "border-success/20 bg-success-light text-success" : "border-error/20 bg-error-light text-error")}>
          {notice.text}
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-card shadow-card p-8 text-center border border-border">
          <Home size={48} className="mx-auto text-text-secondary mb-3" />
          <p className="text-text-secondary">You haven&apos;t posted any properties yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {properties.map((p) => {
            const freshness = getFreshnessSignal(p);
            const listingHealth = getListingHealthScore(p);
            const image = p.coverImage || p.images?.[0];
            const pendingActions = [
              p.status !== "LIVE" ? "Awaiting verification" : null,
              freshness.variant !== "success" ? "Confirm availability" : null,
              listingHealth < 70 ? "Improve listing health" : null,
            ].filter(Boolean);

            return (
              <article key={p.id} className="overflow-hidden rounded-card border border-border bg-white shadow-card">
                <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
                  <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-btn bg-surface lg:w-52">
                    {image ? <img src={image} alt={p.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-primary"><Building2 size={34} /></div>}
                    <span className="absolute left-2 top-2 rounded-sm bg-white px-2 py-0.5 text-[11px] font-bold text-foreground shadow-sm">
                      {p.status === "LIVE" ? "Verified" : "Not Verified"}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant(p.listingStatus || p.status)}>{statusLabel(p.listingStatus || p.status)}</Badge>
                      <Badge variant={freshness.variant}>{freshness.label}</Badge>
                    </div>
                    <h3 className="line-clamp-1 text-lg font-bold text-foreground">{p.title}</h3>
                    <p className="mt-1 text-sm text-text-secondary">{p.locality ? `${p.locality}, ` : ""}{p.city}</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div><p className="text-xs text-text-secondary">Price</p><p className="font-semibold text-foreground">{formatPrice(p.price)}</p></div>
                      <div><p className="text-xs text-text-secondary">Property ID</p><p className="font-semibold text-foreground">{getPropertyId(p.id)}</p></div>
                      <div><p className="text-xs text-text-secondary">Duration</p><p className="font-semibold text-foreground">{getDuration(p.createdAt)}</p></div>
                    </div>
                  </div>

                  <div className="w-full shrink-0 rounded-card border border-border bg-surface p-4 lg:w-64">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-bold text-foreground">Listing Health</p>
                      <p className="text-xl font-bold text-primary">{listingHealth}%</p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-pill bg-border">
                      <div className="h-full rounded-pill bg-success" style={{ width: `${listingHealth}%` }} />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-foreground">{pendingActions.length || 0} pending action{pendingActions.length === 1 ? "" : "s"}</p>
                    <div className="mt-3 space-y-2">
                      <div className="rounded-btn bg-primary-light px-3 py-2">
                        <span className="text-xs font-semibold text-foreground">Free listing active</span>
                        <p className="mt-1 text-[11px] leading-4 text-text-secondary">One month brokerage applies only after successful closure.</p>
                      </div>
                      <div className="flex items-center justify-between rounded-btn bg-error-light px-3 py-2">
                        <span className="text-xs font-semibold text-foreground">Verify your property</span>
                        <button onClick={() => updateFreshness(p.slug, "AVAILABLE")} className="text-xs font-bold text-accent">Self Verify</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-white px-4 py-3">
                  <div className="text-sm text-text-secondary">
                    <strong className="text-foreground">{p._count?.enquiries ?? 0}</strong> responses on this posting
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" loading={refreshingSlug === p.slug} onClick={() => updateFreshness(p.slug, "AVAILABLE")}>Confirm</Button>
                    <Button variant="ghost" size="sm" loading={refreshingSlug === p.slug} onClick={() => updateFreshness(p.slug, "ON_HOLD")}>Hold</Button>
                    <Button variant="ghost" size="sm" loading={refreshingSlug === p.slug} onClick={() => updateFreshness(p.slug, "CLOSED")}>Closed</Button>
                    <Button size="sm" onClick={() => window.location.href = `/properties/${p.slug}`}>Manage Listing</Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Post Property (Multi-step Form) ────────────────────────────────────────────

const STEPS = ["Type", "Details", "Location", "Media", "Review"];

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  RESIDENTIAL: <Home size={20} />,
  COMMERCIAL: <Store size={20} />,
  INDUSTRIAL: <Factory size={20} />,
  AGRICULTURAL: <Trees size={20} />,
  HOSPITALITY: <Building2 size={20} />,
};

function PostPropertySection({ onPosted }: { onPosted: () => void }) {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [upgradingOwner, setUpgradingOwner] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PropertyInput>({
    resolver: zodResolver(propertySchema) as any,
    defaultValues: {
      amenities: [],
      images: [],
      priceNegotiable: false,
      areaUnit: "sqft",
      visibilityType: "PUBLIC_TO_CUSTOMERS",
      publicBrokerName: "KrrishJazz",
    },
  });

  const category = watch("category");
  const selectedPropertyType = watch("propertyType");
  const selectedListingType = watch("listingType");
  const watchedPrice = watch("price");
  const watchedArea = watch("area");
  const watchedCity = watch("city");
  const watchedLocality = watch("locality");
  const watchedAddress = watch("address");
  const watchedVisibility = watch("visibilityType");
  const watchedPublicBrokerName = watch("publicBrokerName");
  const activeTypeGuide = selectedPropertyType ? PROPERTY_TYPE_GUIDE[selectedPropertyType] : null;

  const propertyTypeLower = (selectedPropertyType || "").toLowerCase();
  const isResidentialDetail = /(apartment|villa|house|penthouse|studio|row|floor)/.test(propertyTypeLower);
  const isCommercialDetail = /(office|co-working|shop|showroom|mall|restaurant|cafe|sco)/.test(propertyTypeLower);
  const isIndustrialDetail = /(warehouse|godown|industrial|factory|shed|storage|logistics)/.test(propertyTypeLower);
  const isPlotDetail = /(plot|land|orchard|plantation)/.test(propertyTypeLower);
  const isHospitalityDetail = /(pg|co-living|hostel|serviced|guest|hotel|resort)/.test(propertyTypeLower);
  const shouldShowRooms = isResidentialDetail || (!selectedPropertyType && category === "RESIDENTIAL");
  const shouldShowFurnishing = !isPlotDetail && !/(land)/.test(propertyTypeLower);
  const suggestedAmenities = (() => {
    if (category && CATEGORY_AMENITIES[category]) return CATEGORY_AMENITIES[category];
    if (isCommercialDetail) return CATEGORY_AMENITIES.COMMERCIAL;
    if (isIndustrialDetail) return CATEGORY_AMENITIES.INDUSTRIAL;
    if (isPlotDetail) return ["Road Access", "Fencing", "Water Supply", "Electricity"];
    return AMENITIES;
  })();

  const reviewChecklist = [
    {
      label: "Photos uploaded",
      detail: images.length > 0 ? `${images.length} image${images.length === 1 ? "" : "s"} ready` : "Add at least one clear photo",
      complete: images.length > 0,
    },
    {
      label: "Price is clear",
      detail: watchedPrice ? formatPrice(Number(watchedPrice)) : "Add expected price",
      complete: Boolean(watchedPrice && Number(watchedPrice) > 0),
    },
    {
      label: "Location is clear",
      detail: watchedLocality || watchedCity || watchedAddress ? [watchedLocality, watchedCity].filter(Boolean).join(", ") || "Address added" : "Add locality and city",
      complete: Boolean(watchedAddress && watchedCity),
    },
    {
      label: "Contact managed",
      detail: watchedPublicBrokerName || "KrrishJazz",
      complete: Boolean(watchedPublicBrokerName),
    },
    {
      label: "Listing reach selected",
      detail: (watchedVisibility || "PUBLIC_TO_CUSTOMERS").replaceAll("_", " "),
      complete: Boolean(watchedVisibility),
    },
  ];

  const handleEnableOwnerAccess = async () => {
    setUpgradingOwner(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ wantToListAsOwner: true }),
      });
      if (res.ok) {
        await refreshUser();
      } else {
        const err = await res.json();
        toast(err.error || "Could not enable owner listing access", "error");
      }
    } catch {
      toast("Could not enable owner listing access", "error");
    } finally {
      setUpgradingOwner(false);
    }
  };

  if (user?.role === "CUSTOMER") {
    return (
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-6">Post Property</h2>
        <div className="bg-white rounded-card shadow-card border border-border p-8 max-w-xl">
          <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center mb-4">
            <Home size={28} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">List your own property</h3>
          <p className="text-sm text-text-secondary mb-6">
            Enable owner access on this same account. You will keep your saved properties and enquiries, and you can also post and manage your own listings.
          </p>
          <Button onClick={handleEnableOwnerAccess} loading={upgradingOwner}>
            Continue as Owner
          </Button>
        </div>
      </div>
    );
  }

  const validateStep = async () => {
    let fields: (keyof PropertyInput)[] = [];
    if (step === 0) fields = ["title", "description", "listingType", "category", "propertyType"];
    if (step === 1) fields = ["price", "area"];
    if (step === 2) fields = ["address", "locality", "city", "state", "pincode"];
    if (step === 3) {
      if (images.length === 0) {
        setValue("images", [], { shouldValidate: true });
        return false;
      }
      fields = ["visibilityType", "publicBrokerName", "images"];
    }
    const valid = await trigger(fields);
    return valid;
  };

  const handleNext = async () => {
    const valid = await validateStep();
    if (valid && step < STEPS.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const fieldStepMap: Record<string, number> = {
    title: 0,
    description: 0,
    listingType: 0,
    category: 0,
    propertyType: 0,
    price: 1,
    area: 1,
    areaUnit: 1,
    bedrooms: 1,
    bathrooms: 1,
    floor: 1,
    totalFloors: 1,
    ageYears: 1,
    furnishing: 1,
    priceNegotiable: 1,
    address: 2,
    locality: 2,
    city: 2,
    state: 2,
    pincode: 2,
    lat: 2,
    lng: 2,
    amenities: 3,
    images: 3,
    coverImage: 3,
    visibilityType: 3,
    publicBrokerName: 3,
    videoUrl: 3,
  };

  const handleFinalSubmit = async () => {
    if (!termsAccepted) {
      toast("Please acknowledge the free listing and brokerage terms before submitting.", "error");
      return;
    }
    const valid = await trigger();
    if (!valid) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        setStep(fieldStepMap[firstErrorField] ?? 0);
      }
      return;
    }
    handleSubmit(onSubmit)();
  };

  const onSubmit = async (data: PropertyInput) => {
    if (uploadingImages) {
      toast("Please wait for images to finish uploading.", "info");
      return;
    }

    setSubmitting(true);
    data.amenities = selectedAmenities;
    data.images = images;
    data.coverImage = images[0];
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast("Property posted successfully.", "success");
        reset({
          amenities: [],
          images: [],
          priceNegotiable: false,
          areaUnit: "sqft",
          visibilityType: "PUBLIC_TO_CUSTOMERS",
          publicBrokerName: "KrrishJazz",
        });
        setImages([]);
        setSelectedAmenities([]);
        setTermsAccepted(false);
        setStep(0);
        onPosted();
      } else {
        const err = await res.json();
        console.error("Property post failed", err);
        toast(typeof err.error === "string" ? err.error : "Failed to post property", "error");
      }
    } catch (error) {
      console.error("Property post error", error);
      toast("Something went wrong while posting property.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAmenity = (a: string) => {
    setSelectedAmenities((prev) => {
      const updated = prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a];
      setValue("amenities", updated, { shouldValidate: true });
      return updated;
    });
  };

  const uploadImages = async (files: FileList) => {
    setUploadingImages(true);
    setUploadError("");

    try {
      const signRes = await fetch("/api/upload/sign", {
        method: "POST",
        credentials: "include",
      });
      const sign = await signRes.json();

      if (!signRes.ok) {
        throw new Error(sign.error || "Failed to prepare upload");
      }

      const uploadedUrls = await Promise.all(
        Array.from(files).map(async (file) => {
          if (file.size > 5 * 1024 * 1024) {
            throw new Error(`${file.name} is larger than 5MB`);
          }

          const formData = new FormData();
          formData.append("file", file);
          formData.append("api_key", sign.apiKey);
          formData.append("timestamp", String(sign.timestamp));
          formData.append("signature", sign.signature);
          formData.append("folder", "krishjazz");
          if (sign.uploadPreset) {
            formData.append("upload_preset", sign.uploadPreset);
          }

          const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
            { method: "POST", body: formData }
          );
          const upload = await uploadRes.json();

          if (!uploadRes.ok || !upload.secure_url) {
            throw new Error(upload.error?.message || `Failed to upload ${file.name}`);
          }

          return upload.secure_url as string;
        })
      );

      setImages((prev) => {
        const nextImages = [...prev, ...uploadedUrls];
        setValue("images", nextImages, { shouldValidate: true });
        setValue("coverImage", nextImages[0], { shouldValidate: true });
        return nextImages;
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload images";
      setUploadError(message);
      if (images.length === 0) {
        setValue("images", [], { shouldValidate: true });
      }
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const nextImages = prev.filter((_, i) => i !== index);
      setValue("images", nextImages, { shouldValidate: true });
      setValue("coverImage", nextImages[0] || "", { shouldValidate: true });
      return nextImages;
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-6">Post Property</h2>
      <div className="mb-6 rounded-card border border-primary/20 bg-primary-light p-4">
        <p className="text-sm font-semibold text-primary">Free listing on KrrishJazz</p>
        <p className="mt-1 text-xs leading-5 text-text-secondary">No upfront posting charge. KrrishJazz verifies details, coordinates enquiries, and charges one month brokerage only after a successful closure.</p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-card shadow-card border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    i < step
                      ? "bg-primary text-white"
                      : i === step
                      ? "bg-primary text-white ring-4 ring-primary/20"
                      : "bg-surface text-text-secondary border border-border"
                  )}
                >
                  {i < step ? <Check size={16} /> : i + 1}
                </div>
                <span className="text-xs mt-1 text-text-secondary hidden sm:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("w-8 sm:w-16 h-0.5 mx-1", i < step ? "bg-primary" : "bg-border")} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-card shadow-card border border-border p-6">
          {/* Step 1: Basic Info */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="rounded-card border border-primary/20 bg-primary-light p-4">
                <p className="text-sm font-semibold text-primary">Start with the deal shape</p>
                <p className="text-xs text-text-secondary mt-1">Pick category and property type first. The next steps adapt like a property portal upload flow.</p>
              </div>
              <Input label="Title" placeholder="e.g. 3BHK Apartment in Andheri" error={errors.title?.message} {...register("title")} />
              <Textarea label="Description" placeholder="Describe the property..." error={errors.description?.message} {...register("description")} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Listing Type"
                  options={[
                    { value: "BUY", label: "Buy" },
                    { value: "RENT", label: "Rent" },
                    { value: "RESALE", label: "Resale" },
                    { value: "LEASE", label: "Lease" },
                    { value: "COMMERCIAL", label: "Commercial" },
                  ]}
                  error={errors.listingType?.message}
                  {...register("listingType")}
                />
              </div>

              <input type="hidden" {...register("category")} />
              <input type="hidden" {...register("propertyType")} />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  {errors.category?.message && <p className="text-xs text-error">{errors.category.message}</p>}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {PROPERTY_CATEGORY_OPTIONS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setValue("category", item.value as PropertyInput["category"], { shouldValidate: true });
                        setValue("propertyType", "", { shouldValidate: true });
                      }}
                      className={cn(
                        "rounded-card border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-card",
                        category === item.value
                          ? "border-primary bg-primary-light text-primary shadow-card"
                          : "border-border bg-surface text-foreground hover:border-primary/40"
                      )}
                    >
                      <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-btn", category === item.value ? "bg-white text-primary" : "bg-white text-primary")}>
                        {CATEGORY_ICON_MAP[item.value] || <Building2 size={20} />}
                      </div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="mt-1 text-xs leading-5 text-text-secondary">{item.hint}</p>
                    </button>
                  ))}
                </div>
              </div>

              {category && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Property Type</label>
                    {errors.propertyType?.message && <p className="text-xs text-error">{errors.propertyType.message}</p>}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {(PROPERTY_TYPES[category] || []).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setValue("propertyType", type, { shouldValidate: true })}
                        className={cn(
                          "rounded-btn border px-3 py-2 text-left text-sm font-medium transition-colors",
                          selectedPropertyType === type
                            ? "border-primary bg-primary-light text-primary"
                            : "border-border bg-white text-text-secondary hover:border-primary/30 hover:text-primary"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Details */}
          {step === 1 && (
            <div className="space-y-4">
              {selectedPropertyType && (
                <div className="rounded-card border border-primary/20 bg-primary-light p-4">
                  <p className="text-sm font-semibold text-primary">{selectedPropertyType} details</p>
                  <p className="text-xs text-text-secondary mt-1">
                    {activeTypeGuide?.hint ||
                      (isPlotDetail
                        ? "Rooms and furnishing are skipped for plot/land inventory."
                        : isCommercialDetail
                        ? "Commercial cards will highlight area, fit-out, parking and power backup."
                        : isIndustrialDetail
                        ? "Industrial cards will highlight area, access, power and use case."
                        : isHospitalityDetail
                        ? "Hospitality cards will highlight capacity, services, security and stay terms."
                        : "Residential cards will highlight BHK, bathrooms, floor and furnishing.")}
                  </p>
                  {activeTypeGuide?.fields?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeTypeGuide.fields.map((field) => (
                        <span key={field} className="rounded-pill border border-primary/20 bg-white px-3 py-1 text-xs font-medium text-primary">
                          {field}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Price (₹)" type="number" placeholder="e.g. 5000000" error={errors.price?.message} {...register("price")} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Area" type="number" placeholder="e.g. 1200" error={errors.area?.message} {...register("area")} />
                  <Select
                    label="Unit"
                    options={AREA_UNITS.map((unit) => ({ value: unit, label: unit.toUpperCase() }))}
                    {...register("areaUnit")}
                  />
                </div>
              </div>
              {shouldShowRooms && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Input label="Bedrooms" type="number" placeholder="0" {...register("bedrooms")} />
                  <Input label="Bathrooms" type="number" placeholder="0" {...register("bathrooms")} />
                  <Input label="Floor" type="number" placeholder="0" {...register("floor")} />
                  <Input label="Total Floors" type="number" placeholder="0" {...register("totalFloors")} />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Age (years)" type="number" placeholder="0" {...register("ageYears")} />
                {shouldShowFurnishing && (
                  <Select
                    label={isCommercialDetail ? "Fit-out / Furnishing" : "Furnishing"}
                    options={FURNISHING_OPTIONS.map((f) => ({ value: f, label: f }))}
                    {...register("furnishing")}
                  />
                )}
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input type="checkbox" className="rounded border-border" {...register("priceNegotiable")} />
                Price Negotiable
              </label>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 2 && (
            <div className="space-y-4">
              <Textarea label="Address" placeholder="Full address..." error={errors.address?.message} {...register("address")} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input label="Locality" placeholder="e.g. Salt Lake, Park Street" error={errors.locality?.message} {...register("locality")} />
                <Input label="City" placeholder="e.g. Kolkata" error={errors.city?.message} {...register("city")} />
                <Select
                  label="State"
                  options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
                  error={errors.state?.message}
                  {...register("state")}
                />
                <Input label="Pincode" placeholder="400001" error={errors.pincode?.message} {...register("pincode")} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Latitude (optional)" type="number" step="any" placeholder="19.076" {...register("lat")} />
                <Input label="Longitude (optional)" type="number" step="any" placeholder="72.877" {...register("lng")} />
              </div>
            </div>
          )}

          {/* Step 4: Images & Amenities */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Listing Reach"
                  options={[
                    { value: "PUBLIC_TO_CUSTOMERS", label: "Public Search + Broker Network" },
                    { value: "BROKER_NETWORK_ONLY", label: "Broker Network Only" },
                    { value: "PRIVATE", label: "Private Draft" },
                  ]}
                  error={errors.visibilityType?.message}
                  {...register("visibilityType")}
                />
                <Input
                  label="Displayed Contact / Managed By"
                  placeholder="KrrishJazz"
                  error={errors.publicBrokerName?.message}
                  {...register("publicBrokerName")}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Property Images</label>
                <div
                  className="border-2 border-dashed border-border rounded-card p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "copy";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files.length > 0) uploadImages(e.dataTransfer.files);
                  }}
                >
                  <Upload size={32} className="mx-auto text-text-secondary mb-2" />
                  <p className="text-sm text-text-secondary">
                    {uploadingImages ? "Uploading images..." : "Drag & drop images here or click to browse"}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">PNG, JPG up to 5MB each</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) uploadImages(files);
                    }}
                  />
                </div>
                {uploadError && <p className="text-xs text-error mt-2">{uploadError}</p>}
                {errors.images?.message && <p className="text-xs text-error mt-2">{errors.images.message}</p>}
                {images.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {images.map((img, i) => (
                      <div key={`${img}-${i}`} className="relative w-20 h-20 rounded-btn bg-surface border border-border overflow-hidden group">
                        <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                        {i === 0 && (
                          <span className="absolute left-1 bottom-1 bg-primary text-white text-[10px] font-medium px-1.5 py-0.5 rounded-pill">
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(i);
                          }}
                          className="absolute right-1 top-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Remove image ${i + 1}`}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-3">Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {suggestedAmenities.map((a) => (
                    <label
                      key={a}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-btn border cursor-pointer text-sm transition-colors",
                        selectedAmenities.includes(a)
                          ? "border-primary bg-primary-light text-primary"
                          : "border-border text-text-secondary hover:border-primary/30"
                      )}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedAmenities.includes(a)}
                        onChange={() => toggleAmenity(a)}
                      />
                      {selectedAmenities.includes(a) && <Check size={14} />}
                      {a}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-card border border-primary/20 bg-primary-light p-4">
                <p className="text-sm font-semibold text-primary">Review before publishing</p>
                <p className="text-xs text-text-secondary mt-1">This is what brokers and customers will scan first. Your listing stays free; brokerage applies only when KrrishJazz helps close the deal.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-card border border-border bg-surface p-4">
                  <p className="text-xs text-text-secondary">Listing</p>
                  <p className="font-semibold text-foreground mt-1">{selectedListingType || "Not selected"} - {selectedPropertyType || "Property"}</p>
                  <p className="text-sm text-text-secondary mt-1">{watchedCity || "City pending"}</p>
                </div>
                <div className="rounded-card border border-border bg-surface p-4">
                  <p className="text-xs text-text-secondary">Price & Area</p>
                  <p className="font-semibold text-foreground mt-1">{watchedPrice ? formatPrice(Number(watchedPrice)) : "Price pending"}</p>
                  <p className="text-sm text-text-secondary mt-1">{watchedArea ? `${Number(watchedArea).toLocaleString()} sqft approx.` : "Area pending"}</p>
                </div>
                <div className="rounded-card border border-border bg-surface p-4">
                  <p className="text-xs text-text-secondary">Listing Reach</p>
                  <p className="font-semibold text-foreground mt-1">{(watchedVisibility || "PUBLIC_TO_CUSTOMERS").replaceAll("_", " ")}</p>
                  <p className="text-sm text-text-secondary mt-1">{selectedAmenities.length} amenit{selectedAmenities.length === 1 ? "y" : "ies"} selected</p>
                </div>
                <div className="rounded-card border border-border bg-surface p-4">
                  <p className="text-xs text-text-secondary">Photos</p>
                  <p className="font-semibold text-foreground mt-1">{images.length} uploaded</p>
                  <p className="text-sm text-text-secondary mt-1">First image will be used as cover.</p>
                </div>
              </div>
              {images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.slice(0, 6).map((image, index) => (
                    <img key={`${image}-${index}`} src={image} alt={`Review ${index + 1}`} className="h-20 w-24 rounded-card object-cover border border-border" />
                  ))}
                </div>
              )}

              <div className="rounded-card border border-border bg-white p-4 shadow-card">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Final listing checklist</p>
                    <p className="mt-1 text-xs leading-5 text-text-secondary">Complete these checks before sending the listing for KrrishJazz verification.</p>
                  </div>
                  <Badge variant={reviewChecklist.every((item) => item.complete) ? "success" : "warning"}>
                    {reviewChecklist.filter((item) => item.complete).length}/{reviewChecklist.length} ready
                  </Badge>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {reviewChecklist.map((item) => (
                    <div key={item.label} className={cn("flex items-start gap-3 rounded-btn border px-3 py-3", item.complete ? "border-success/20 bg-success-light" : "border-warning/20 bg-warning-light")}>
                      <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full", item.complete ? "bg-success text-white" : "bg-warning text-white")}>
                        {item.complete ? <Check size={13} /> : <AlertTriangle size={12} />}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.label}</p>
                        <p className="mt-0.5 text-xs leading-5 text-text-secondary">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-card border border-primary/20 bg-primary-light p-4">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-primary text-primary"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">I understand KrrishJazz listing terms</span>
                    <span className="mt-1 block text-xs leading-5 text-text-secondary">
                      Posting is free. KrrishJazz will verify details and coordinate enquiries. One month brokerage applies only after successful deal closure.
                    </span>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button type="button" variant="ghost" onClick={handleBack} disabled={step === 0}>
              <ChevronLeft size={16} className="mr-1" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={handleNext}>
                Next <ChevronRight size={16} className="ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFinalSubmit}
                loading={submitting || uploadingImages}
                disabled={uploadingImages || !termsAccepted}
                className="relative z-10"
              >
                Submit Property
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── Leads ──────────────────────────────────────────────────────────────────────

function LeadsSection() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/enquiries?type=received", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const items = (d.enquiries || []).map((e: any) => ({
          id: e.id,
          customerName: e.customer?.name || e.name,
          phone: e.customer?.phone || e.phone,
          propertyTitle: e.property?.title || "",
          propertySlug: e.property?.slug,
          message: e.message,
          date: e.createdAt,
          status: e.status,
          visitDate: e.visitDate,
        }));
        setLeads(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pipelineCounts = LEAD_PIPELINE.map((item) => ({
    ...item,
    count: leads.filter((lead) => lead.status === item.value).length,
  }));

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-2">Managed Enquiries Received</h2>
      <p className="mb-6 text-sm text-text-secondary">Customer contact stays protected. KrrishJazz coordinates callbacks and shares deal-ready context.</p>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-card shadow-card p-8 text-center border border-border">
          <Users size={48} className="mx-auto text-text-secondary mb-3" />
          <p className="text-text-secondary">No enquiries received yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {pipelineCounts.map((item) => (
              <div key={item.value} className="rounded-card border border-border bg-white p-3 shadow-card">
                <p className="text-xl font-bold text-foreground">{item.count}</p>
                <p className="mt-1 text-xs font-semibold text-foreground">{item.label}</p>
                <p className="mt-0.5 text-[11px] leading-4 text-text-secondary">{item.ownerHint}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4">
            {leads.map((lead) => (
              <LeadPipelineCard key={lead.id} lead={lead} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── My Enquiries (Customer) ────────────────────────────────────────────────────

function LeadPipelineCard({ lead }: { lead: LeadRow }) {
  const currentIndex = Math.max(0, LEAD_PIPELINE.findIndex((item) => item.value === lead.status));
  const visibleSteps = LEAD_PIPELINE.filter((item) => item.value !== "LOST");
  const isLost = lead.status === "LOST";

  return (
    <article className="rounded-card border border-border bg-white p-4 shadow-card">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant={leadStatusVariant(lead.status) as any}>{leadStatusLabel(lead.status)}</Badge>
            {lead.visitDate && <Badge variant="blue">Visit: {new Date(lead.visitDate).toLocaleDateString("en-IN")}</Badge>}
          </div>
          <h3 className="text-base font-semibold text-foreground">{lead.propertyTitle || "Property enquiry"}</h3>
          <p className="mt-1 text-sm text-text-secondary">
            {lead.customerName || "Customer"} - {lead.phone || "KrrishJazz managed contact"}
          </p>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-text-secondary">{lead.message}</p>
        </div>
        <div className="shrink-0 text-sm text-text-secondary">
          {new Date(lead.date).toLocaleDateString("en-IN")}
        </div>
      </div>

      <div className="mt-4 rounded-card border border-primary/10 bg-primary-light p-3">
        <p className="text-sm font-semibold text-primary">{leadStatusHint(lead.status)}</p>
        <p className="mt-1 text-xs leading-5 text-text-secondary">KrrishJazz manages callback, visit coordination and deal discussion before brokerage applies on closure.</p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        {visibleSteps.map((step, index) => {
          const complete = !isLost && index <= currentIndex;
          return (
            <div key={step.value}>
              <div className={cn("h-1.5 rounded-pill", complete ? "bg-primary" : "bg-border")} />
              <p className={cn("mt-2 text-xs font-semibold", complete ? "text-primary" : "text-text-secondary")}>{step.label}</p>
            </div>
          );
        })}
      </div>

      {isLost && (
        <div className="mt-3 rounded-btn border border-error/20 bg-error-light px-3 py-2 text-xs font-semibold text-error">
          This lead was marked lost by KrrishJazz ops.
        </div>
      )}
    </article>
  );
}

function EnquiriesSection() {
  const [enquiries, setEnquiries] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/enquiries?type=sent", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const items = (d.enquiries || []).map((e: any) => ({
          id: e.id,
          customerName: "",
          phone: "",
          propertyTitle: e.property?.title || "",
          propertySlug: e.property?.slug,
          message: e.message,
          date: e.createdAt,
          status: e.status,
          visitDate: e.visitDate,
        }));
        setEnquiries(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-6">My Enquiries</h2>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : enquiries.length === 0 ? (
        <div className="bg-white rounded-card shadow-card p-8 text-center border border-border">
          <MessageSquare size={48} className="mx-auto text-text-secondary mb-3" />
          <p className="text-text-secondary">You haven&apos;t sent any enquiries yet.</p>
          <Button className="mt-4" onClick={() => (window.location.href = "/properties")}>
            Browse Properties
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((e) => (
            <div key={e.id} className="bg-white rounded-card shadow-card border border-border p-4">
              <div className="flex items-start gap-4">
              <div className="p-2 bg-primary-light rounded-btn shrink-0">
                <Building2 size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{e.propertyTitle}</p>
                <p className="text-sm text-text-secondary mt-1 line-clamp-2">{e.message}</p>
                <p className="text-xs text-text-secondary mt-2">
                  {new Date(e.date).toLocaleDateString("en-IN")}
                </p>
              </div>
              <Badge variant={leadStatusVariant(e.status) as any}>{leadStatusLabel(e.status)}</Badge>
              </div>
              <div className="mt-4 rounded-card border border-primary/10 bg-primary-light p-3">
                <p className="text-sm font-semibold text-primary">{leadStatusHint(e.status)}</p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">KrrishJazz will coordinate the callback, visit and deal discussion with protected contact handling.</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Saved Properties (Customer) ────────────────────────────────────────────────

function SavedSection() {
  const [saved, setSaved] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/saved", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const items = (d.saved || []).map((s: any) => ({
          id: s.property.id,
          title: s.property.title,
          city: s.property.city,
          price: s.property.price,
          coverImage: s.property.coverImage,
          images: JSON.parse(s.property.images || "[]"),
          propertyType: s.property.propertyType,
          slug: s.property.slug,
        }));
        setSaved(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-6">Saved Properties</h2>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : saved.length === 0 ? (
        <div className="bg-white rounded-card shadow-card p-8 text-center border border-border">
          <Heart size={48} className="mx-auto text-text-secondary mb-3" />
          <p className="text-text-secondary">No saved properties.</p>
          <Button className="mt-4" onClick={() => (window.location.href = "/properties")}>
            Browse Properties
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map((p) => (
            <a
              key={p.id}
              href={`/properties/${p.slug}`}
              className="bg-white rounded-card shadow-card border border-border overflow-hidden hover:shadow-lift transition-shadow"
            >
              <div className="h-40 bg-surface">
                {p.coverImage || p.images[0] ? (
                  <img src={p.coverImage || p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home size={32} className="text-text-secondary" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="font-medium text-foreground truncate">{p.title}</p>
                <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
                  <MapPin size={14} /> {p.city}
                </p>
                <p className="text-primary font-semibold mt-2">{formatPrice(p.price)}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Profile ────────────────────────────────────────────────────────────────────

function ProfileSection({ user }: { user: { id: string; name: string | null; email: string | null; phone: string; role: string } }) {
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email }),
      });
      if (res.ok) {
        await refreshUser();
        setEditing(false);
        toast("Profile updated.", "success");
      }
    } catch {
      toast("Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-foreground">Profile</h2>
        <p className="text-sm text-text-secondary mt-1">Manage your account details and broker identity.</p>
      </div>
      <div className="bg-white rounded-card shadow-card border border-border overflow-hidden max-w-lg">
        <div className="h-2 bg-gradient-to-r from-primary via-success to-accent" />
        <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary text-white shadow-sm flex items-center justify-center font-bold text-xl">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{user.name || "User"}</p>
            <Badge variant={user.role === "ADMIN" ? "error" : user.role === "BROKER" ? "blue" : user.role === "OWNER" ? "accent" : "default"}>
              {user.role}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-1">
              <User size={14} /> Name
            </label>
            {editing ? (
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            ) : (
              <p className="text-sm text-text-secondary px-3 py-2 bg-surface border border-border rounded-btn">{user.name || "—"}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-1">
              <Mail size={14} /> Email
            </label>
            {editing ? (
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
            ) : (
              <p className="text-sm text-text-secondary px-3 py-2 bg-surface border border-border rounded-btn">{user.email || "—"}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-1">
              <Phone size={14} /> Phone
            </label>
            <p className="text-sm text-text-secondary px-3 py-2 bg-surface border border-border rounded-btn">{user.phone}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {editing ? (
            <>
              <Button onClick={handleSave} loading={saving}>Save Changes</Button>
              <Button variant="ghost" onClick={() => { setEditing(false); setName(user.name || ""); setEmail(user.email || ""); }}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Edit size={14} className="mr-1.5" /> Edit Profile
            </Button>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

// ─── Application Status (Broker Pending) ────────────────────────────────────────

function ApplicationStatusSection({ brokerStatus }: { brokerStatus?: string | null }) {
  const { toast } = useToast();
  const [showReapply, setShowReapply] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    rera: "",
    experience: "",
    city: "",
    serviceAreas: "",
    bio: "",
  });

  const submitReapply = async () => {
    if (!form.rera || !form.experience || !form.city || !form.bio) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/broker/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          experience: Number(form.experience),
        }),
      });
      if (res.ok) {
        toast("Broker re-application submitted.", "success");
        window.location.reload();
        return;
      }
      const error = await res.json();
      toast(error.error || "Could not submit broker re-application", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-6">Application Status</h2>
      <div className="bg-white rounded-card shadow-card border border-border p-8 max-w-lg">
        {brokerStatus === "PENDING" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Under Review</h3>
            <p className="text-text-secondary">
              Your broker application is currently being reviewed by our admin team.
              We&apos;ll notify you once a decision has been made.
            </p>
            <Badge variant="warning" className="mt-4">PENDING</Badge>
          </div>
        )}
        {brokerStatus === "REJECTED" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-error" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Application Rejected</h3>
            <p className="text-text-secondary">
              Unfortunately, your broker application was not approved.
              Update your details and send it back to KrrishJazz ops for review.
            </p>
            <Badge variant="error" className="mt-4">REJECTED</Badge>
            <Button className="mt-5" variant="outline" onClick={() => setShowReapply((value) => !value)}>
              {showReapply ? "Hide Re-application" : "Re-apply as Broker"}
            </Button>
          </div>
        )}
        {brokerStatus === "APPROVED" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Approved</h3>
            <p className="text-text-secondary">Your broker application has been approved. You can now list properties.</p>
            <Badge variant="success" className="mt-4">APPROVED</Badge>
          </div>
        )}
        {!brokerStatus && (
          <div className="text-center">
            <p className="text-text-secondary">No broker application found.</p>
          </div>
        )}
      </div>
      {brokerStatus === "REJECTED" && showReapply && (
        <div className="mt-5 max-w-lg rounded-card border border-border bg-white p-5 shadow-card">
          <h3 className="text-sm font-semibold text-foreground">Broker Re-application</h3>
          <p className="mt-1 text-xs text-text-secondary">Add stronger trust details: RERA, active city, service areas, and practical market experience.</p>
          <div className="mt-4 space-y-3">
            <Input label="RERA Registration Number" value={form.rera} onChange={(e) => setForm({ ...form, rera: e.target.value })} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Years of Experience" type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
              <Select
                label="Primary City"
                options={[{ value: "", label: "Select city" }, ...INDIAN_CITIES.map((city) => ({ value: city, label: city }))]}
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <Input label="Service Areas" placeholder="e.g. Salt Lake, Park Street, New Town" value={form.serviceAreas} onChange={(e) => setForm({ ...form, serviceAreas: e.target.value })} />
            <Textarea label="Broker Bio" placeholder="Your strongest local markets, inventory type, and collaboration style." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            <Button onClick={submitReapply} loading={submitting} disabled={!form.rera || !form.experience || !form.city || !form.bio}>
              Submit Re-application
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Requirements (Broker) ──────────────────────────────────────────────────────

interface Requirement {
  id: string;
  description: string;
  propertyType: string;
  locality?: string;
  city: string;
  budgetMin?: number;
  budgetMax?: number;
  status?: string;
  urgency?: string;
  clientSeriousness?: string;
  notes?: string | null;
  expiresAt?: string | null;
  matchedPropertiesCount?: number;
  createdAt: string;
}

function RequirementsSection() {
  const { toast } = useToast();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [desc, setDesc] = useState("");
  const [propType, setPropType] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [urgency, setUrgency] = useState("NORMAL");
  const [clientSeriousness, setClientSeriousness] = useState("MEDIUM");
  const [notes, setNotes] = useState("");

  const fetchReqs = useCallback(() => {
    setLoading(true);
    fetch("/api/broker/requirements", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setRequirements(d.requirements || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchReqs();
  }, [fetchReqs]);

  const allPropertyTypes = Object.values(PROPERTY_TYPES).flat();

  const handlePost = async () => {
    if (!desc || !propType || !city) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/broker/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          description: desc,
          propertyType: propType,
          locality,
          city,
          budgetMin: budgetMin ? Number(budgetMin) : undefined,
          budgetMax: budgetMax ? Number(budgetMax) : undefined,
          urgency,
          clientSeriousness,
          notes,
        }),
      });
      if (res.ok) {
        setDesc("");
        setPropType("");
        setLocality("");
        setCity("");
        setBudgetMin("");
        setBudgetMax("");
        setUrgency("NORMAL");
        setClientSeriousness("MEDIUM");
        setNotes("");
        setShowForm(false);
        fetchReqs();
        toast("Requirement posted.", "success");
      }
    } catch {
      toast("Failed to post requirement.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Requirements</h2>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "ghost" : "primary"} size="sm">
          {showForm ? "Cancel" : <><PlusCircle size={14} className="mr-1.5" /> Add Requirement</>}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-card shadow-card border border-border p-6 mb-6">
          <div className="space-y-4">
            <Textarea
              label="Description"
              placeholder="Describe the requirement..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Property Type"
                options={allPropertyTypes.map((t) => ({ value: t, label: t }))}
                value={propType}
                onChange={(e) => setPropType(e.target.value)}
              />
              <Select
                label="City"
                options={[{ value: "", label: "Select city" }, ...INDIAN_CITIES.map((c) => ({ value: c, label: c }))]}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Locality" placeholder="e.g. Salt Lake, Andheri" value={locality} onChange={(e) => setLocality(e.target.value)} />
              <Select
                label="Urgency"
                options={[
                  { value: "NORMAL", label: "Normal" },
                  { value: "HIGH", label: "High" },
                  { value: "HOT", label: "Hot client" },
                  { value: "LOW", label: "Low priority" },
                ]}
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Min Budget (₹)" type="number" placeholder="e.g. 5000000" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
              <Input label="Max Budget (₹)" type="number" placeholder="e.g. 15000000" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
              <Select
                label="Client Seriousness"
                options={[
                  { value: "MEDIUM", label: "Medium" },
                  { value: "HIGH", label: "High" },
                  { value: "VERIFIED", label: "Verified by KJ" },
                  { value: "LOW", label: "Low" },
                ]}
                value={clientSeriousness}
                onChange={(e) => setClientSeriousness(e.target.value)}
              />
            </div>
            <Textarea
              label="Internal Notes"
              placeholder="Client timing, preferred towers, visit window, broker terms..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button onClick={handlePost} loading={submitting} disabled={!desc || !propType || !city}>
              Post Requirement
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : requirements.length === 0 ? (
        <div className="bg-white rounded-card shadow-card p-8 text-center border border-border">
          <ClipboardList size={48} className="mx-auto text-text-secondary mb-3" />
          <p className="text-text-secondary">No requirements posted yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requirements.map((r) => (
            <div key={r.id} className="bg-white rounded-card shadow-card border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{r.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="blue">{r.propertyType}</Badge>
                    {r.urgency && (
                      <Badge variant={r.urgency === "HOT" ? "error" : r.urgency === "HIGH" ? "warning" : "default"}>
                        {r.urgency}
                      </Badge>
                    )}
                    {r.status && <Badge variant="default">{r.status}</Badge>}
                    <Badge variant="default">
                      <MapPin size={12} className="mr-1" /> {r.locality ? `${r.locality}, ` : ""}{r.city}
                    </Badge>
                    {(r.budgetMin || r.budgetMax) && (
                      <Badge variant="accent">
                        {r.budgetMin ? formatPrice(r.budgetMin) : "Any"} – {r.budgetMax ? formatPrice(r.budgetMax) : "Any"}
                      </Badge>
                    )}
                    {typeof r.matchedPropertiesCount === "number" && (
                      <Badge variant={r.matchedPropertiesCount > 0 ? "success" : "warning"}>
                        {r.matchedPropertiesCount} matches
                      </Badge>
                    )}
                  </div>
                  {r.notes && <p className="mt-3 text-sm text-text-secondary line-clamp-2">{r.notes}</p>}
                </div>
                <p className="text-xs text-text-secondary shrink-0">
                  {new Date(r.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
