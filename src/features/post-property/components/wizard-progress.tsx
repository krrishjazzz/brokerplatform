import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { POST_PROPERTY_STEPS } from "@/features/post-property/constants";

export function WizardProgress({ step }: { step: number }) {
  const steps = [...POST_PROPERTY_STEPS];
  const current = steps[step];

  return (
    <div className="mb-4 rounded-card border border-border bg-white px-3 py-3 shadow-card sm:mb-6 sm:p-4">
      <div className="flex items-center justify-between gap-2 sm:hidden">
        <p className="text-xs font-medium text-text-secondary">
          Step {step + 1} of {steps.length}
        </p>
        <p className="text-sm font-semibold text-primary">{current}</p>
      </div>
      <div className="hidden items-center justify-between sm:flex">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                  i < step
                    ? "bg-primary text-white"
                    : i === step
                    ? "bg-primary text-white ring-2 ring-primary/25"
                    : "border border-border bg-surface text-text-secondary"
                )}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span
                className={cn(
                  "mt-1 max-w-[5.5rem] text-center text-[10px] leading-tight",
                  i === step ? "font-semibold text-primary" : "text-text-secondary"
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("mx-1 h-px flex-1", i < step ? "bg-primary" : "bg-border")} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
