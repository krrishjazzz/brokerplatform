"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TypeFieldDef } from "@/lib/posting-config";
import { splitTypeFields } from "@/lib/posting-ui-config";
import { CollapsibleSection } from "@/features/post-property/components/collapsible-section";

function FieldGrid({
  fields,
  values,
  onChange,
}: {
  fields: TypeFieldDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  if (fields.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const value = values[field.key] ?? "";
        if (field.type === "select" && field.options) {
          return (
            <Select
              key={field.key}
              label={field.label}
              options={[
                { value: "", label: "Select" },
                ...field.options.map((o) => ({ value: o, label: o })),
              ]}
              value={value}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
          );
        }
        if (field.type === "textarea") {
          return (
            <div key={field.key} className="sm:col-span-2">
              <Textarea
                label={field.label}
                placeholder={field.placeholder}
                value={value}
                onChange={(e) => onChange(field.key, e.target.value)}
              />
            </div>
          );
        }
        if (field.type === "number") {
          return (
            <Input
              key={field.key}
              label={field.label}
              type="number"
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
          );
        }
        return (
          <Input
            key={field.key}
            label={field.label}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        );
      })}
    </div>
  );
}

type DynamicTypeFieldsProps = {
  propertyType: string;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
};

export function DynamicTypeFields({ propertyType, values, onChange }: DynamicTypeFieldsProps) {
  const { primary, advanced } = splitTypeFields(propertyType);
  if (primary.length === 0 && advanced.length === 0) return null;

  return (
    <div className="space-y-3">
      {primary.length > 0 && (
        <CollapsibleSection
          title="Type-specific details"
          subtitle="Key details buyers ask for first"
          defaultOpen
        >
          <FieldGrid fields={primary} values={values} onChange={onChange} />
        </CollapsibleSection>
      )}
      {advanced.length > 0 && (
        <CollapsibleSection
          title="Advanced details"
          subtitle="Facing, ownership, road width, approvals (optional)"
          defaultOpen={false}
        >
          <FieldGrid fields={advanced} values={values} onChange={onChange} />
        </CollapsibleSection>
      )}
    </div>
  );
}
