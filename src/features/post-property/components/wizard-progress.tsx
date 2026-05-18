import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { POST_PROPERTY_STEPS } from "@/features/post-property/constants";

export function WizardProgress({ step }: { step: number }) {
  const steps = [...POST_PROPERTY_STEPS];

  return (
    <div className="mb-6 rounded-card border border-border bg-white p-6 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  i < step
                    ? "bg-primary text-white"
                    : i === step
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : "border border-border bg-surface text-text-secondary"
                )}
              >
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              <span className="mt-1 hidden text-xs text-text-secondary sm:block">{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("mx-1 h-0.5 w-8 sm:w-16", i < step ? "bg-primary" : "bg-border")} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
