"use client";

import { useState } from "react";
import {
  getPostingCategoriesForIntent,
  getPropertyTypesForPosting,
  normalizeListingForApi,
  PRIMARY_POSTING_CHOICES,
  type ListingIntent,
  type PostingCategory,
} from "@/lib/posting-config";
import { OWNER_CATEGORY_CHIPS, getPropertyTypeChips } from "@/lib/posting-ui-config";
import {
  intentToPrimaryChoice,
  primaryChoiceToIntent,
  resolveRentLeaseIntent,
  type PrimaryPostingChoice,
} from "@/lib/posting-validation";
import type { PropertyInput } from "@/lib/validations";
import { PostingChip } from "@/features/post-property/components/posting-chip";
import type { PostPropertyStepProps } from "@/features/post-property/types/wizard-step-props";

export function TypeStep({
  register,
  errors,
  setValue,
  category,
  selectedListingIntent,
  selectedPropertyType,
}: PostPropertyStepProps) {
  const [showMoreTypes, setShowMoreTypes] = useState(false);
  const intent = (selectedListingIntent as ListingIntent) || undefined;
  const primaryChoice = intentToPrimaryChoice(intent);
  const categories =
    intent && intent !== "PG"
      ? OWNER_CATEGORY_CHIPS.filter((c) =>
          getPostingCategoriesForIntent(intent).some((x) => x.value === c.value)
        )
      : [];
  const propertyTypes =
    intent && category
      ? getPropertyTypesForPosting(intent, category as PostingCategory)
      : [];
  const { popular, more } = getPropertyTypeChips(propertyTypes, category as PostingCategory | undefined);

  const syncListingType = (intent: ListingIntent, cat: PostingCategory, propertyType?: string) => {
    const normalized = normalizeListingForApi({
      listingIntent: intent,
      category: cat,
      propertyType: propertyType || "Apartment",
      typeSpecificDetails: {},
    });
    setValue("listingType", normalized.listingType, { shouldValidate: false });
    setValue("category", normalized.category as PropertyInput["category"], { shouldValidate: false });
  };

  const selectPrimary = (choice: PrimaryPostingChoice) => {
    const nextIntent = primaryChoiceToIntent(choice, category as PostingCategory | undefined);
    setValue("listingIntent", nextIntent, { shouldValidate: true });
    setValue("category", "" as PropertyInput["category"], { shouldValidate: true });
    setValue("propertyType", "", { shouldValidate: true });
    setShowMoreTypes(false);
    if (choice === "PG") {
      setValue("category", "HOSPITALITY", { shouldValidate: true });
      syncListingType("PG", "HOSPITALITY");
    } else if (nextIntent === "SELL") {
      setValue("listingType", "BUY", { shouldValidate: false });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Start posting your property, it&apos;s free</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Takes about 2 minutes. KrrishJazz verifies details and manages buyer calls for you.
        </p>
      </div>

      <input type="hidden" {...register("listingIntent")} />
      <input type="hidden" {...register("category")} />
      <input type="hidden" {...register("propertyType")} />
      <input type="hidden" {...register("listingType")} />

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">You&apos;re looking to...</p>
        <div className="flex flex-wrap gap-2">
          {PRIMARY_POSTING_CHOICES.map((option) => (
            <PostingChip
              key={option.id}
              label={option.label}
              selected={primaryChoice === option.id}
              onClick={() => selectPrimary(option.id)}
            />
          ))}
        </div>
        {errors.listingIntent?.message && (
          <p className="mt-1 text-xs text-error">{String(errors.listingIntent.message)}</p>
        )}
      </div>

      {intent && intent !== "PG" && (
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">And it&apos;s a...</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <PostingChip
                key={item.value}
                label={item.label}
                selected={category === item.value}
                onClick={() => {
                  const cat = item.value as PostingCategory;
                  let intent = (selectedListingIntent as ListingIntent) || "SELL";
                  if (primaryChoice === "RENT_LEASE") {
                    intent = resolveRentLeaseIntent(cat);
                    setValue("listingIntent", intent, { shouldValidate: true });
                  }
                  setValue("category", cat as PropertyInput["category"], { shouldValidate: true });
                  syncListingType(intent, cat);
                  setValue("propertyType", "", { shouldValidate: true });
                  setShowMoreTypes(false);
                }}
              />
            ))}
          </div>
          {errors.category?.message && <p className="mt-1 text-xs text-error">{errors.category.message}</p>}
        </div>
      )}

      {category && propertyTypes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Property type</p>
          <div className="flex flex-wrap gap-2">
            {popular.map((chip) => (
              <PostingChip
                key={chip.value}
                label={chip.label}
                selected={selectedPropertyType === chip.value}
                onClick={() => setValue("propertyType", chip.value, { shouldValidate: true })}
              />
            ))}
            {more.length > 0 && (
              <PostingChip
                label={showMoreTypes ? "Fewer types" : `${more.length} more`}
                selected={false}
                onClick={() => setShowMoreTypes((v) => !v)}
                className="border-dashed"
              />
            )}
          </div>
          {showMoreTypes && (
            <div className="mt-2 flex flex-wrap gap-2">
              {more.map((chip) => (
                <PostingChip
                  key={chip.value}
                  label={chip.label}
                  selected={selectedPropertyType === chip.value}
                  onClick={() => setValue("propertyType", chip.value, { shouldValidate: true })}
                />
              ))}
            </div>
          )}
          {errors.propertyType?.message && (
            <p className="mt-1 text-xs text-error">{errors.propertyType.message}</p>
          )}
        </div>
      )}

      {intent === "PG" && category && propertyTypes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Property type</p>
          <div className="flex flex-wrap gap-2">
            {propertyTypes.map((type) => (
              <PostingChip
                key={type}
                label={type}
                selected={selectedPropertyType === type}
                onClick={() => setValue("propertyType", type, { shouldValidate: true })}
              />
            ))}
          </div>
        </div>
      )}

      {selectedPropertyType && (
        <p className="rounded-lg border border-success/20 bg-success-light/50 px-3 py-2 text-sm text-success">
          Good choice. Next: add price and size - we&apos;ll draft your listing title for review.
        </p>
      )}
    </div>
  );
}
