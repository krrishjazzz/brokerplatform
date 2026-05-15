"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CloudOff,
  Factory,
  Home,
  RotateCcw,
  Save,
  Store,
  Trees,
  Upload,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import {
  AMENITIES,
  AREA_UNITS,
  CATEGORY_AMENITIES,
  FURNISHING_OPTIONS,
  INDIAN_STATES,
  PROPERTY_CATEGORY_OPTIONS,
  PROPERTY_TYPE_GUIDE,
  PROPERTY_TYPES,
} from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import { propertySchema, type PropertyInput } from "@/lib/validations";
import { getVisibilityLabel, VISIBILITY_OPTIONS } from "@/lib/visibility";

const STEPS = ["Type", "Details", "Location", "Media", "Review"];

const DRAFT_KEY = "krrishjazz:post-property-draft:v1";
const DRAFT_DEBOUNCE_MS = 1200;

type DraftPayload = {
  formValues: Partial<PropertyInput>;
  step: number;
  images: string[];
  selectedAmenities: string[];
  categoryNotes: string;
  savedAt: number;
};

const CATEGORY_ICON_MAP: Record<string, ReactNode> = {
  RESIDENTIAL: <Home size={20} />,
  COMMERCIAL: <Store size={20} />,
  INDUSTRIAL: <Factory size={20} />,
  AGRICULTURAL: <Trees size={20} />,
  HOSPITALITY: <Building2 size={20} />,
};

