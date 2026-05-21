import {
  getSearchPreset,
  type IntentPropertyTypeOption,
  type SearchPresetId,
} from "@/lib/search-intent-config";

export type PropertyTypeChip = {
  label: string;
  optionId?: string;
  apiTypes: string[];
};

/** Map selected API types + option ids back to user-facing labels (one chip per checkbox). */
export function getPropertyTypeChips(
  presetId: SearchPresetId,
  apiTypes: string[],
  optionIds: string[]
): PropertyTypeChip[] {
  const preset = getSearchPreset(presetId);
  const chips: PropertyTypeChip[] = [];
  const usedApiTypes = new Set<string>();

  for (const optionId of optionIds) {
    const option = preset.propertyTypes.find((o) => o.id === optionId);
    if (option) {
      chips.push({
        label: option.label,
        optionId: option.id,
        apiTypes: option.apiTypes,
      });
      option.apiTypes.forEach((t) => usedApiTypes.add(t));
    }
  }

  for (const option of preset.propertyTypes) {
    if (option.apiTypes.length === 0) continue;
    if (option.apiTypes.every((t) => apiTypes.includes(t))) {
      if (!chips.some((c) => c.optionId === option.id)) {
        chips.push({
          label: option.label,
          optionId: option.id,
          apiTypes: option.apiTypes,
        });
        option.apiTypes.forEach((t) => usedApiTypes.add(t));
      }
    }
  }

  for (const apiType of apiTypes) {
    if (usedApiTypes.has(apiType)) continue;
    const option = findOptionByApiType(preset.propertyTypes, apiType);
    chips.push({
      label: option?.label ?? apiType,
      optionId: option?.id,
      apiTypes: [apiType],
    });
  }

  return chips;
}

function findOptionByApiType(
  options: IntentPropertyTypeOption[],
  apiType: string
): IntentPropertyTypeOption | undefined {
  return options.find((o) => o.apiTypes.includes(apiType));
}
