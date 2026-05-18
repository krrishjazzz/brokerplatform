"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Home, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { AMENITIES, CATEGORY_AMENITIES, PROPERTY_TYPE_GUIDE } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { propertySchema, type PropertyInput } from "@/lib/validations";
import { getVisibilityLabel } from "@/lib/visibility";
import {
  POST_PROPERTY_FIELD_STEP_MAP,
  POST_PROPERTY_STEPS,
} from "@/features/post-property/constants";
import { usePropertyTypeFlags } from "@/features/post-property/hooks/use-property-type-flags";
import { ListingLivePreview } from "@/features/post-property/components/listing-live-preview";
import { WizardProgress } from "@/features/post-property/components/wizard-progress";
import { formatRelativeTime } from "@/features/post-property/utils/format-relative-time";
import { uploadPropertyImages } from "@/features/post-property/services/upload-images";
import { DraftResumeBanner } from "@/features/post-property/components/draft-resume-banner";
import { PostPropertyWizardBody } from "@/features/post-property/components/post-property-wizard-body";
import { WizardNavigation } from "@/features/post-property/components/wizard-navigation";
import { usePostPropertyDraft } from "@/features/post-property/hooks/use-post-property-draft";

const STEPS = [...POST_PROPERTY_STEPS];

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
    categoryNotes,
    setImages,
    setSelectedAmenities,
    setCategoryNotes,
    setStep,
    onResumeToast: (msg) => toast(msg, "success"),
    onDiscardToast: (msg) => toast(msg, "info"),
  });

  const category = watch("category");
  const selectedPropertyType = watch("propertyType");
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
  const activeTypeGuide = selectedPropertyType ? PROPERTY_TYPE_GUIDE[selectedPropertyType] : null;
  const uploadFocusItems = activeTypeGuide?.fields?.length
    ? activeTypeGuide.fields
    : selectedPropertyType
    ? ["Price", "Area", "Location", "Photos"]
    : ["Category", "Property type", "Price", "Location"];

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

  const handleFinalSubmit = async () => {
    if (!termsAccepted) {
      toast("Please acknowledge the free listing and brokerage terms before submitting.", "error");
      return;
    }
    const valid = await trigger();
    if (!valid) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        setStep(POST_PROPERTY_FIELD_STEP_MAP[firstErrorField] ?? 0);
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
        <DraftResumeBanner
          draft={pendingDraft}
          onResume={() => resumeDraft(pendingDraft)}
          onDiscard={discardDraft}
        />
      )}

      <div className="mb-6 rounded-card border border-primary/20 bg-primary-light p-4">
        <p className="text-sm font-semibold text-primary">Free listing on KrrishJazz</p>
        <p className="mt-1 text-xs leading-5 text-text-secondary">No upfront posting charge. KrrishJazz verifies details, coordinates enquiries, and charges one month brokerage only after a successful closure.</p>
      </div>

      <WizardProgress step={step} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-card shadow-card border border-border p-6">
          <PostPropertyWizardBody
            step={step}
            register={register}
            errors={errors}
            setValue={setValue}
            category={category}
            selectedListingType={selectedListingType}
            selectedPropertyType={selectedPropertyType}
            watchedTitle={watchedTitle}
            watchedVisibility={watchedVisibility}
            watchedPrice={watchedPrice}
            watchedArea={watchedArea}
            watchedCity={watchedCity}
            uploadFocusItems={uploadFocusItems}
            activeTypeGuide={activeTypeGuide}
            isPlotDetail={isPlotDetail}
            isCommercialDetail={isCommercialDetail}
            isIndustrialDetail={isIndustrialDetail}
            isHospitalityDetail={isHospitalityDetail}
            shouldShowRooms={shouldShowRooms}
            shouldShowFurnishing={shouldShowFurnishing}
            categoryNotes={categoryNotes}
            setCategoryNotes={setCategoryNotes}
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
