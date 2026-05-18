type TextLike = string | null | undefined;

export type MatchableProperty = {
  propertyType: string;
  city: string;
  locality?: TextLike;
  price: unknown;
};

export type MatchableRequirement = {
  propertyType: string;
  city: string;
  locality?: TextLike;
  budgetMin?: unknown;
  budgetMax?: unknown;
};

export function uniqueText(values: TextLike[]) {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value))
    )
  );
}

function normalized(value: TextLike) {
  return (value || "").trim().toLowerCase();
}

function containsText(value: TextLike, search: TextLike) {
  const needle = normalized(search);
  if (!needle) return true;
  return normalized(value).includes(needle);
}

function citiesOverlap(propertyCity: TextLike, requirementCity: TextLike) {
  return containsText(propertyCity, requirementCity) || containsText(requirementCity, propertyCity);
}

function asNumber(value: unknown) {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Single source of truth for property ↔ requirement matching (counts + match drawer). */
export function matchesPropertyAndRequirement(
  property: MatchableProperty,
  requirement: MatchableRequirement
) {
  if (property.propertyType !== requirement.propertyType) return false;
  if (!citiesOverlap(property.city, requirement.city)) return false;

  const requirementLocality = normalized(requirement.locality);
  if (requirementLocality && !containsText(property.locality, requirement.locality)) {
    return false;
  }

  const price = asNumber(property.price);
  if (price == null) return false;

  const minBudget = asNumber(requirement.budgetMin);
  if (minBudget != null && price < minBudget) return false;

  const maxBudget = asNumber(requirement.budgetMax);
  if (maxBudget != null && price > maxBudget) return false;

  return true;
}

export function requirementMatchesProperty(
  requirement: MatchableRequirement,
  property: MatchableProperty
) {
  return matchesPropertyAndRequirement(property, requirement);
}

export function propertyMatchesRequirement(
  property: MatchableProperty,
  requirement: MatchableRequirement
) {
  return matchesPropertyAndRequirement(property, requirement);
}

export function countRequirementsForProperty(
  property: MatchableProperty,
  requirements: MatchableRequirement[]
) {
  return requirements.reduce(
    (count, requirement) => count + (matchesPropertyAndRequirement(property, requirement) ? 1 : 0),
    0
  );
}

export function countPropertiesForRequirement(
  requirement: MatchableRequirement,
  properties: MatchableProperty[]
) {
  return properties.reduce(
    (count, property) => count + (matchesPropertyAndRequirement(property, requirement) ? 1 : 0),
    0
  );
}
