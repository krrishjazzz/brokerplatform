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

function asNumber(value: unknown) {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function requirementMatchesProperty(
  requirement: MatchableRequirement,
  property: MatchableProperty
) {
  if (requirement.propertyType !== property.propertyType) return false;
  if (!containsText(requirement.city, property.city)) return false;

  const propertyLocality = normalized(property.locality);
  const requirementLocality = normalized(requirement.locality);
  if (propertyLocality && requirementLocality && !requirementLocality.includes(propertyLocality)) {
    return false;
  }

  const price = asNumber(property.price);
  if (price == null) return false;

  const minBudget = asNumber(requirement.budgetMin);
  if (minBudget != null && minBudget > price) return false;

  const maxBudget = asNumber(requirement.budgetMax);
  if (maxBudget != null && maxBudget < price) return false;

  return true;
}

export function propertyMatchesRequirement(
  property: MatchableProperty,
  requirement: MatchableRequirement
) {
  if (property.propertyType !== requirement.propertyType) return false;
  if (!containsText(property.city, requirement.city)) return false;

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

export function countRequirementsForProperty(
  property: MatchableProperty,
  requirements: MatchableRequirement[]
) {
  return requirements.reduce(
    (count, requirement) => count + (requirementMatchesProperty(requirement, property) ? 1 : 0),
    0
  );
}

export function countPropertiesForRequirement(
  requirement: MatchableRequirement,
  properties: MatchableProperty[]
) {
  return properties.reduce(
    (count, property) => count + (propertyMatchesRequirement(property, requirement) ? 1 : 0),
    0
  );
}
