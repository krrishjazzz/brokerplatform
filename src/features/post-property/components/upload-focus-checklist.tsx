import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function UploadFocusChecklist({ selectedType, items }: { selectedType?: string; items: string[] }) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {selectedType ? `${selectedType} upload checklist` : "Upload checklist"}
          </p>
          <p className="text-xs leading-5 text-text-secondary">
            KrrishJazz uses these signals to verify, match, and coordinate faster.
          </p>
        </div>
        <Badge variant={selectedType ? "success" : "warning"}>{selectedType ? "Type selected" : "Pick type"}</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 rounded-pill border border-primary/15 bg-white px-3 py-1 text-xs font-semibold text-primary"
          >
            <Check size={12} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
