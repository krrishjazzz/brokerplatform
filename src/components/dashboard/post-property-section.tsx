"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Home, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { AMENITIES, CATEGORY_AMENITIES } from "@/lib/constants";
import { getIntentLabel, getPriceFieldsForIntent, normalizeListingForApi, type ListingIntent } from "@/lib/posting-config";
import {
  formatIntentAwarePrice,
  getListingIntentFromProperty,
  parseTypeSpecificDetails,
  syncPrimaryFieldsFromTypeDetails,
} from "@/lib/posting-field-sync";
import { dashboardFetch } from "@/lib/dashboard-api";
import { OWNER_DASHBOARD_PATH } from "@/lib/dashboard-paths";
import {
  MIN_IMAGES_RECOMMENDED,
  validatePostingPayload,
} from "@/lib/posting-validation";
import { propertySchema, type PropertyInput } from "@/lib/validations";
import {
  POST_PROPERTY_DRAFT_KEY,
  POST_PROPERTY_FIELD_STEP_MAP,
  POST_PROPERTY_STEPS,
  POST_PROPERTY_SUCCESS_KEY,
} from "@/features/post-property/constants";
import { usePropertyTypeFlags } from "@/features/post-property/hooks/use-property-type-flags";
import { ListingLivePreview } from "@/features/post-property/components/listing-live-preview";
import { PostSuccessPanel } from "@/features/post-property/components/post-success-panel";
import { WizardProgress } from "@/features/post-property/components/wizard-progress";
import {
  generateListingDescription,
  generateListingTitle,
} from "@/features/post-property/utils/generate-listing-copy";
import { formatRelativeTime } from "@/features/post-property/utils/format-relative-time";
import { uploadPropertyImages } from "@/features/post-property/services/upload-images";
import { DraftResumeBanner } from "@/features/post-property/components/draft-resume-banner";
import { PostPropertyWizardBody } from "@/features/post-property/components/post-property-wizard-body";
import { WizardNavigation } from "@/features/post-property/components/wizard-navigation";
import { usePostPropertyDraft } from "@/features/post-property/hooks/use-post-property-draft";

const STEPS = [...POST_PROPERTY_STEPS];

function firstFormErrorMessage(fieldErrors: FieldErrors<PropertyInput>): string {
  for (const err of Object.values(fieldErrors)) {
    if (err && typeof err === "object" && "message" in err && err.message) {
      return String(err.message);
    }
  }
  return "Please complete all required fields before submitting.";
}

function firstFormErrorField(fieldErrors: FieldErrors<PropertyInput>): string | undefined {
  for (const [field, err] of Object.entries(fieldErrors)) {
    if (err && typeof err === "object" && "message" in err && err.message) {
      return field;
    }
  }
  return undefined;
}

