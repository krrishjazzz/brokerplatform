"use client";

import { cn } from "@/lib/utils";

type PostingChipProps = {
  label: string;
  selected?: boolean;
  onClick: () => void;
  className?: string;
};

export function PostingChip({ label, selected, onClick, className }: PostingChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-[44px] rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors",
        selected
          ? "border-primary bg-primary text-white shadow-sm"
          : "border-border bg-white text-foreground hover:border-primary/50 hover:bg-primary-light/30",
        className
      )}
    >
      {label}
    </button>
  );
}
