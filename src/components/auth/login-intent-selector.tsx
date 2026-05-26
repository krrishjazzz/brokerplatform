"use client";

import { Briefcase, Home, HousePlus } from "lucide-react";
import { LOGIN_INTENT_OPTIONS, type LoginIntent } from "@/lib/login-intent";
import { cn } from "@/lib/utils";

const INTENT_ICONS: Record<LoginIntent, typeof Home> = {
  buyer: Home,
  owner: HousePlus,
  broker: Briefcase,
};

type LoginIntentSelectorProps = {
  value: LoginIntent;
  onChange: (intent: LoginIntent) => void;
  disabled?: boolean;
  className?: string;
};

export function LoginIntentSelector({
  value,
  onChange,
  disabled,
  className,
}: LoginIntentSelectorProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-1 rounded-xl border border-border bg-surface p-1",
        disabled && "pointer-events-none opacity-60",
        className
      )}
      role="tablist"
      aria-label="Sign in as"
    >
      {LOGIN_INTENT_OPTIONS.map((option) => {
        const Icon = INTENT_ICONS[option.id];
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-lg px-1.5 py-2 text-center transition-colors sm:px-2",
              active
                ? "bg-white text-primary shadow-sm ring-1 ring-border"
                : "text-text-secondary hover:bg-white/70 hover:text-foreground"
            )}
          >
            <Icon size={16} className="shrink-0" aria-hidden />
            <span className="text-[10px] font-semibold leading-tight sm:text-xs">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
