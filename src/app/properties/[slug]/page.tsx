"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Building,
  Calendar,
  Sofa,
  Heart,
  Share2,
  Phone,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { cn, formatPrice, maskPhone } from "@/lib/utils";
import { enquirySchema } from "@/lib/validations";
import type { EnquiryInput } from "@/lib/validations";

type EnquiryFormInput = Omit<EnquiryInput, "propertyId">;

const enquiryFormSchema = enquirySchema.omit({ propertyId: true });

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
  postedBy: {
    id: string;
    name: string | null;
    phone: string;
    role: string;
    brokerProfile?: { rera: string } | null;
  };
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params.slug as string;

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");
  const [descExpanded, setDescExpanded] = useState(false);
  const [savingProperty, setSavingProperty] = useState(false);
  const [savedProperty, setSavedProperty] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnquiryFormInput>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
    },
  });

  useEffect(() => {
    async function fetchProperty() {
      try {
        const res = await fetch(`/api/properties/${slug}`);
        if (!res.ok) {
          router.push("/properties");
          return;
        }
        const data = await res.json();
        setProperty(data.property);
        setSimilar(data.similar || []);
      } catch {
        router.push("/properties");
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [slug, router]);

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
        return;
      }

      const result = await res.json().catch(() => null);
      setEnquiryError(
        typeof result?.error === "string"
          ? result.error
          : "Please check the enquiry details and try again."
      );
    } catch {
      console.error("Enquiry failed");
      setEnquiryError("Failed to submit enquiry. Please try again.");
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
      if (res.ok) setSavedProperty(data.saved);
    } finally {
      setSavingProperty(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: property?.title, url: shareUrl }).catch(() => {});
      return;
    }

    await navigator.clipboard?.writeText(shareUrl).catch(() => {});
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
        <div className="aspect-video bg-surface rounded-card mb-6" />
        <div className="h-8 bg-surface rounded w-2/3 mb-4" />
        <div className="h-6 bg-surface rounded w-1/3 mb-4" />
      </div>
    );
  }

  if (!property) return null;

  const images = property.images.length > 0 ? property.images : ["/placeholder.jpg"];
  const canShowBrokerPhone = Boolean(property.postedBy.phone);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1">
          {/* Image Gallery */}
          <div className="relative rounded-card overflow-hidden bg-surface mb-6">
            <div className="aspect-video relative">
              <img
                src={images[currentImage]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((i) => (i === 0 ? images.length - 1 : i - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentImage((i) => (i === images.length - 1 ? 0 : i + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {currentImage + 1} / {images.length}
              </div>
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-1 p-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-16 h-12 rounded shrink-0 overflow-hidden border-2 ${
                      i === currentImage ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Price */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={property.listingType === "RENT" ? "success" : "blue"}>
                    {property.listingType === "BUY" ? "FOR SALE" : `FOR ${property.listingType}`}
                  </Badge>
                  <Badge>{property.propertyType}</Badge>
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-1">{property.title}</h1>
                <p className="text-sm text-text-secondary flex items-center gap-1">
                  <MapPin size={14} /> {property.address}, {property.city}, {property.state} - {property.pincode}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{formatPrice(Number(property.price))}</p>
                {property.priceNegotiable && (
                  <p className="text-xs text-text-secondary">Negotiable</p>
                )}
              </div>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {property.bedrooms && (
              <DetailItem icon={<BedDouble size={18} />} label="Bedrooms" value={`${property.bedrooms} BHK`} />
            )}
            {property.bathrooms && (
              <DetailItem icon={<Bath size={18} />} label="Bathrooms" value={`${property.bathrooms}`} />
            )}
            <DetailItem icon={<Maximize size={18} />} label="Area" value={`${property.area} ${property.areaUnit}`} />
            {property.floor != null && (
              <DetailItem icon={<Building size={18} />} label="Floor" value={`${property.floor}${property.totalFloors ? ` of ${property.totalFloors}` : ""}`} />
            )}
            {property.ageYears != null && (
              <DetailItem icon={<Calendar size={18} />} label="Age" value={`${property.ageYears} years`} />
            )}
            {property.furnishing && (
              <DetailItem icon={<Sofa size={18} />} label="Furnishing" value={property.furnishing} />
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Description</h2>
            <p className={`text-sm text-text-secondary leading-relaxed ${!descExpanded ? "line-clamp-4" : ""}`}>
              {property.description}
            </p>
            {property.description.length > 300 && (
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="text-sm text-primary hover:underline mt-1"
              >
                {descExpanded ? "Show Less" : "Read More"}
              </button>
            )}
          </div>

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-sm text-text-secondary">
                    <CheckCircle2 size={14} className="text-success shrink-0" />
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          {property.lat && property.lng && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">Location</h2>
              <div className="aspect-video bg-surface rounded-card border border-border flex items-center justify-center">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: "8px" }}
                  loading="lazy"
                  src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}&q=${property.lat},${property.lng}`}
                />
              </div>
            </div>
          )}

          {/* Similar Properties */}
          {similar.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">Similar Properties</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {similar.map((p: any) => (
                  <Link
                    key={p.id}
                    href={`/properties/${p.slug}`}
                    className="shrink-0 w-64 bg-white rounded-card border border-border overflow-hidden hover:shadow-card transition-shadow"
                  >
                    <div className="aspect-video bg-surface">
                      {(p.coverImage || p.images?.[0]) && (
                        <img src={p.coverImage || p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                      <p className="text-xs text-text-secondary">{p.city}</p>
                      <p className="text-sm font-bold text-primary mt-1">{formatPrice(Number(p.price))}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="sticky top-20 space-y-4">
            {/* Posted by card */}
            <div className="bg-white rounded-card border border-border p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
                  <User size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {property.publicBrokerName || property.postedBy.name || "KrrishJazz"}
                  </p>
                  <Badge variant="success">KrrishJazz Verified</Badge>
                  {canShowBrokerPhone && property.postedBy.brokerProfile?.rera && (
                    <p className="text-xs text-text-secondary mt-0.5">
                      RERA: {property.postedBy.brokerProfile.rera}
                    </p>
                  )}
                </div>
              </div>

              {canShowBrokerPhone ? (
                <p className="text-sm text-text-secondary mb-3">
                  <Phone size={14} className="inline mr-1" />
                  {showPhone ? property.postedBy.phone : maskPhone(property.postedBy.phone)}
                </p>
              ) : (
                <p className="text-sm text-text-secondary mb-3">
                  Contact is handled through verified KrrishJazz enquiry.
                </p>
              )}

              {canShowBrokerPhone && !showPhone && (
                <Button
                  variant="outline"
                  className="w-full mb-2"
                  onClick={() => {
                    if (!user) {
                      router.push(`/login?redirect=/properties/${slug}`);
                      return;
                    }
                    setShowPhone(true);
                  }}
                >
                  View Phone Number
                </Button>
              )}

              <Button
                className="w-full"
                onClick={() => {
                  if (!user) {
                    router.push(`/login?redirect=/properties/${slug}`);
                    return;
                  }
                  setEnquiryOpen(true);
                }}
              >
                Send Enquiry
              </Button>
            </div>

            {/* Enquiry Form */}
            {enquiryOpen && (
              <div id="enquire" className="bg-white rounded-card border border-border p-4">
                {enquirySent ? (
                  <div className="text-center py-4">
                    <CheckCircle2 size={32} className="text-success mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Enquiry Sent!</p>
                    <p className="text-xs text-text-secondary">The owner will contact you soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onEnquiry)} className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Send Enquiry</h3>
                    <Input
                      label="Name"
                      placeholder="Your name"
                      error={errors.name?.message}
                      {...register("name")}
                    />
                    <Input
                      label="Phone"
                      placeholder="+91XXXXXXXXXX"
                      error={errors.phone?.message}
                      {...register("phone")}
                    />
                    <Textarea
                      label="Message"
                      placeholder="I'm interested in this property..."
                      error={errors.message?.message}
                      {...register("message")}
                    />
                    <Input
                      label="Preferred Visit Date"
                      type="date"
                      {...register("visitDate")}
                    />
                    {enquiryError && <p className="text-xs text-error">{enquiryError}</p>}
                    <Button type="submit" className="w-full" loading={enquiryLoading}>
                      Submit Enquiry
                    </Button>
                  </form>
                )}
              </div>
            )}

            {/* Share */}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={handleSaveProperty}
                loading={savingProperty}
              >
                <Heart size={14} className={cn("mr-1", savedProperty && "fill-error text-error")} />
                {savedProperty ? "Saved" : "Save"}
              </Button>
              <Button variant="ghost" size="sm" className="flex-1" onClick={handleShare}>
                <Share2 size={14} className="mr-1" /> Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-surface rounded-btn">
      <span className="text-primary">{icon}</span>
      <div>
        <p className="text-xs text-text-secondary">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
