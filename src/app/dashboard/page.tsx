"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Users,
  MessageSquare,
  Heart,
  User,
  ClipboardList,
  Menu,
  X,
  TrendingUp,
  Eye,
  IndianRupee,
  Home,
  Upload,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  XCircle,
  Edit,
  Phone,
  Mail,
  MapPin,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  PROPERTY_TYPES,
  AMENITIES,
  FURNISHING_OPTIONS,
  INDIAN_STATES,
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
  city: string;
  price: number;
  status: string;
  listingStatus?: string;
  visibilityType?: string;
  _count?: { enquiries: number };
  slug: string;
}

interface LeadRow {
  id: string;
  customerName: string;
  phone: string;
  propertyTitle: string;
  message: string;
  date: string;
  status: string;
}

interface SavedProperty {
  id: string;
  title: string;
  city: string;
  price: number;
  coverImage: string;
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
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={iconSize} /> },
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
          "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-border flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* User section */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-semibold text-sm shrink-0">
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
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-colors",
                activeTab === item.id
                  ? "bg-primary-light text-primary"
                  : "text-text-secondary hover:bg-surface"
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
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-surface rounded-btn">
            <Menu size={24} className="text-foreground" />
          </button>
          <h1 className="font-semibold text-foreground">Dashboard</h1>
        </div>

        <main className="p-4 md:p-6 lg:p-8 max-w-6xl">
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total Properties", value: stats?.totalProperties ?? 0, icon: <Building2 size={24} />, color: "text-primary bg-primary-light" },
    { label: "Live Properties", value: stats?.liveProperties ?? 0, icon: <Eye size={24} />, color: "text-accent bg-accent/10" },
    { label: "Total Leads", value: stats?.totalLeads ?? 0, icon: <MessageSquare size={24} />, color: "text-success bg-success/10" },
    { label: "New Leads", value: stats?.newLeads ?? 0, icon: <IndianRupee size={24} />, color: "text-warning bg-warning/10" },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-6">Overview</h2>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="bg-white rounded-card shadow-card p-5 border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("p-2.5 rounded-btn", card.color)}>{card.icon}</div>
                <TrendingUp size={16} className="text-success" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {card.value.toLocaleString("en-IN")}
              </p>
              <p className="text-sm text-text-secondary mt-1">{card.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── My Properties ──────────────────────────────────────────────────────────────

function MyPropertiesSection() {
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/properties?postedBy=me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setProperties(d.properties || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusVariant = (s: string) => {
    if (s === "LIVE" || s === "APPROVED" || s === "ACTIVE") return "success";
    if (s === "PENDING_REVIEW" || s === "PENDING") return "warning";
    if (s === "REJECTED") return "error";
    return "default";
  };

  const statusLabel = (s: string) => {
    if (s === "PENDING_REVIEW") return "Pending Review";
    return s;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-6">My Properties</h2>
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
        <div className="bg-white rounded-card shadow-card border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Title</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Type</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">City</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Price</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Status</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Visibility</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Enquiries</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                  <td className="px-4 py-3 font-medium text-foreground">{p.title}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.propertyType}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.city}</td>
                  <td className="px-4 py-3 text-foreground">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(p.listingStatus || p.status)}>
                      {statusLabel(p.listingStatus || p.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {(p.visibilityType || "PUBLIC_TO_CUSTOMERS").replaceAll("_", " ")}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {p._count?.enquiries ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm">
                      <Edit size={14} className="mr-1" /> Edit
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

// ─── Post Property (Multi-step Form) ────────────────────────────────────────────

const STEPS = ["Basic Info", "Details", "Location", "Images & Amenities"];

function PostPropertySection({ onPosted }: { onPosted: () => void }) {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [upgradingOwner, setUpgradingOwner] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
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

  const propertyTypeOptions = category
    ? (PROPERTY_TYPES[category] || []).map((t) => ({ value: t, label: t }))
    : [];

  const handleUpgradeToOwner = async () => {
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
        alert(err.error || "Could not enable owner listing access");
      }
    } catch {
      alert("Could not enable owner listing access");
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
          <Button onClick={handleUpgradeToOwner} loading={upgradingOwner}>
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
    if (step === 2) fields = ["address", "city", "state", "pincode"];
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
      alert("Please wait for images to finish uploading.");
      return;
    }

    setSubmitting(true);
    data.amenities = selectedAmenities;
    data.images = images;
    try {
      console.log("Submitting property", data);
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (res.ok) {
        alert("Property posted successfully!");
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
        setStep(0);
        onPosted();
      } else {
        const err = await res.json();
        console.error("Property post failed", err);
        alert(err.error || "Failed to post property");
      }
    } catch (error) {
      console.error("Property post error", error);
      alert("Something went wrong");
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

      setImages(uploadedUrls);
      setValue("images", uploadedUrls, { shouldValidate: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload images";
      setUploadError(message);
      setImages([]);
      setValue("images", [], { shouldValidate: true });
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-6">Post Property</h2>

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
              <Input label="Title" placeholder="e.g. 3BHK Apartment in Andheri" error={errors.title?.message} {...register("title")} />
              <Textarea label="Description" placeholder="Describe the property..." error={errors.description?.message} {...register("description")} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <Select
                  label="Category"
                  options={Object.keys(PROPERTY_TYPES).map((k) => ({ value: k, label: k.charAt(0) + k.slice(1).toLowerCase() }))}
                  error={errors.category?.message}
                  {...register("category")}
                />
                <Select
                  label="Property Type"
                  options={propertyTypeOptions}
                  error={errors.propertyType?.message}
                  {...register("propertyType")}
                />
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Price (₹)" type="number" placeholder="e.g. 5000000" error={errors.price?.message} {...register("price")} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Area" type="number" placeholder="e.g. 1200" error={errors.area?.message} {...register("area")} />
                  <Select
                    label="Unit"
                    options={[
                      { value: "sqft", label: "Sq Ft" },
                      { value: "sqm", label: "Sq M" },
                      { value: "sqyd", label: "Sq Yd" },
                      { value: "acre", label: "Acre" },
                    ]}
                    {...register("areaUnit")}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Input label="Bedrooms" type="number" placeholder="0" {...register("bedrooms")} />
                <Input label="Bathrooms" type="number" placeholder="0" {...register("bathrooms")} />
                <Input label="Floor" type="number" placeholder="0" {...register("floor")} />
                <Input label="Total Floors" type="number" placeholder="0" {...register("totalFloors")} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Age (years)" type="number" placeholder="0" {...register("ageYears")} />
                <Select
                  label="Furnishing"
                  options={FURNISHING_OPTIONS.map((f) => ({ value: f, label: f }))}
                  {...register("furnishing")}
                />
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="City" placeholder="e.g. Mumbai" error={errors.city?.message} {...register("city")} />
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
                  label="Visibility"
                  options={[
                    { value: "PUBLIC_TO_CUSTOMERS", label: "Public to Customers" },
                    { value: "BROKER_NETWORK_ONLY", label: "Broker Network Only" },
                    { value: "PRIVATE", label: "Private" },
                  ]}
                  error={errors.visibilityType?.message}
                  {...register("visibilityType")}
                />
                <Input
                  label="Public Broker Name"
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
                      <div key={i} className="w-20 h-20 rounded-btn bg-surface border border-border overflow-hidden">
                        <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-3">Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AMENITIES.map((a) => (
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
                disabled={uploadingImages}
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
          message: e.message,
          date: e.createdAt,
          status: e.status,
        }));
        setLeads(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusVariant = (s: string) => {
    if (s === "RESPONDED") return "success";
    if (s === "NEW") return "warning";
    return "default";
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-6">Leads / Enquiries Received</h2>
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
        <div className="bg-white rounded-card shadow-card border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Property</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Message</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Date</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                  <td className="px-4 py-3 font-medium text-foreground">{l.customerName}</td>
                  <td className="px-4 py-3 text-text-secondary">{l.phone || "Restricted"}</td>
                  <td className="px-4 py-3 text-foreground">{l.propertyTitle}</td>
                  <td className="px-4 py-3 text-text-secondary max-w-[200px] truncate">{l.message}</td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(l.date).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(l.status)}>{l.status}</Badge>
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

// ─── My Enquiries (Customer) ────────────────────────────────────────────────────

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
          message: e.message,
          date: e.createdAt,
          status: e.status,
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
            <div key={e.id} className="bg-white rounded-card shadow-card border border-border p-4 flex items-start gap-4">
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
              <Badge variant={e.status === "RESPONDED" ? "success" : "warning"}>{e.status}</Badge>
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
              className="bg-white rounded-card shadow-card border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-40 bg-surface">
                {p.coverImage ? (
                  <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
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
      }
    } catch {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-6">Profile</h2>
      <div className="bg-white rounded-card shadow-card border border-border p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-xl">
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
              <p className="text-sm text-text-secondary px-3 py-2 bg-surface rounded-btn">{user.name || "—"}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-1">
              <Mail size={14} /> Email
            </label>
            {editing ? (
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
            ) : (
              <p className="text-sm text-text-secondary px-3 py-2 bg-surface rounded-btn">{user.email || "—"}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-1">
              <Phone size={14} /> Phone
            </label>
            <p className="text-sm text-text-secondary px-3 py-2 bg-surface rounded-btn">{user.phone}</p>
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
  );
}

// ─── Application Status (Broker Pending) ────────────────────────────────────────

function ApplicationStatusSection({ brokerStatus }: { brokerStatus?: string | null }) {
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
              Please contact support for more details or to re-apply.
            </p>
            <Badge variant="error" className="mt-4">REJECTED</Badge>
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
    </div>
  );
}

// ─── Requirements (Broker) ──────────────────────────────────────────────────────

interface Requirement {
  id: string;
  description: string;
  propertyType: string;
  city: string;
  budgetMin?: number;
  budgetMax?: number;
  createdAt: string;
}

function RequirementsSection() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [desc, setDesc] = useState("");
  const [propType, setPropType] = useState("");
  const [city, setCity] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

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
          city,
          budgetMin: budgetMin ? Number(budgetMin) : undefined,
          budgetMax: budgetMax ? Number(budgetMax) : undefined,
        }),
      });
      if (res.ok) {
        setDesc("");
        setPropType("");
        setCity("");
        setBudgetMin("");
        setBudgetMax("");
        setShowForm(false);
        fetchReqs();
      }
    } catch {
      alert("Failed to post requirement");
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
              <Input label="City" placeholder="e.g. Mumbai" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Min Budget (₹)" type="number" placeholder="e.g. 5000000" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
              <Input label="Max Budget (₹)" type="number" placeholder="e.g. 15000000" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
            </div>
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
                    <Badge variant="default">
                      <MapPin size={12} className="mr-1" /> {r.city}
                    </Badge>
                    {(r.budgetMin || r.budgetMax) && (
                      <Badge variant="accent">
                        {r.budgetMin ? formatPrice(r.budgetMin) : "Any"} – {r.budgetMax ? formatPrice(r.budgetMax) : "Any"}
                      </Badge>
                    )}
                  </div>
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
