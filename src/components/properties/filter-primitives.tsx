"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase text-text-secondary">{label}</p>
      {children}
    </div>
  );
}

export function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-pill border px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "border-primary bg-primary text-white" : "border-border bg-surface text-text-secondary hover:border-primary/40 hover:text-primary"
      )}
    >
      {children}
    </button>
  );
}
