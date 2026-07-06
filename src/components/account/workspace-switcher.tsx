"use client";

import type { LucideIcon } from "lucide-react";
import { Briefcase, Home, HousePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  persistLastWorkspace,
  type WorkspaceMode,
  type WorkspaceSwitcherOption,
} from "@/lib/workspace";
import { cn } from "@/lib/utils";

const WORKSPACE_ICONS: Record<WorkspaceSwitcherOption["mode"], LucideIcon> = {
  buyer: Home,
  owner: HousePlus,
  broker: Briefcase,
};

type WorkspaceSwitcherProps = {
  options: WorkspaceSwitcherOption[];
  activeMode: WorkspaceMode;
  variant?: "menu" | "header";
  onNavigate?: () => void;
  className?: string;
};

export function WorkspaceSwitcher({
  options,
  activeMode,
  variant = "menu",
  onNavigate,
  className,
}: WorkspaceSwitcherProps) {
  const router = useRouter();

  if (options.length <= 1) return null;

  const isHeader = variant === "header";
  const gridCols =
    options.length === 2 ? "grid-cols-2" : "grid-cols-3";

  const handleSelect = (option: WorkspaceSwitcherOption) => {
    if (option.mode === activeMode) return;
    persistLastWorkspace(option.mode);
    onNavigate?.();
    router.push(option.href);
  };

  return (
    <div className={className}>
      <p
        className={cn(
          "mb-2 text-[11px] font-semibold uppercase tracking-wide",
          isHeader ? "sr-only" : "text-text-secondary"
        )}
      >
        Switch workspace
      </p>
      <div
        className={cn(
          "grid gap-1 rounded-xl p-1",
          gridCols,
          isHeader
            ? "border border-white/20 bg-white/10"
            : "border border-border bg-surface"
        )}
        role="tablist"
        aria-label="Switch workspace"
      >
        {options.map((option) => {
          const Icon = WORKSPACE_ICONS[option.mode];
          const active = activeMode === option.mode;
          const label = isHeader ? option.shortLabel : option.label;

          return (
            <button
              key={option.mode}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleSelect(option)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-center transition-colors sm:px-1.5",
                isHeader
                  ? active
                    ? "bg-white text-primary shadow-sm"
                    : "text-white/85 hover:bg-white/15 hover:text-white"
                  : active
                    ? "bg-white text-primary shadow-sm ring-1 ring-border"
                    : "text-text-secondary hover:bg-white/70 hover:text-foreground"
              )}
            >
              <Icon size={isHeader ? 14 : 16} className="shrink-0" aria-hidden />
              <span
                className={cn(
                  "font-semibold leading-tight",
                  isHeader ? "text-[10px] sm:text-[11px]" : "text-[10px] sm:text-xs"
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
