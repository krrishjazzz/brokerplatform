from pathlib import Path

p = Path("src/app/properties/page.tsx")
t = p.read_text(encoding="utf-8")

# Add import
if "PropertiesFiltersSidebar" not in t:
    t = t.replace(
        'import { isBudgetMatched, usePropertiesSearch, useSavedSearches } from "@/features/properties-search";',
        'import { isBudgetMatched, usePropertiesSearch, useSavedSearches } from "@/features/properties-search";\nimport { PropertiesFiltersSidebar } from "@/features/properties-search/components/properties-filters-sidebar";',
    )

a = t.index("        <aside")
b = t.index("        </aside>", a) + len("        </aside>")

replacement = """        <PropertiesFiltersSidebar
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          listingType={listingType}
          setListingType={setListingType}
          category={category}
          setCategory={setCategory}
          propertyType={propertyType}
          setPropertyType={setPropertyType}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          bedrooms={bedrooms}
          setBedrooms={setBedrooms}
          city={city}
          setCity={setCity}
          locality={locality}
          setLocality={setLocality}
          furnishing={furnishing}
          setFurnishing={setFurnishing}
          freshOnly={freshOnly}
          setFreshOnly={setFreshOnly}
          verifiedOnly={verifiedOnly}
          setVerifiedOnly={setVerifiedOnly}
          readyToVisitOnly={readyToVisitOnly}
          setReadyToVisitOnly={setReadyToVisitOnly}
          ownerListedOnly={ownerListedOnly}
          setOwnerListedOnly={setOwnerListedOnly}
          budgetMatchOnly={budgetMatchOnly}
          applyQuickFilter={applyQuickFilter}
          setPage={setPage}
          clearFilters={clearFilters}
          availablePropertyTypes={availablePropertyTypes}
          shownTotal={shownTotal}
          onApply={fetchProperties}
        />"""

t = t[:a] + replacement + t[b:]

# Remove unused imports if possible - FilterGroup FilterChip CATEGORY_OPTIONS LISTING_TABS FURNISHING_OPTIONS from page - check usage
p.write_text(t, encoding="utf-8")
print("properties page lines", t.count("\n"))
