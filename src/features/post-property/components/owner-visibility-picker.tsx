"use client";

import { cn } from "@/lib/utils";

const OWNER_VISIBILITY_OPTIONS = [
  {
    value: "FULL_VISIBILITY" as const,
    label: "Public on KrrishJazz",
    description: "Buyers and tenants can discover your listing after approval.",
  },
  {
    value: "PRIVATE" as const,
    label: "Only KrrishJazz team",
    description: "We match leads internally; listing is not shown on the public site.",
  },
];

type OwnerVisibilityPickerProps = {
  value: string;
  onChange: (value: "FULL_VISIBILITY" | "PRIVATE") => void;
};

export function OwnerVisibilityPicker({ value, onChange }: OwnerVisibilityPickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">Who can see this listing?</p>
      <div className="grid gap-2">
        {OWNER_VISIBILITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-card border px-4 py-3 text-left transition-colors",
              value === opt.value
                ? "border-primary bg-primary-light"
                : "border-border bg-white hover:border-primary/30"
            )}
          >
            <p className="text-sm font-semibold text-foreground">{opt.label}</p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">{opt.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
