"use client";

import { useRef } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  getPresetMenuLabel,
  SEARCH_PRESET_GROUPS,
  type SearchPresetId,
} from "@/lib/search-intent-config";
import { cn } from "@/lib/utils";

type PropertySearchIntentMenuProps = {
  preset: SearchPresetId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (preset: SearchPresetId) => void;
  /** compact = white bar in navbar; default = full panel */
  tone?: "default" | "compact";
  className?: string;
};

export function PropertySearchIntentMenu({
  preset,
  open,
  onOpenChange,
  onSelect,
  tone = "default",
  className,
}: PropertySearchIntentMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  const triggerClass =
    tone === "compact"
      ? "flex h-full min-w-[4.75rem] shrink-0 items-center gap-1 border-r border-border/80 px-3.5 text-left text-sm font-bold text-primary hover:bg-surface/80 sm:min-w-[5.25rem] sm:px-4"
      : "flex h-full w-full items-center gap-1.5 px-4 py-3.5 text-left text-sm font-bold text-primary hover:bg-surface";

  return (
    <div ref={menuRef} data-search-intent className={cn("relative z-20", className)}>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={triggerClass}
      >
        <span className="min-w-0 truncate">{getPresetMenuLabel(preset)}</span>
        <ChevronDown size={14} className={cn("ml-auto shrink-0", open && "rotate-180")} />
      </button>
      {open && (
        <div
          role="listbox"
          data-search-intent-menu
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute left-0 top-full z-[70] min-w-[16rem] rounded-lg border border-border bg-white py-2 shadow-[0_12px_40px_rgba(0,31,77,0.15)]"
        >
          {SEARCH_PRESET_GROUPS.map((group) => (
            <div key={group.label} className="px-2 py-1">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                {group.label}
              </p>
              {group.items.map((item) => {
                const active = preset === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelect(item.id);
                      onOpenChange(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold",
                      active ? "bg-primary-light text-primary" : "text-foreground hover:bg-surface"
                    )}
                  >
                    {active ? (
                      <Check size={14} className="shrink-0" />
                    ) : (
                      <span className="w-[14px] shrink-0" aria-hidden />
                    )}
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
