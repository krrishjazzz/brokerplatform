"use client";

/* eslint-disable @typescript-eslint/no-unused-vars -- shared wizard prop bag */
import { Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PROPERTY_CATEGORY_OPTIONS, PROPERTY_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PropertyInput } from "@/lib/validations";
import { CATEGORY_ICON_MAP } from "@/features/post-property/category-icons";
import { UploadFocusChecklist } from "@/features/post-property/components/upload-focus-checklist";
import type { PostPropertyStepProps } from "@/features/post-property/types/wizard-step-props";

export function TypeStep({
  register,
  errors,
  setValue,
  category,
  selectedListingType,
  selectedPropertyType,
  watchedTitle,
  uploadFocusItems,
}: PostPropertyStepProps) {

  return (
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
  );
}
