"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrokerPageShell({
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("min-h-screen bg-surface pb-24 lg:pb-8", className)}>
      <section className="border-b border-white/10 bg-primary-dark text-white">
        <div className="mx-auto max-w-7xl px-4 py-4 lg:px-6">
          <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-white/75">{subtitle}</p>}
          {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
        </div>
      </section>
      {children}
    </main>
  );
}

export function BrokerSearchToolbar({
  value,
  onChange,
  placeholder,
  onSubmit,
  filtersButton,
  trailing,
  quickFilters,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onSubmit?: () => void;
  filtersButton?: ReactNode;
  trailing?: ReactNode;
  quickFilters?: ReactNode;
}) {
  return (
    <section
      className="sticky z-20 border-b border-border bg-white shadow-sm"
      style={{ top: "var(--broker-header-height, 7rem)" }}
    >
      <div className="mx-auto max-w-7xl px-4 py-3 lg:px-6">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative min-h-11 flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
            <input
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") onSubmit?.();
              }}
              placeholder={placeholder}
              className="h-11 w-full rounded-btn border border-border bg-white pl-10 pr-3 text-sm outline-none placeholder:text-text-secondary focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2">
            {filtersButton}
            {trailing}
          </div>
        </div>
        {quickFilters && <div className="mt-2 flex flex-wrap gap-2">{quickFilters}</div>}
      </div>
    </section>
  );
}

export function BrokerMetricsStrip({ children }: { children: ReactNode }) {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl space-y-3 px-4 py-4 lg:px-6">{children}</div>
    </section>
  );
}

export function BrokerListLayout({
  sidebar,
  children,
  filtersOpen,
  onCloseFilters,
}: {
  sidebar: ReactNode;
  children: ReactNode;
  filtersOpen: boolean;
  onCloseFilters: () => void;
}) {
  return (
    <>
      {filtersOpen && (
        <div className="fixed inset-0 z-30 bg-foreground/35 backdrop-blur-[2px] lg:hidden" onClick={onCloseFilters} />
      )}
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 lg:flex-row lg:px-6">
        {sidebar}
        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </>
  );
}

export function BrokerFiltersSidebar({
  title,
  subtitle,
  filtersOpen,
  onClose,
  onClear,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  filtersOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <aside
      className={cn(
        "h-fit shrink-0 overflow-y-auto rounded-card border border-border bg-white p-4 shadow-card lg:sticky lg:w-72",
        filtersOpen
          ? "fixed inset-x-0 bottom-0 top-0 z-40 block rounded-none pb-28 pt-5 lg:static lg:rounded-card lg:pb-4 lg:pt-4"
          : "hidden lg:block",
        "lg:top-[calc(var(--broker-header-height,7rem)+1rem)]"
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-text-secondary">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onClear} className="text-xs font-semibold text-primary hover:text-accent">
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-btn border border-border p-2 text-text-secondary lg:hidden"
            aria-label="Close filters"
          >
            ×
          </button>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
      {footer}
    </aside>
  );
}