function UploadFocusChecklist({ selectedType, items }: { selectedType?: string; items: string[] }) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{selectedType ? `${selectedType} upload checklist` : "Upload checklist"}</p>
          <p className="text-xs leading-5 text-text-secondary">KrrishJazz uses these signals to verify, match, and coordinate faster.</p>
        </div>
        <Badge variant={selectedType ? "success" : "warning"}>{selectedType ? "Type selected" : "Pick type"}</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="inline-flex items-center gap-1.5 rounded-pill border border-primary/15 bg-white px-3 py-1 text-xs font-semibold text-primary">
            <Check size={12} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function PostPropertySection({ onPosted }: { onPosted: () => void }) {
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
  const [categoryNotes, setCategoryNotes] = useState("");
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
      visibilityType: "FULL_VISIBILITY",
      publicBrokerName: "KrrishJazz",
    },
  });

  const [draftMeta, setDraftMeta] = useState<{ savedAt: number } | null>(null);
  const [pendingDraft, setPendingDraft] = useState<DraftPayload | null>(null);
  const [draftSaving, setDraftSaving] = useState(false);
  const draftLoadedRef = useRef(false);
  const draftSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || draftLoadedRef.current) return;
    draftLoadedRef.current = true;
    try {
      const stored = localStorage.getItem(DRAFT_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as DraftPayload;
      if (!parsed?.savedAt) return;
      setPendingDraft(parsed);
    } catch {
      // ignore
    }
  }, []);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
    setDraftMeta(null);
  };

  const resumeDraft = (draft: DraftPayload) => {
    if (draft.formValues) {
      reset({ ...draft.formValues } as PropertyInput);
    }
    if (draft.images?.length) setImages(draft.images);
    if (draft.selectedAmenities?.length) setSelectedAmenities(draft.selectedAmenities);
    if (typeof draft.categoryNotes === "string") setCategoryNotes(draft.categoryNotes);
    if (typeof draft.step === "number") setStep(Math.min(Math.max(draft.step, 0), STEPS.length - 1));
    setDraftMeta({ savedAt: draft.savedAt });
    setPendingDraft(null);
    toast("Draft restored. Continue where you left off.", "success");
  };

  const discardDraft = () => {
    clearDraft();
    setPendingDraft(null);
    toast("Draft discarded.", "info");
  };

  const category = watch("category");
  const selectedPropertyType = watch("propertyType");
  const selectedListingType = watch("listingType");
  const watchedTitle = watch("title");
  const watchedDescription = watch("description");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pendingDraft) return;

    const subscription = watch((formValues) => {
      if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current);
      setDraftSaving(true);
      draftSaveTimer.current = setTimeout(() => {
        try {
          const payload: DraftPayload = {
            formValues: formValues as Partial<PropertyInput>,
            step,
            images,
            selectedAmenities,
            categoryNotes,
            savedAt: Date.now(),
          };
          const hasContent =
            !!payload.formValues?.title ||
            !!payload.formValues?.listingType ||
            !!payload.formValues?.category ||
            !!payload.formValues?.propertyType ||
            !!payload.formValues?.city ||
            !!payload.formValues?.locality ||
            images.length > 0;
          if (!hasContent) {
            setDraftSaving(false);
            return;
          }
          localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
          setDraftMeta({ savedAt: payload.savedAt });
        } catch {
          // ignore quota errors
        } finally {
          setDraftSaving(false);
        }
      }, DRAFT_DEBOUNCE_MS);
    });

    return () => {
      subscription.unsubscribe();
      if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current);
    };
  }, [watch, pendingDraft, step, images, selectedAmenities, categoryNotes]);
  const watchedPrice = watch("price");
  const watchedArea = watch("area");
  const watchedCity = watch("city");
  const watchedLocality = watch("locality");
  const watchedAddress = watch("address");
  const watchedVisibility = watch("visibilityType");
  const watchedPublicBrokerName = watch("publicBrokerName");
  const activeTypeGuide = selectedPropertyType ? PROPERTY_TYPE_GUIDE[selectedPropertyType] : null;
  const uploadFocusItems = activeTypeGuide?.fields?.length
    ? activeTypeGuide.fields
    : selectedPropertyType
    ? ["Price", "Area", "Location", "Photos"]
    : ["Category", "Property type", "Price", "Location"];

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
      detail: getVisibilityLabel(watchedVisibility),
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
    if (categoryNotes.trim()) {
      data.description = `${data.description}\n\nCategory-specific details: ${categoryNotes.trim()}`;
    }
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
          visibilityType: "FULL_VISIBILITY",
          publicBrokerName: "KrrishJazz",
        });
        setImages([]);
        setSelectedAmenities([]);
        setTermsAccepted(false);
        setStep(0);
        clearDraft();
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-foreground">Post Property</h2>
        {draftMeta && !pendingDraft && (
          <div className="inline-flex items-center gap-2 rounded-pill border border-success/20 bg-success/10 px-3 py-1 text-xs font-medium text-success">
            {draftSaving ? (
              <>
                <Save size={12} className="animate-pulse" />
                Saving draft...
              </>
            ) : (
              <>
                <Check size={12} />
                Draft saved {formatRelativeTime(draftMeta.savedAt)}
              </>
            )}
          </div>
        )}
      </div>

      {pendingDraft && (
        <div className="mb-6 rounded-card border border-primary/25 bg-primary-light p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Resume your draft?</p>
              <p className="mt-1 text-xs text-text-secondary">
                We saved your last property draft {formatRelativeTime(pendingDraft.savedAt)}. Continue or start fresh.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="ghost" size="sm" onClick={discardDraft}>
                <CloudOff size={14} className="mr-1.5" />
                Discard
              </Button>
              <Button size="sm" onClick={() => resumeDraft(pendingDraft)}>
                <RotateCcw size={14} className="mr-1.5" />
                Resume
              </Button>
            </div>
          </div>
        </div>
      )}

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

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-card shadow-card border border-border p-6">
          {/* Step 1: Listing Type -> Category -> Property Type -> Title & Description */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="rounded-card border border-primary/20 bg-primary-light p-4">
                <p className="text-sm font-semibold text-primary">Start with what you are listing</p>
                <p className="text-xs text-text-secondary mt-1">Choose intent, then category and exact property type. Title and description come after, like other portals.</p>
              </div>

              <input type="hidden" {...register("category")} />
              <input type="hidden" {...register("propertyType")} />
              <input type="hidden" {...register("listingType")} />

              {/* 1. Listing Type */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">1</span>
                    I want to
                  </label>
                  {errors.listingType?.message && <p className="text-xs text-error">{errors.listingType.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {[
                    { value: "BUY", label: "Sell" },
                    { value: "RENT", label: "Rent Out" },
                    { value: "RESALE", label: "Resell" },
                    { value: "LEASE", label: "Lease" },
                    { value: "COMMERCIAL", label: "Commercial" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setValue("listingType", option.value as PropertyInput["listingType"], { shouldValidate: true })}
                      className={cn(
                        "rounded-btn border px-3 py-2.5 text-sm font-semibold transition-colors",
                        selectedListingType === option.value
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-white text-text-secondary hover:border-primary/40 hover:text-primary"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Category */}
              {selectedListingType && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">2</span>
                      Category
                    </label>
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
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-btn bg-white text-primary">
                          {CATEGORY_ICON_MAP[item.value] || <Building2 size={20} />}
                        </div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="mt-1 text-xs leading-5 text-text-secondary">{item.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Property Type */}
              {category && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">3</span>
                      Property Type
                    </label>
                    {errors.propertyType?.message && <p className="text-xs text-error">{errors.propertyType.message}</p>}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {(PROPERTY_TYPES[category] || []).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setValue("propertyType", type, { shouldValidate: true });
                          if (!watchedTitle) {
                            setValue("title", `${type} in `.trim(), { shouldValidate: false });
                          }
                        }}
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

              {/* 4. Title + Description (only after property type is picked) */}
              {selectedPropertyType && (
                <div className="space-y-4 rounded-card border border-border bg-surface p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">4</span>
                      Describe your {selectedPropertyType}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">A clear title and short description help buyers shortlist faster.</p>
                  </div>
                  <Input
                    label="Title"
                    placeholder={`e.g. 3BHK ${selectedPropertyType} in Salt Lake`}
                    error={errors.title?.message}
                    {...register("title")}
                  />
                  <Textarea
                    label="Description"
                    placeholder={`Describe your ${selectedPropertyType}: highlights, amenities, surroundings...`}
                    error={errors.description?.message}
                    {...register("description")}
                  />
                </div>
              )}

              <UploadFocusChecklist selectedType={selectedPropertyType} items={uploadFocusItems} />
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
                <Input label="Price (â‚¹)" type="number" placeholder="e.g. 5000000" error={errors.price?.message} {...register("price")} />
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
              <Textarea
                label={selectedPropertyType ? `${selectedPropertyType} specific details` : "Category-specific details"}
                placeholder={
                  isCommercialDetail
                    ? "Seats/cabins, frontage, floor, pantry, parking, power backup..."
                    : isIndustrialDetail
                    ? "Clear height, dock, truck access, power load, road width..."
                    : isPlotDetail
                    ? "Facing, road width, boundary, approvals, conversion status..."
                    : isHospitalityDetail
                    ? "Beds/rooms, sharing, food, rules, housekeeping, license..."
                    : "Maintenance, society, balcony, parking, lift, facing..."
                }
                value={categoryNotes}
                onChange={(event) => setCategoryNotes(event.target.value)}
              />
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
                <Input
                  label="Displayed Contact / Managed By"
                  placeholder="KrrishJazz"
                  error={errors.publicBrokerName?.message}
                  {...register("publicBrokerName")}
                />
              </div>

              <input type="hidden" {...register("visibilityType")} />
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Listing Reach</label>
                  {errors.visibilityType?.message && <p className="text-xs text-error">{errors.visibilityType.message}</p>}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {VISIBILITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setValue("visibilityType", option.value, { shouldValidate: true })}
                      className={cn(
                        "rounded-card border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-card",
                        watchedVisibility === option.value
                          ? "border-primary bg-primary-light shadow-card"
                          : "border-border bg-white hover:border-primary/40"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{option.label}</p>
                          <p className="mt-1 text-xs leading-5 text-text-secondary">{option.description}</p>
                        </div>
                        <span className={cn("mt-0.5 h-4 w-4 rounded-full border", watchedVisibility === option.value ? "border-primary bg-primary" : "border-border")} />
                      </div>
                    </button>
                  ))}
                </div>
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
                  <p className="font-semibold text-foreground mt-1">{getVisibilityLabel(watchedVisibility)}</p>
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
      <ListingLivePreview
        title={watchedTitle}
        description={watchedDescription}
        listingType={selectedListingType}
        propertyType={selectedPropertyType}
        city={watchedCity}
        locality={watchedLocality}
        price={watchedPrice}
        area={watchedArea}
        image={images[0]}
        visibility={watchedVisibility}
        managedBy={watchedPublicBrokerName}
        amenitiesCount={selectedAmenities.length}
      />
      </div>
    </div>
  );
}

// â”€â”€â”€ Leads â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ListingLivePreview({
  title,
  description,
  listingType,
  propertyType,
  city,
  locality,
  price,
  area,
  image,
  visibility,
  managedBy,
  amenitiesCount,
}: {
  title?: string;
  description?: string;
  listingType?: string;
  propertyType?: string;
  city?: string;
  locality?: string;
  price?: unknown;
  area?: unknown;
  image?: string;
  visibility?: string;
  managedBy?: string;
  amenitiesCount: number;
}) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 rounded-card border border-border bg-white p-4 shadow-card">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Live listing preview</p>
            <p className="text-xs text-text-secondary">How buyers and brokers will scan it.</p>
          </div>
          <Badge variant="blue">{getVisibilityLabel(visibility)}</Badge>
        </div>
        <div className="overflow-hidden rounded-card border border-border bg-white">
          <div className="relative h-44 bg-surface">
            {image ? (
              <img src={image} alt="Listing preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-primary">
                <Building2 size={42} />
              </div>
            )}
            <div className="absolute left-3 top-3 flex gap-1.5">
              <Badge variant="blue">{listingType || "Listing"}</Badge>
              <Badge variant="success">Managed</Badge>
            </div>
          </div>
          <div className="p-4">
            <p className="text-xl font-bold text-primary">{price ? formatPrice(Number(price)) : "Price pending"}</p>
            <h3 className="mt-2 line-clamp-2 text-base font-semibold text-foreground">{title || "Property title will appear here"}</h3>
            <p className="mt-1 line-clamp-1 text-sm text-text-secondary">{[locality, city].filter(Boolean).join(", ") || "Location pending"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-pill border border-border bg-surface px-3 py-1 text-xs font-semibold text-foreground">{propertyType || "Type"}</span>
              <span className="rounded-pill border border-border bg-surface px-3 py-1 text-xs font-semibold text-foreground">{area ? `${Number(area).toLocaleString("en-IN")} sqft` : "Area"}</span>
              <span className="rounded-pill border border-border bg-surface px-3 py-1 text-xs font-semibold text-foreground">{amenitiesCount} amenities</span>
            </div>
            <p className="mt-3 line-clamp-3 text-xs leading-5 text-text-secondary">{description || "Description preview helps you spot missing details before submission."}</p>
            <div className="mt-4 rounded-card border border-primary/20 bg-primary-light p-3">
              <p className="text-xs font-semibold text-primary">{managedBy || "KrrishJazz"} coordinates enquiries</p>
              <p className="mt-1 text-[11px] leading-4 text-text-secondary">Contact remains protected. Listing is free until deal closure.</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  const days = Math.floor(diff / 86_400_000);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}
