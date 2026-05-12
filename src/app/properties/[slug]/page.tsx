"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  BadgeCheck,
  Bath,
  BedDouble,
  BellRing,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Heart,
  LockKeyhole,
  MapPin,
  Maximize,
  MessageCircle,
  Phone,
  Search,
  Share2,
  ShieldCheck,
  Sofa,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { cn, formatPrice, maskPhone } from "@/lib/utils";
import { enquirySchema } from "@/lib/validations";
import { getVisibilityLabel } from "@/lib/visibility";
import type { EnquiryInput } from "@/lib/validations";

type EnquiryFormInput = Omit<EnquiryInput, "propertyId">;

const enquiryFormSchema = enquirySchema.omit({ propertyId: true });
type EnquiryIntent = "callback" | "visit" | "price" | "similar";

const ENQUIRY_ACTIONS: Record<EnquiryIntent, { label: string; helper: string; message: string }> = {
  callback: {
    label: "Call Me Back",
    helper: "KrrishJazz will coordinate a callback.",
    message: "I am interested in this property. Please call me back with availability and next steps.",
  },
  visit: {
    label: "Schedule Visit",
    helper: "Ask the team to confirm a visit slot.",
    message: "I want to schedule a property visit. Please confirm availability, location details, and a suitable visit time.",
  },
  price: {
    label: "Ask Final Price",
    helper: "Request pricing and negotiation details.",
    message: "Please share the final expected price, negotiation scope, brokerage terms, and any additional charges for this property.",
  },
  similar: {
    label: "Need Similar Options",
    helper: "Let KrrishJazz suggest nearby fits.",
    message: "This property looks interesting. Please also share similar properties nearby that match my budget and requirements.",
  },
};

interface PropertyDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  listingType: string;
  category: string;
  propertyType: string;
  price: number;
  priceNegotiable: boolean;
  area: number;
  areaUnit: string;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  totalFloors: number | null;
  ageYears: number | null;
  furnishing: string | null;
  amenities: string[];
  address: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  lat: number | null;
  lng: number | null;
  images: string[];
  coverImage: string | null;
  status: string;
  listingStatus: string;
  visibilityType: string;
  publicBrokerName: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  postedBy: {
    id: string;
    name: string | null;
    phone: string;
    role: string;
    brokerProfile?: {
      rera: string;
      responseScore?: number;
      completedCollaborations?: number;
      profileCompletion?: number;
      lastActiveAt?: string | null;
    } | null;
  };
}

interface SimilarProperty {
  id: string;
  slug: string;
  title: string;
  city: string;
  price: number;
  coverImage: string | null;
  images: string[];
  propertyType: string;
  area: number;
  areaUnit: string;
}

function getFreshness(updatedAt?: string) {
  const days = updatedAt ? Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)) : 99;
  if (days < 1) return { label: "Updated today", variant: "success" as const };
  if (days < 7) return { label: `${days}d fresh`, variant: "success" as const };
  if (days < 21) return { label: `${days}d old`, variant: "warning" as const };
  return { label: "Needs check", variant: "error" as const };
}

