"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MetricTone = "default" | "success" | "accent" | "warning" | "primary";

export function MetricCard({ label, value, tone }: { label: string; value: number; tone: MetricTone }) {
  const toneClass = {
    default: "border-border bg-surface text-foreground",
    success: "border-success/20 bg-success/10 text-success",
    accent: "border-accent/20 bg-accent/10 text-accent",
    warning: "border-warning/20 bg-warning/10 text-warning",
    primary: "border-primary/20 bg-primary-light text-primary",
  }[tone];

  return (
    <div className={cn("rounded-card border px-4 py-3", toneClass)}>
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

export function BrokerWorkflowCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-card border border-white/15 bg-white p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">{text}</p>
        </div>
      </div>
    </div>
  );
}

export function FilterBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase text-text-secondary">{label}</p>
      {children}
    </div>
  );
}

export function ChipButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-pill border px-3 py-1.5 text-xs font-semibold transition-colors",
        active ? "border-primary bg-primary text-white" : "border-border bg-surface text-text-secondary hover:border-primary hover:text-primary"
      )}
    >
      {children}
    </button>
  );
}

export function MatchSignal({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card border border-border bg-surface p-3">
      <p className="truncate text-sm font-semibold text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-text-secondary">{label}</p>
    </div>
  );
}

export function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-btn border border-border bg-white px-3 py-2">
      <p className="truncate text-sm font-semibold text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-text-secondary">{label}</p>
    </div>
  );
}

export function InfoTile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("rounded-btn border px-3 py-2", highlight ? "border-accent/20 bg-accent/10" : "border-border bg-surface")}>
      <p className={cn("text-sm font-semibold", highlight ? "text-accent" : "text-foreground")}>{value}</p>
      <p className="mt-0.5 text-xs text-text-secondary">{label}</p>
    </div>
  );
}
