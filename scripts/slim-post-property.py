from pathlib import Path

path = Path("src/components/dashboard/post-property-section.tsx")
text = path.read_text(encoding="utf-8")

# Replace imports block - add new imports after upload-images import
old_imports_end = 'import { uploadPropertyImages } from "@/features/post-property/services/upload-images";'
new_imports = old_imports_end + """
import { DraftResumeBanner } from "@/features/post-property/components/draft-resume-banner";
import { PostPropertyWizardBody } from "@/features/post-property/components/post-property-wizard-body";
import { WizardNavigation } from "@/features/post-property/components/wizard-navigation";
import { usePostPropertyDraft } from "@/features/post-property/hooks/use-post-property-draft";"""

text = text.replace(old_imports_end, new_imports)

# Remove draft state block (lines with draftMeta through discardDraft function)
start = text.index("  const [draftMeta, setDraftMeta]")
end = text.index("  const category = watch(\"category\");")
draft_hook = """  const {
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

"""
text = text[:start] + draft_hook + text[end:]

# Remove draft useEffect (the watch subscription for draft save) - already in hook
draft_effect_start = text.index("  useEffect(() => {\n    if (typeof window === \"undefined\") return;\n    if (pendingDraft) return;")
draft_effect_end = text.index("  }, [watch, pendingDraft, step, images, selectedAmenities, categoryNotes]);\n  const watchedPrice")
# Find the correct block - the one after category watch
idx = text.find("  useEffect(() => {\n    if (typeof window === \"undefined\") return;\n    if (pendingDraft) return;", text.index("const category = watch"))
if idx != -1:
    end_idx = text.index("  }, [watch, pendingDraft, step, images, selectedAmenities, categoryNotes]);", idx) + len("  }, [watch, pendingDraft, step, images, selectedAmenities, categoryNotes]);")
    text = text[:idx] + text[end_idx:]

# Remove initial draft load useEffect
load_start = text.index("  useEffect(() => {\n    if (typeof window === \"undefined\" || draftLoadedRef.current) return;")
load_end = text.index("  }, []);\n\n  const clearDraft", load_start)
if "draftLoadedRef" in text[load_start:load_end]:
    text = text[:load_start] + text[load_end:]

# clearDraft, resumeDraft, discardDraft functions - remove if still present
for fn in ["  const clearDraft = () => {", "  const resumeDraft = (draft: DraftPayload) => {", "  const discardDraft = () => {"]:
    if fn in text:
        s = text.index(fn)
        # find end of function - next "  const " at same indent
        e = s
        depth = 0
        for i in range(s, len(text)):
            if text[i] == "{":
                depth += 1
            elif text[i] == "}":
                depth -= 1
                if depth == 0 and i > s:
                    e = i + 1
                    break
        text = text[:s] + text[e:]

# Replace pending draft banner
banner_start = text.index("      {pendingDraft && (")
banner_end = text.index("      )}\n\n      <div className=\"mb-6 rounded-card border border-primary/20")
banner_new = """      {pendingDraft && (
        <DraftResumeBanner
          draft={pendingDraft}
          onResume={() => resumeDraft(pendingDraft)}
          onDiscard={discardDraft}
        />
      )}

"""
text = text[:banner_start] + banner_new + text[banner_end:]

# Replace wizard steps with PostPropertyWizardBody
steps_start = text.index("          {/* Step 1: Listing Type")
nav_start = text.index("          {/* Navigation buttons */}")
wizard_replace = """          <PostPropertyWizardBody
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

"""
text = text[:steps_start] + wizard_replace + text[nav_start:]

# Replace navigation
nav_end = text.index("        </motionless>\n      </form>", nav_start)
if "</form>" in text[nav_start:]:
    nav_end = text.index("      </form>", nav_start)
nav_replace = """          <WizardNavigation
            step={step}
            submitting={submitting}
            uploadingImages={uploadingImages}
            termsAccepted={termsAccepted}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleFinalSubmit}
          />

"""
text = text[:nav_start] + nav_replace + text[nav_end:]

# Remove unused imports
for imp in ["  ChevronLeft,\n  ChevronRight,", "  CloudOff,\n  RotateCcw,", "  formatRelativeTime"]:
    text = text.replace(imp, "")

path.write_text(text, encoding="utf-8")
print("slimmed post-property", text.count("\n"), "lines")
