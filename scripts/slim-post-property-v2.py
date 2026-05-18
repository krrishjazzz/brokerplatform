from pathlib import Path

p = Path("src/components/dashboard/post-property-section.tsx")
t = p.read_text(encoding="utf-8")

a = t.index("{pendingDraft && (")
b = t.find('className="mb-6 rounded-card border border-primary/20 bg-primary-light p-4">', a)

new_banner = """      {pendingDraft && (
        <DraftResumeBanner
          draft={pendingDraft}
          onResume={() => resumeDraft(pendingDraft)}
          onDiscard={discardDraft}
        />
      )}

"""
t = t[:a] + new_banner + t[b:]

a = t.index("          {/* Step 1: Listing Type")
b = t.index("          {/* Navigation buttons */}")
wizard = """          <PostPropertyWizardBody
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
t = t[:a] + wizard + t[b:]

a = t.index("          {/* Navigation buttons */}")
b = t.index("      </form>", a)
nav = """          <WizardNavigation
            step={step}
            submitting={submitting}
            uploadingImages={uploadingImages}
            termsAccepted={termsAccepted}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleFinalSubmit}
          />

"""
t = t[:a] + nav + t[b:]

p.write_text(t, encoding="utf-8")
print("lines", t.count("\n"))