function listingLabel(type: string) {
  if (type === "BUY") return "For sale";
  if (type === "RENT") return "For rent";
  if (type === "LEASE") return "Lease";
  return type;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const slug = params.slug as string;

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [similar, setSimilar] = useState<SimilarProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");
  const [activeEnquiryIntent, setActiveEnquiryIntent] = useState<EnquiryIntent>("callback");
  const [loadError, setLoadError] = useState("");
  const [descExpanded, setDescExpanded] = useState(false);
  const [savingProperty, setSavingProperty] = useState(false);
  const [savedProperty, setSavedProperty] = useState(false);
  const [galleryTouchStart, setGalleryTouchStart] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EnquiryFormInput>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      message: "I am interested in this property. Please share details.",
    },
  });

  const openEnquiryWithIntent = (intent: EnquiryIntent) => {
    if (!user) {
      router.push(`/login?redirect=/properties/${slug}`);
      return;
    }

    const action = ENQUIRY_ACTIONS[intent];
    setActiveEnquiryIntent(intent);
    setEnquirySent(false);
    setEnquiryError("");
    setValue("message", action.message, { shouldValidate: true });
    setEnquiryOpen(true);
    window.setTimeout(() => document.getElementById("enquire")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const goToPreviousImage = () => {
    setCurrentImage((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const goToNextImage = () => {
    setCurrentImage((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  const handleGalleryTouchEnd = (x: number) => {
    if (galleryTouchStart == null || images.length < 2) return;
    const delta = galleryTouchStart - x;
    if (Math.abs(delta) > 42) {
      if (delta > 0) goToNextImage();
      else goToPreviousImage();
    }
    setGalleryTouchStart(null);
  };

  useEffect(() => {
    async function fetchProperty() {
      try {
        setLoadError("");
        const res = await fetch(`/api/properties/${slug}`, {
          credentials: "include",
        });
        if (!res.ok) {
          const result = await res.json().catch(() => null);
          setLoadError(typeof result?.error === "string" ? result.error : "Property details are not available.");
          return;
        }
        const data = await res.json();
        setProperty(data.property);
        setSimilar(data.similar || []);
      } catch {
        setLoadError("Property details could not be loaded. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchProperty();
  }, [slug]);

  const onEnquiry = async (data: EnquiryFormInput) => {
    if (!user) {
      router.push(`/login?redirect=/properties/${slug}`);
      return;
    }
    if (!property) return;

    setEnquiryError("");
    setEnquiryLoading(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, propertyId: property.id }),
      });
      if (res.ok) {
        setEnquirySent(true);
        toast("Enquiry sent. KrrishJazz will coordinate the next step.", "success");
        return;
      }

      const result = await res.json().catch(() => null);
      const message = typeof result?.error === "string"
        ? result.error
        : "Please check the enquiry details and try again.";
      setEnquiryError(message);
      toast(message, "error");
    } catch {
      setEnquiryError("Failed to submit enquiry. Please try again.");
      toast("Failed to submit enquiry. Please try again.", "error");
    } finally {
      setEnquiryLoading(false);
    }
  };

  const handleSaveProperty = async () => {
    if (!user) {
      router.push(`/login?redirect=/properties/${slug}`);
      return;
    }
    if (!property) return;

    setSavingProperty(true);
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ propertyId: property.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setSavedProperty(data.saved);
        toast(data.saved ? "Property saved." : "Property removed from saved.", "success");
      } else {
        toast(data.error || "Could not update saved property.", "error");
      }
    } catch {
      toast("Could not update saved property.", "error");
    } finally {
      setSavingProperty(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const title = property?.title || "KrrishJazz property";
    if (navigator.share) {
      await navigator.share({ title, url: shareUrl }).catch(() => {});
      return;
    }

    await navigator.clipboard?.writeText(shareUrl).catch(() => {});
    toast("Property link copied.", "success");
  };

  const handleWhatsAppOps = () => {
    if (!property) return;
    const platformPhone = process.env.NEXT_PUBLIC_PLATFORM_PHONE || "";
    if (!platformPhone || platformPhone.includes("XXXX")) {
      toast("Send an enquiry and KrrishJazz will coordinate this property.", "info");
      openEnquiryWithIntent("callback");
      return;
    }

    const message = [
      "Hi KrrishJazz, I want help with this property.",
      property.title,
      `${property.locality ? `${property.locality}, ` : ""}${property.city}`,
      `Price: ${formatPrice(Number(property.price))}`,
      `${window.location.origin}/properties/${slug}`,
    ].join("\n");
    window.open(`https://wa.me/${platformPhone.replace(/^\+/, "")}?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
          <div className="mb-5 h-6 w-40 animate-pulse rounded bg-surface-muted" />
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <div className="h-[420px] animate-pulse rounded-card bg-surface-muted" />
              <div className="h-32 animate-pulse rounded-card bg-surface-muted" />
              <div className="h-64 animate-pulse rounded-card bg-surface-muted" />
            </div>
            <div className="h-96 animate-pulse rounded-card bg-surface-muted" />
          </div>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-card border border-border bg-white p-8 shadow-card">
            <h1 className="mb-2 text-xl font-semibold text-foreground">Unable to open property details</h1>
            <p className="mb-5 text-text-secondary">{loadError || "This property could not be loaded."}</p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => router.back()}>Go Back</Button>
              <Button variant="outline" onClick={() => router.push("/properties")}>
                Search Properties
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const images = Array.from(new Set([property.coverImage, ...property.images].filter(Boolean))) as string[];
  const activeImage = images[currentImage];
  const canShowBrokerPhone = false;
  const freshness = getFreshness(property.updatedAt);
  const pricePerUnit = property.area > 0 ? Math.round(property.price / property.area).toLocaleString("en-IN") : null;
  const keyDetails = buildKeyDetails(property);

  return (
    <main className="min-h-screen bg-surface pb-24 lg:pb-8">
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-5 lg:px-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition-colors hover:text-primary"
          >
            <ArrowLeft size={16} />
            Back to search
          </button>

          <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant={property.listingType === "RENT" ? "success" : property.listingType === "LEASE" ? "accent" : "blue"}>
                  {listingLabel(property.listingType)}
                </Badge>
                <Badge variant={freshness.variant}>
                  <BellRing size={11} className="mr-1" />
                  {freshness.label}
                </Badge>
                {property.verified && (
                  <Badge variant="success">
                    <BadgeCheck size={11} className="mr-1" />
                    Verified
                  </Badge>
                )}
                <Badge>{property.propertyType}</Badge>
              </div>

              <h1 className="max-w-4xl text-3xl font-semibold leading-tight text-foreground lg:text-4xl">{property.title}</h1>
              <p className="mt-3 flex max-w-3xl items-start gap-2 text-sm leading-6 text-text-secondary">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                <span>{property.locality ? `${property.locality}, ` : ""}{property.address}, {property.city}, {property.state} - {property.pincode}</span>
              </p>
            </div>

            <div className="rounded-card border border-border bg-white p-4 shadow-card">
              <p className="text-xs font-semibold uppercase text-text-secondary">Asking price</p>
              <p className="mt-1 text-3xl font-bold text-primary">{formatPrice(Number(property.price))}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                {pricePerUnit && <span>Rs {pricePerUnit}/sqft</span>}
                {property.priceNegotiable && <Badge variant="accent">Negotiable</Badge>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[1fr_360px] lg:px-6">
        <div className="min-w-0 space-y-5">
          <section className="overflow-hidden rounded-card border border-border bg-white shadow-card">
            <div className="grid gap-2 p-2 lg:grid-cols-[1fr_220px]">
              <div className="relative h-[300px] overflow-hidden rounded-btn bg-surface sm:h-[420px]">
                {activeImage ? (
                  <img src={activeImage} alt={property.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-primary">
                    <Building2 size={54} />
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goToPreviousImage}
                      className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-card transition-colors hover:bg-white"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft size={21} />
                    </button>
                    <button
                      type="button"
                      onClick={goToNextImage}
                      className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-card transition-colors hover:bg-white"
                      aria-label="Next photo"
                    >
                      <ChevronRight size={21} />
                    </button>
                  </>
                )}

                <div className="absolute bottom-3 left-3 rounded-card bg-foreground/85 px-3 py-2 text-white backdrop-blur">
                  <p className="text-xs text-white/70">Photo proof</p>
                  <p className="text-sm font-semibold">{images.length || 0} media item{images.length === 1 ? "" : "s"}</p>
                </div>
                {activeImage && (
                  <button
                    type="button"
                    onClick={() => setGalleryOpen(true)}
                    className="absolute bottom-3 right-3 rounded-btn bg-white px-3 py-2 text-xs font-semibold text-foreground shadow-card transition-colors hover:bg-primary-light hover:text-primary"
                  >
                    Open gallery
                  </button>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 lg:grid-cols-1">
                {(images.length ? images.slice(0, 4) : [null, null, null, null]).map((img, index) => (
                  <button
                    key={`${img || "empty"}-${index}`}
                    type="button"
                    onClick={() => img && setCurrentImage(index)}
                    className={cn(
                      "relative h-20 overflow-hidden rounded-btn border bg-surface lg:h-[98px]",
                      currentImage === index ? "border-primary ring-2 ring-primary/15" : "border-border"
                    )}
                  >
                    {img ? (
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Building2 size={20} className="mx-auto text-primary" />
                    )}
                    {index === 3 && images.length > 4 && (
                      <span className="absolute inset-0 flex items-center justify-center bg-foreground/70 text-sm font-semibold text-white">
                        +{images.length - 4}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SignalCard icon={<ShieldCheck size={18} />} title="Verified flow" desc="KrrishJazz checked" tone="success" />
            <SignalCard icon={<Clock size={18} />} title="Freshness" desc={freshness.label} tone="primary" />
            <SignalCard icon={<LockKeyhole size={18} />} title="Protected enquiry" desc="No lead spam" tone="accent" />
            <SignalCard icon={<Eye size={18} />} title="Ready to visit" desc="Send enquiry" tone="primary" />
          </section>

          <section className="rounded-card border border-border bg-white p-5 shadow-card">
            <SectionTitle title="Why this is worth seeing" subtitle="Quick decision signals before a site visit" />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <WorthSeeingCard title="Clear price signal" desc={pricePerUnit ? `Around Rs ${pricePerUnit}/sqft for this area.` : "Price is visible and can be discussed through KrrishJazz."} />
              <WorthSeeingCard title="Location confidence" desc={`${property.locality || property.city} is visible before enquiry.`} />
              <WorthSeeingCard title="Managed next step" desc="KrrishJazz coordinates callback, visit, final price, and similar options." />
            </div>
          </section>

          <section className="rounded-card border border-border bg-white p-5 shadow-card">
            <SectionTitle title="Trust and freshness timeline" subtitle="What KrrishJazz checks before moving a customer forward" />
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <TimelineSignal title="Listing checked" desc={freshness.label} active />
              <TimelineSignal title="Photos reviewed" desc={images.length ? `${images.length} media item${images.length === 1 ? "" : "s"} available` : "Photos pending"} active={images.length > 0} />
              <TimelineSignal title="Visit coordination" desc="Availability confirmed after enquiry" active={false} />
            </div>
          </section>

          <section className="rounded-card border border-border bg-white p-5 shadow-card">
            <SectionTitle title="Property Snapshot" subtitle="Fast details before you call or enquire" />
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {keyDetails.map((detail) => (
                <DetailItem key={detail.label} icon={detail.icon} label={detail.label} value={detail.value} />
              ))}
            </div>
          </section>

          <section className="rounded-card border border-border bg-white p-5 shadow-card">
            <SectionTitle title="About this property" subtitle="Useful context from the listing owner or broker" />
            <p className={cn("mt-4 text-sm leading-7 text-text-secondary", !descExpanded && "line-clamp-5")}>
              {property.description}
            </p>
            {property.description.length > 280 && (
              <button
                type="button"
                onClick={() => setDescExpanded(!descExpanded)}
                className="mt-3 text-sm font-semibold text-primary hover:text-accent"
              >
                {descExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </section>

          {property.amenities.length > 0 && (
            <section className="rounded-card border border-border bg-white p-5 shadow-card">
              <SectionTitle title="Amenities and readiness" subtitle="Signals that help shortlist faster" />
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 rounded-btn bg-surface px-3 py-2 text-sm text-foreground">
                    <CheckCircle2 size={15} className="shrink-0 text-success" />
                    {amenity}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-card border border-border bg-white p-5 shadow-card">
            <SectionTitle title="Location confidence" subtitle={`${property.city}, ${property.state}`} />
            <div className="mt-4 rounded-card border border-border bg-surface p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-primary-light text-primary">
                  <MapPin size={19} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{property.address}</p>
                  <p className="mt-1 text-sm text-text-secondary">{property.locality ? `${property.locality}, ` : ""}{property.city}, {property.state} - {property.pincode}</p>
                </div>
              </div>

              {property.lat && property.lng && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                <div className="mt-4 aspect-video overflow-hidden rounded-card border border-border bg-white">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${property.lat},${property.lng}`}
                  />
                </div>
              )}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <LocalityInsight title="Good for" value={getUseCaseLabel(property)} />
              <LocalityInsight title="Area signal" value={property.locality || property.city} />
              <LocalityInsight title="Next step" value="Request callback before visit" />
            </div>
          </section>

          {similar.length > 0 && (
            <section className="rounded-card border border-border bg-white p-5 shadow-card">
              <SectionTitle title="Similar nearby options" subtitle="Keep comparing without losing context" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {similar.map((item) => {
                  const image = item.coverImage || item.images?.[0];
                  return (
                    <Link
                      key={item.id}
                      href={`/properties/${item.slug}`}
                      className="group overflow-hidden rounded-card border border-border bg-white transition-shadow hover:shadow-card"
                    >
                      <div className="h-28 bg-surface">
                        {image ? (
                          <img src={image} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-primary">
                            <Building2 size={26} />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="line-clamp-1 text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="mt-1 text-xs text-text-secondary">{item.city}</p>
                        <p className="mt-2 text-sm font-bold text-primary">{formatPrice(Number(item.price))}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <aside className="w-full lg:w-[360px]">
          <div className="sticky top-20 space-y-4">
            <ContactCard
              property={property}
              canShowBrokerPhone={canShowBrokerPhone}
              showPhone={showPhone}
              setShowPhone={setShowPhone}
              user={user}
              slug={slug}
              routerPush={(href) => router.push(href)}
              enquiryOpen={enquiryOpen}
              setEnquiryOpen={setEnquiryOpen}
              onSave={handleSaveProperty}
              onShare={handleShare}
              savingProperty={savingProperty}
              savedProperty={savedProperty}
              freshnessLabel={freshness.label}
              pricePerUnit={pricePerUnit}
              activeEnquiryIntent={activeEnquiryIntent}
              onQuickEnquiry={openEnquiryWithIntent}
              onWhatsAppOps={handleWhatsAppOps}
            />

            {enquiryOpen && (
              <div id="enquire" className="rounded-card border border-border bg-white p-4 shadow-card">
                {enquirySent ? (
                  <div className="py-6 text-center">
                    <CheckCircle2 size={36} className="mx-auto mb-3 text-success" />
                    <p className="font-semibold text-foreground">Enquiry sent</p>
                    <p className="mt-1 text-sm text-text-secondary">KrrishJazz will help coordinate the next step.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onEnquiry)} className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{ENQUIRY_ACTIONS[activeEnquiryIntent].label}</h3>
                      <p className="mt-1 text-xs text-text-secondary">{ENQUIRY_ACTIONS[activeEnquiryIntent].helper}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(ENQUIRY_ACTIONS) as EnquiryIntent[]).map((intent) => (
                        <button
                          key={intent}
                          type="button"
                          onClick={() => openEnquiryWithIntent(intent)}
                          className={cn(
                            "rounded-btn border px-3 py-2 text-left text-xs font-semibold transition-colors",
                            activeEnquiryIntent === intent
                              ? "border-primary bg-primary-light text-primary"
                              : "border-border bg-surface text-text-secondary hover:border-primary/30 hover:text-primary"
                          )}
                        >
                          {ENQUIRY_ACTIONS[intent].label}
                        </button>
                      ))}
                    </div>
                    <Input label="Name" placeholder="Your name" error={errors.name?.message} {...register("name")} />
                    <Input label="Phone" placeholder="+91XXXXXXXXXX" error={errors.phone?.message} {...register("phone")} />
                    <Textarea label="Message" placeholder="I am interested in this property..." error={errors.message?.message} {...register("message")} />
                    <Input label="Preferred Visit Date" type="date" {...register("visitDate")} />
                    {enquiryError && <p className="text-xs text-error">{enquiryError}</p>}
                    <Button type="submit" className="w-full" loading={enquiryLoading}>
                      Submit Enquiry
                    </Button>
                  </form>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-3 bottom-3 z-30 rounded-card border border-border bg-white p-2 shadow-modal lg:hidden">
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="min-w-0">
            <p className="truncate text-xs text-text-secondary">Asking price</p>
            <p className="truncate text-sm font-bold text-primary">{formatPrice(Number(property.price))}</p>
          </div>
          <button type="button" onClick={handleShare} className="flex h-9 w-9 items-center justify-center rounded-btn border border-border text-text-secondary">
            <Share2 size={16} />
          </button>
        </div>
        <div className="grid grid-cols-[1.35fr_1fr_1fr] gap-2">
          <Button
            variant="accent"
            onClick={() => {
              if (!user) {
                router.push(`/login?redirect=/properties/${slug}`);
                return;
              }
              setEnquiryOpen(true);
              openEnquiryWithIntent("callback");
            }}
            className="w-full"
          >
            <MessageCircle size={16} className="mr-2" />
            Callback
          </Button>
          <Button
            variant="outline"
            onClick={() => openEnquiryWithIntent("visit")}
            className="w-full"
          >
            <Calendar size={16} className="mr-2" />
            Visit
          </Button>
          <Button
            variant="outline"
            onClick={handleWhatsAppOps}
            className="w-full"
          >
            <Phone size={16} className="mr-2" />
            WhatsApp
          </Button>
        </div>
      </div>
      {galleryOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/95 p-4 text-white">
          <div className="mx-auto flex h-full max-w-6xl flex-col">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{property.title}</p>
                <p className="text-xs text-white/60">{currentImage + 1} of {images.length}</p>
              </div>
              <button type="button" onClick={() => setGalleryOpen(false)} className="rounded-btn bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15">
                Close
              </button>
            </div>
            <div
              className="relative min-h-0 flex-1 overflow-hidden rounded-card bg-black"
              onTouchStart={(event) => setGalleryTouchStart(event.touches[0]?.clientX ?? null)}
              onTouchEnd={(event) => handleGalleryTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
            >
              {activeImage && <img src={activeImage} alt={property.title} className="h-full w-full object-contain" />}
              {images.length > 1 && (
                <>
                  <button type="button" onClick={goToPreviousImage} className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 hover:bg-white/25" aria-label="Previous photo">
                    <ChevronLeft size={24} />
                  </button>
                  <button type="button" onClick={goToNextImage} className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 hover:bg-white/25" aria-label="Next photo">
                    <ChevronRight size={24} />
                  </button>
                  <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
                    {images.slice(0, 8).map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setCurrentImage(index)}
                        className={cn("h-1.5 rounded-full transition-all", currentImage === index ? "w-6 bg-white" : "w-1.5 bg-white/45")}
                        aria-label={`Open photo ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function buildKeyDetails(property: PropertyDetail) {
  const details = [
    property.bedrooms ? { icon: <BedDouble size={18} />, label: "Bedrooms", value: `${property.bedrooms} BHK` } : null,
    property.bathrooms ? { icon: <Bath size={18} />, label: "Bathrooms", value: `${property.bathrooms}` } : null,
    { icon: <Maximize size={18} />, label: "Area", value: `${Math.round(property.area).toLocaleString()} ${property.areaUnit}` },
    property.floor != null ? { icon: <Building2 size={18} />, label: "Floor", value: `${property.floor}${property.totalFloors ? ` of ${property.totalFloors}` : ""}` } : null,
    property.ageYears != null ? { icon: <Calendar size={18} />, label: "Age", value: `${property.ageYears} years` } : null,
    property.furnishing ? { icon: <Sofa size={18} />, label: "Furnishing", value: property.furnishing } : null,
    { icon: <HomeIcon />, label: "Use", value: property.propertyType },
    { icon: <ShieldCheck size={18} />, label: "Listing Reach", value: getVisibilityLabel(property.visibilityType) },
  ];

  return details.filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[];
}

function HomeIcon() {
  return <Building2 size={18} />;
}

function ContactCard({
  property,
  canShowBrokerPhone,
  showPhone,
  setShowPhone,
  user,
  slug,
  routerPush,
  enquiryOpen,
  setEnquiryOpen,
  onSave,
  onShare,
  savingProperty,
  savedProperty,
  freshnessLabel,
  pricePerUnit,
  activeEnquiryIntent,
  onQuickEnquiry,
  onWhatsAppOps,
}: {
  property: PropertyDetail;
  canShowBrokerPhone: boolean;
  showPhone: boolean;
  setShowPhone: (value: boolean) => void;
  user: ReturnType<typeof useAuth>["user"];
  slug: string;
  routerPush: (href: string) => void;
  enquiryOpen: boolean;
  setEnquiryOpen: (value: boolean) => void;
  onSave: () => void;
  onShare: () => void;
  savingProperty: boolean;
  savedProperty: boolean;
  freshnessLabel: string;
  pricePerUnit: string | null;
  activeEnquiryIntent: EnquiryIntent;
  onQuickEnquiry: (intent: EnquiryIntent) => void;
  onWhatsAppOps: () => void;
}) {
  const confidenceItems = [
    { label: "Listing freshness", value: freshnessLabel },
    { label: "Price signal", value: pricePerUnit ? `Rs ${pricePerUnit}/sqft` : "Ask team" },
    { label: "Brokerage", value: "1 month" },
  ];

  return (
    <div className="rounded-card border border-border bg-white shadow-card">
      <div className="border-b border-border p-4">
        <p className="text-xs font-semibold uppercase text-text-secondary">Managed by</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
            <User size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">KrrishJazz</p>
            <div className="mt-1 flex flex-wrap gap-1">
              <Badge variant="success">KrrishJazz Verified</Badge>
              <Badge variant="blue">Contact protected</Badge>
              <Badge variant="accent">Visit coordinated</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="grid grid-cols-3 gap-2">
          {confidenceItems.map((item) => (
            <div key={item.label} className="rounded-btn border border-border bg-surface px-2 py-2 text-center">
              <p className="truncate text-[11px] text-text-secondary">{item.label}</p>
              <p className="mt-1 truncate text-xs font-bold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-card border border-primary/20 bg-primary-light p-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary">
            <LockKeyhole size={15} />
            Free listing, managed closure
          </p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">Owners list for free. KrrishJazz brokerage is one month only after a successful deal closure.</p>
        </div>

        {canShowBrokerPhone ? (
          <div className="rounded-card border border-border bg-surface p-3">
            <p className="text-xs text-text-secondary">Phone</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Phone size={14} className="text-primary" />
              {showPhone ? property.postedBy.phone : maskPhone(property.postedBy.phone)}
            </p>
          </div>
        ) : (
          <div className="rounded-card border border-border bg-surface p-3">
            <p className="text-sm font-semibold text-foreground">Contact handled by KrrishJazz</p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">Send an enquiry and the team will coordinate availability, visit timing, and brokerage terms.</p>
          </div>
        )}

        {canShowBrokerPhone && !showPhone && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              if (!user) {
                routerPush(`/login?redirect=/properties/${slug}`);
                return;
              }
              setShowPhone(true);
            }}
          >
            <Phone size={15} className="mr-2" />
            Request Managed Callback
          </Button>
        )}

        {canShowBrokerPhone && showPhone && (
          <a href={`tel:${property.postedBy.phone}`}>
            <Button variant="outline" className="w-full">
              <Phone size={15} className="mr-2" />
              Call KrrishJazz
            </Button>
          </a>
        )}

        <div className="space-y-2">
          <Button
            variant="accent"
            className="w-full"
            onClick={() => {
              if (enquiryOpen) {
                setEnquiryOpen(false);
                return;
              }
              onQuickEnquiry("callback");
            }}
          >
            <MessageCircle size={15} className="mr-2" />
            {enquiryOpen ? "Hide Request" : "Request Callback"}
          </Button>

          <Button variant="outline" className="w-full" onClick={onWhatsAppOps}>
            <MessageCircle size={15} className="mr-2" />
            WhatsApp KrrishJazz
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <QuickEnquiryButton active={activeEnquiryIntent === "visit"} icon={<Calendar size={14} />} label="Visit" onClick={() => onQuickEnquiry("visit")} />
            <QuickEnquiryButton active={activeEnquiryIntent === "price"} icon={<BadgeCheck size={14} />} label="Final Price" onClick={() => onQuickEnquiry("price")} />
            <QuickEnquiryButton active={activeEnquiryIntent === "similar"} icon={<Search size={14} />} label="Similar" onClick={() => onQuickEnquiry("similar")} />
            <QuickEnquiryButton active={activeEnquiryIntent === "callback"} icon={<Phone size={14} />} label="Callback" onClick={() => onQuickEnquiry("callback")} />
          </div>
        </div>

        <div className="rounded-card border border-warning/20 bg-warning-light p-3">
          <p className="text-sm font-semibold text-foreground">Planning a visit?</p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">Send a callback request first so availability, price, and visit timing can be confirmed.</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" size="sm" onClick={onSave} loading={savingProperty}>
            <Heart size={14} className={cn("mr-1", savedProperty && "fill-error text-error")} />
            {savedProperty ? "Saved" : "Save"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onShare}>
            <Share2 size={14} className="mr-1" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}

function SignalCard({ icon, title, desc, tone }: { icon: React.ReactNode; title: string; desc: string; tone: "success" | "primary" | "accent" }) {
  const toneClass = {
    success: "bg-success/10 text-success border-success/20",
    primary: "bg-primary-light text-primary border-primary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
  }[tone];

  return (
    <div className="rounded-card border border-border bg-white p-4 shadow-card">
      <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-btn border", toneClass)}>
        {icon}
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-text-secondary">{desc}</p>
    </div>
  );
}

function WorthSeeingCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-card border border-primary/15 bg-primary-light p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs leading-5 text-text-secondary">{desc}</p>
    </div>
  );
}

function TimelineSignal({ title, desc, active }: { title: string; desc: string; active: boolean }) {
  return (
    <div className={cn("rounded-card border p-4", active ? "border-success/20 bg-success/10" : "border-border bg-surface")}>
      <div className="flex items-center gap-2">
        <span className={cn("flex h-7 w-7 items-center justify-center rounded-full", active ? "bg-success text-white" : "bg-white text-text-secondary")}>
          <CheckCircle2 size={15} />
        </span>
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <p className="mt-2 text-xs leading-5 text-text-secondary">{desc}</p>
    </div>
  );
}

function LocalityInsight({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-btn border border-border bg-surface px-3 py-2">
      <p className="text-xs text-text-secondary">{title}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function getUseCaseLabel(property: PropertyDetail) {
  const type = `${property.category} ${property.propertyType}`.toLowerCase();
  if (type.includes("office") || type.includes("commercial")) return "Business use";
  if (type.includes("warehouse") || type.includes("industrial")) return "Operations and storage";
  if (type.includes("plot") || type.includes("land")) return "Investment or build";
  if (type.includes("pg") || type.includes("hostel") || type.includes("serviced")) return "Managed living";
  if (property.listingType === "RENT") return "Family rental";
  return "Home search";
}

function QuickEnquiryButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-btn border px-2 text-xs font-semibold transition-colors",
        active
          ? "border-primary bg-primary-light text-primary"
          : "border-border bg-white text-text-secondary hover:border-primary/30 hover:bg-primary-light hover:text-primary"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-btn border border-border bg-surface p-3">
      <span className="text-primary">{icon}</span>
      <p className="mt-2 text-xs text-text-secondary">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