export function PostPropertySection({
  onPosted,
  editSlug,
}: {
  onPosted: () => void;
  editSlug?: string | null;
}) {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const isEditMode = Boolean(editSlug);
  const [step, setStep] = useState(0);
  const [editLoading, setEditLoading] = useState(Boolean(editSlug));
  const [editReviewSuccess, setEditReviewSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [upgradingOwner, setUpgradingOwner] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [titleCustomized, setTitleCustomized] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(POST_PROPERTY_SUCCESS_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [typeSpecificDetails, setTypeSpecificDetails] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitLockRef = useRef(false);

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
      listingIntent: "SELL",
      amenities: [],
      images: [],
      typeSpecificDetails: {},
      priceNegotiable: false,
      areaUnit: "sqft",
      visibilityType: "FULL_VISIBILITY",
      publicBrokerName: "KrrishJazz",
    },
  });

  const {
    draftMeta,
    pendingDraft,
    draftSaving,
    clearDraft,
    resumeDraft,
    discardDraft,
  } = usePostPropertyDraft({
    watch,
    reset,
    step,
    images,
    selectedAmenities,
    typeSpecificDetails,
    setImages,
    setSelectedAmenities,
    setTypeSpecificDetails,
    setStep,
    onResumeToast: (msg) => toast(msg, "success"),
    onDiscardToast: (msg) => toast(msg, "info"),
    pauseAutosave: submitting || submitSuccess,
  });

  useEffect(() => {
    if (submitSuccess && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [submitSuccess]);

  useEffect(() => {
    if (!editSlug) return;
    let cancelled = false;
    void (async () => {
      setEditLoading(true);
      const result = await dashboardFetch<{ property: Record<string, unknown> }>(
        `/api/properties/${editSlug}`
      );
      if (cancelled) return;
      if (result.error || !result.data?.property) {
        toast(result.error || "Could not load listing for edit", "error");
        setEditLoading(false);
        return;
      }
      const p = result.data.property;
      const details = parseTypeSpecificDetails(p.typeSpecificDetails as string | Record<string, string>);
      const listingIntent =
        getListingIntentFromProperty({
          typeSpecificDetails: details,
          listingType: p.listingType as string,
        }) || "SELL";
      const amenities = Array.isArray(p.amenities) ? (p.amenities as string[]) : [];
      const imgs = Array.isArray(p.images) ? (p.images as string[]) : [];
      reset({
        listingIntent,
        listingType: (p.listingType as PropertyInput["listingType"]) || undefined,
        category: p.category as PropertyInput["category"],
        propertyType: String(p.propertyType || ""),
        title: String(p.title || ""),
        description: String(p.description || ""),
        price: Number(p.price) || 0,
        priceNegotiable: Boolean(p.priceNegotiable),
        area: Number(p.area) || 0,
        areaUnit: (p.areaUnit as PropertyInput["areaUnit"]) || "sqft",
        bedrooms: p.bedrooms != null ? Number(p.bedrooms) : undefined,
        bathrooms: p.bathrooms != null ? Number(p.bathrooms) : undefined,
        floor: p.floor != null ? Number(p.floor) : undefined,
        totalFloors: p.totalFloors != null ? Number(p.totalFloors) : undefined,
        furnishing: (p.furnishing as string) || undefined,
        city: String(p.city || ""),
        locality: String(p.locality || ""),
        subLocality: String(p.subLocality || ""),
        projectOrSociety: String(p.projectOrSociety || ""),
        landmark: String(p.landmark || ""),
        address: String(p.address || ""),
        state: String(p.state || ""),
        pincode: String(p.pincode || ""),
        visibilityType: (p.visibilityType as PropertyInput["visibilityType"]) || "FULL_VISIBILITY",
        publicBrokerName: String(p.publicBrokerName || "KrrishJazz"),
        amenities,
        images: imgs,
        typeSpecificDetails: details,
      });
      setImages(imgs);
      setSelectedAmenities(amenities);
      setTypeSpecificDetails(details);
      setTitleCustomized(true);
      setEditLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [editSlug, reset, toast]);

  const category = watch("category");
  const selectedPropertyType = watch("propertyType");
  const selectedListingIntent = watch("listingIntent");
  const selectedListingType = watch("listingType");
  const watchedTitle = watch("title");
  const watchedDescription = watch("description");

  const watchedPrice = watch("price");
  const watchedArea = watch("area");
  const watchedCity = watch("city");
  const watchedLocality = watch("locality");
  const watchedAddress = watch("address");
  const watchedVisibility = watch("visibilityType");
  const watchedPublicBrokerName = watch("publicBrokerName");

  const refreshAutoTitle = useCallback(() => {
    if (titleCustomized || !selectedPropertyType || !selectedListingIntent) return;
    const title = generateListingTitle({
      listingIntent: selectedListingIntent as ListingIntent,
      propertyType: selectedPropertyType,
      typeDetails: typeSpecificDetails,
      locality: watchedLocality,
      city: watchedCity,
    });
    setValue("title", title, { shouldValidate: false });
  }, [
    titleCustomized,
    selectedPropertyType,
    selectedListingIntent,
    typeSpecificDetails,
    watchedLocality,
    watchedCity,
    setValue,
  ]);

  useEffect(() => {
    refreshAutoTitle();
  }, [refreshAutoTitle]);

  const ensureListingCopy = useCallback(() => {
    const intent = selectedListingIntent as ListingIntent;
    if (!selectedPropertyType || !intent) return;
    const currentTitle = watch("title");
    const currentDesc = watch("description");
    if (!titleCustomized && (!currentTitle || currentTitle.length < 5)) {
      setValue(
        "title",
        generateListingTitle({
          listingIntent: intent,
          propertyType: selectedPropertyType,
          typeDetails: typeSpecificDetails,
          locality: watchedLocality,
          city: watchedCity,
        }),
        { shouldValidate: true }
      );
    }
    if (!currentDesc || currentDesc.length < 20) {
      setValue(
        "description",
        generateListingDescription({
          listingIntent: intent,
          propertyType: selectedPropertyType,
          locality: watchedLocality,
          city: watchedCity,
          typeDetails: typeSpecificDetails,
        }),
        { shouldValidate: true }
      );
    }
  }, [
    selectedPropertyType,
    selectedListingIntent,
    typeSpecificDetails,
    watchedLocality,
    watchedCity,
    titleCustomized,
    watch,
    setValue,
  ]);

  const {
    isCommercialDetail,
    isIndustrialDetail,
    isPlotDetail,
    isHospitalityDetail,
    shouldShowRooms,
    shouldShowFurnishing,
  } = usePropertyTypeFlags(selectedPropertyType, category);
  const suggestedAmenities = (() => {
    if (category && CATEGORY_AMENITIES[category]) return CATEGORY_AMENITIES[category];
    if (isCommercialDetail) return CATEGORY_AMENITIES.COMMERCIAL;
    if (isIndustrialDetail) return CATEGORY_AMENITIES.INDUSTRIAL;
    if (isPlotDetail) return ["Road Access", "Fencing", "Water Supply", "Electricity"];
    return AMENITIES;
  })();

  const priceLabel = getPriceFieldsForIntent(
    (selectedListingIntent as ListingIntent) || "SELL"
  ).primaryLabel;

  const reviewChecklist = [
    {
      label: "Photos uploaded",
      detail:
        images.length >= MIN_IMAGES_RECOMMENDED
          ? `${images.length} photos - good for approval`
          : images.length > 0
          ? `${images.length} photo(s) - add more for faster approval`
          : "Add at least one clear photo",
      complete: images.length > 0,
    },
    {
      label: "Price is clear",
      detail: watchedPrice
        ? formatIntentAwarePrice(Number(watchedPrice), selectedListingIntent as ListingIntent)
        : `Add ${priceLabel.toLowerCase()}`,
      complete: Boolean(watchedPrice && Number(watchedPrice) > 0),
    },
    {
      label: "Location is clear",
      detail: watchedLocality || watchedCity || watchedAddress ? [watchedLocality, watchedCity].filter(Boolean).join(", ") || "Address added" : "Add locality and city",
      complete: Boolean(watchedAddress && watchedCity),
    },
    {
      label: "Managed by KrrishJazz",
      detail: "Enquiries coordinated by " + (watchedPublicBrokerName || "KrrishJazz"),
      complete: Boolean(watchedPublicBrokerName),
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
        toast("Listing access requested. KrrishJazz will review your account shortly.", "success");
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

  if (user?.canList && !user?.canPostProperty && user?.role !== "ADMIN") {
    return (
      <div>
        <h2 className="mb-6 text-xl font-semibold text-foreground">
          {isEditMode ? "Edit Property" : "Post Property"}
        </h2>
        <div className="max-w-xl rounded-card border border-border bg-white p-8 shadow-card">
          <h3 className="mb-2 text-lg font-semibold text-foreground">Listing tools pending approval</h3>
          <p className="text-sm text-text-secondary">
            {user.ownerStatus === "REJECTED"
              ? "Your listing access was not approved. Contact KrrishJazz support to re-apply."
              : "KrrishJazz is reviewing your owner access. You can browse the dashboard; posting and edits unlock after approval."}
          </p>
          {user.ownerStatus !== "REJECTED" && (
            <Link href={OWNER_DASHBOARD_PATH} className="mt-4 inline-block">
              <Button variant="outline" size="sm" type="button">
                Go to My listings
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

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

  const applySyncedFields = () => {
    const current = watch();
    const synced = syncPrimaryFieldsFromTypeDetails(
      { ...current, typeSpecificDetails: { ...typeSpecificDetails } },
      typeSpecificDetails
    );
    if (synced.bedrooms != null) setValue("bedrooms", synced.bedrooms);
    if (synced.bathrooms != null) setValue("bathrooms", synced.bathrooms);
    if (synced.floor != null) setValue("floor", synced.floor);
    if (synced.totalFloors != null) setValue("totalFloors", synced.totalFloors);
    if (synced.furnishing) setValue("furnishing", synced.furnishing);
    if (synced.area && synced.area > 0) setValue("area", synced.area);
    setValue("typeSpecificDetails", synced.typeSpecificDetails, { shouldValidate: false });
    return synced;
  };

  const validateStep = async () => {
    let fields: (keyof PropertyInput)[] = [];
    if (step === 0) fields = ["listingIntent", "category", "propertyType"];
    if (step === 1) {
      applySyncedFields();
      fields = ["price", "area"];
      const current = watch();
      const postingCheck = validatePostingPayload(
        { ...current, typeSpecificDetails: { ...typeSpecificDetails } },
        typeSpecificDetails,
        images.length
      );
      if (!postingCheck.ok && postingCheck.errors.typeSpecificDetails) {
        toast(postingCheck.errors.typeSpecificDetails, "error");
        return false;
      }
    }
    if (step === 2) fields = ["city", "locality", "subLocality", "projectOrSociety", "landmark", "address", "state", "pincode"];
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
    if (!valid) return;
    if (step === 3) ensureListingCopy();
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const applyNormalizedListingFields = () => {
    const current = watch();
    if (!current.listingIntent || !current.category || !current.propertyType) return;
    const normalized = normalizeListingForApi({
      listingIntent: current.listingIntent as ListingIntent,
      category: current.category as PropertyInput["category"],
      propertyType: current.propertyType,
      typeSpecificDetails: { ...typeSpecificDetails, ...(current.typeSpecificDetails ?? {}) },
    });
    setValue("listingType", normalized.listingType, { shouldValidate: false });
    setValue("category", normalized.category as PropertyInput["category"], { shouldValidate: false });
  };

  const syncFormBeforeSubmit = () => {
    ensureListingCopy();
    applySyncedFields();
    applyNormalizedListingFields();
    setValue("typeSpecificDetails", { ...typeSpecificDetails }, { shouldValidate: false });
    setValue("images", images, { shouldValidate: true });
    setValue("amenities", selectedAmenities, { shouldValidate: false });
    setValue("coverImage", images[0] || "", { shouldValidate: false });
  };

  const handleFinalSubmit = () => {
    if (submitLockRef.current || submitting) return;
    if (!termsAccepted) {
      toast("Please tick the terms checkbox above before submitting.", "error");
      return;
    }
    if (uploadingImages) {
      toast("Please wait for photos to finish uploading.", "info");
      return;
    }

    syncFormBeforeSubmit();

    const current = watch();
    const postingCheck = validatePostingPayload(
      { ...current, typeSpecificDetails: { ...typeSpecificDetails } },
      typeSpecificDetails,
      images.length
    );
    if (!postingCheck.ok) {
      const msg =
        postingCheck.errors.typeSpecificDetails ||
        postingCheck.errors.images ||
        postingCheck.errors.listingIntent ||
        "Please complete required fields before submitting.";
      toast(msg, "error");
      if (postingCheck.errors.typeSpecificDetails) setStep(1);
      else if (postingCheck.errors.images) setStep(3);
      return;
    }

    handleSubmit(onSubmit, (fieldErrors) => {
      const message = firstFormErrorMessage(fieldErrors);
      const field = firstFormErrorField(fieldErrors);
      toast(message, "error");
      if (field) {
        setStep(POST_PROPERTY_FIELD_STEP_MAP[field] ?? 0);
      }
    })();
  };

  const onSubmit = async (data: PropertyInput) => {
    if (submitLockRef.current) return;
    if (uploadingImages) {
      toast("Please wait for images to finish uploading.", "info");
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);
    const payload = syncPrimaryFieldsFromTypeDetails(
      { ...data, typeSpecificDetails: { ...typeSpecificDetails, ...(data.typeSpecificDetails ?? {}) } },
      { ...typeSpecificDetails, ...(data.typeSpecificDetails ?? {}) }
    );
    const normalized = normalizeListingForApi({
      listingIntent: payload.listingIntent,
      category: payload.category,
      propertyType: payload.propertyType,
      typeSpecificDetails: payload.typeSpecificDetails,
    });
    const details = normalized.typeSpecificDetails as Record<string, string>;
    if (images.length < MIN_IMAGES_RECOMMENDED) {
      details.needsBetterPhotos = "true";
    }
    payload.listingType = normalized.listingType;
    payload.category = normalized.category as PropertyInput["category"];
    payload.typeSpecificDetails = details;
    payload.amenities = selectedAmenities;
    payload.images = images;
    payload.coverImage = images[0];
    try {
      const url = isEditMode && editSlug ? `/api/properties/${editSlug}` : "/api/properties";
      const method = isEditMode ? "PUT" : "POST";
      const result = await dashboardFetch<{ property?: unknown }>(url, {
        method,
        body: JSON.stringify(payload),
      });
      if (result.data) {
        if (isEditMode) {
          setEditReviewSuccess(true);
          window.dispatchEvent(new CustomEvent("krrishjazz:property-posted"));
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          try {
            localStorage.removeItem(POST_PROPERTY_DRAFT_KEY);
            sessionStorage.setItem(POST_PROPERTY_SUCCESS_KEY, "1");
          } catch {
            // ignore
          }
          clearDraft();
          setSubmitSuccess(true);
          window.dispatchEvent(new CustomEvent("krrishjazz:property-posted"));
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else {
        toast(result.error || (isEditMode ? "Failed to save changes" : "Failed to post property"), "error");
      }
    } catch (error) {
      console.error("Property submit error", error);
      toast(isEditMode ? "Something went wrong while saving changes." : "Something went wrong while posting property.", "error");
    } finally {
      setSubmitting(false);
      submitLockRef.current = false;
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
      const uploadedUrls = await uploadPropertyImages(files);

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

  const resetWizard = () => {
    try {
      sessionStorage.removeItem(POST_PROPERTY_SUCCESS_KEY);
    } catch {
      // ignore
    }
    submitLockRef.current = false;
    reset({
      listingIntent: "SELL",
      amenities: [],
      images: [],
      typeSpecificDetails: {},
      priceNegotiable: false,
      areaUnit: "sqft",
      visibilityType: "FULL_VISIBILITY",
      publicBrokerName: "KrrishJazz",
      title: "",
      description: "",
    });
    setImages([]);
    setSelectedAmenities([]);
    setTypeSpecificDetails({});
    setTermsAccepted(false);
    setTitleCustomized(false);
    setStep(0);
    setSubmitSuccess(false);
  };

  if (editLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (editReviewSuccess) {
    return (
      <div className="max-w-xl rounded-2xl border border-border bg-white p-8 shadow-card">
        <h2 className="text-xl font-semibold text-foreground">Changes sent for review</h2>
        <p className="mt-3 text-sm text-text-secondary">
          KrrishJazz will review your updates before they go live. You can track status under My Properties.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => onPosted()}>View My Properties</Button>
          <Button variant="outline" onClick={() => setEditReviewSuccess(false)}>
            Edit again
          </Button>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div>
        <h2 className="mb-6 text-xl font-semibold text-foreground">Post Property</h2>
        <PostSuccessPanel
          onViewProperties={() => {
            resetWizard();
            onPosted();
          }}
          onPostAnother={resetWizard}
        />
      </div>
    );
  }

  return (
    <div className="pb-24 sm:pb-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {isEditMode ? "Edit Property" : "Post Property"}
        </h2>
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
        <DraftResumeBanner
          draft={pendingDraft}
          onResume={() => resumeDraft(pendingDraft)}
          onDiscard={discardDraft}
        />
      )}

      <WizardProgress step={step} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step === STEPS.length - 1) {
            handleFinalSubmit();
          } else {
            void handleNext();
          }
        }}
      >
        <div className="rounded-card border border-border bg-white p-4 shadow-card sm:p-6">
          <PostPropertyWizardBody
            step={step}
            register={register}
            errors={errors}
            setValue={setValue}
            category={category}
            selectedListingIntent={selectedListingIntent}
            selectedListingType={selectedListingType}
            selectedPropertyType={selectedPropertyType}
            watchedTitle={watchedTitle}
            watchedDescription={watchedDescription}
            watchedVisibility={watchedVisibility}
            watchedPrice={watchedPrice}
            watchedArea={watchedArea}
            watchedCity={watchedCity}
            watchedLocality={watchedLocality}
            onTitleManualEdit={() => setTitleCustomized(true)}
            isPlotDetail={isPlotDetail}
            isCommercialDetail={isCommercialDetail}
            isIndustrialDetail={isIndustrialDetail}
            isHospitalityDetail={isHospitalityDetail}
            shouldShowRooms={shouldShowRooms}
            shouldShowFurnishing={shouldShowFurnishing}
            typeSpecificDetails={typeSpecificDetails}
            setTypeSpecificDetail={(key, value) =>
              setTypeSpecificDetails((prev) => ({ ...prev, [key]: value }))
            }
            images={images}
            uploadError={uploadError}
            uploadingImages={uploadingImages}
            fileInputRef={fileInputRef}
            uploadImages={uploadImages}
            removeImage={removeImage}
            selectedAmenities={selectedAmenities}
            toggleAmenity={toggleAmenity}
            suggestedAmenities={suggestedAmenities}
            reviewChecklist={reviewChecklist}
            termsAccepted={termsAccepted}
            setTermsAccepted={setTermsAccepted}
          />

          <WizardNavigation
            step={step}
            submitting={submitting}
            uploadingImages={uploadingImages}
            termsAccepted={termsAccepted}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleFinalSubmit}
          />

        </div>
      </form>
      <ListingLivePreview
        title={watchedTitle}
        description={watchedDescription}
        listingType={
          selectedListingIntent
            ? getIntentLabel(selectedListingIntent as ListingIntent)
            : selectedListingType
        }
        listingIntent={selectedListingIntent as ListingIntent | undefined}
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
