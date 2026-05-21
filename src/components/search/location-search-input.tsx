"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LocationSuggestion, LocationSuggestionGroups } from "@/lib/location/types";
import { cn } from "@/lib/utils";

const EMPTY_GROUPS: LocationSuggestionGroups = {
  localities: [],
  subLocalities: [],
  projects: [],
  landmarks: [],
};

type LocationSearchInputProps = {
  value: string;
  city: string;
  onChange: (value: string) => void;
  onSelectSuggestion: (suggestion: LocationSuggestion | null) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onClick?: () => void;
};

function SuggestionGroup({
  title,
  items,
  onPick,
}: {
  title: string;
  items: LocationSuggestion[];
  onPick: (s: LocationSuggestion) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="py-1">
      <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-text-secondary">{title}</p>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="flex w-full flex-col px-3 py-2 text-left hover:bg-primary-light"
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(item);
          }}
        >
          <span className="text-sm font-semibold text-foreground">{item.label}</span>
          <span className="text-xs text-text-secondary">{item.subtitle}</span>
        </button>
      ))}
    </div>
  );
}

export function LocationSearchInput({
  value,
  city,
  onChange,
  onSelectSuggestion,
  placeholder = "Search locality, project, society, landmark",
  className,
  inputClassName,
  onKeyDown,
  onFocus,
  onClick,
}: LocationSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<LocationSuggestionGroups>(EMPTY_GROUPS);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(
    async (q: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ city, q });
        const res = await fetch(`/api/locations/suggest?${params}`);
        if (res.ok) {
          const data = await res.json();
          setGroups(data.groups || EMPTY_GROUPS);
        }
      } finally {
        setLoading(false);
      }
    },
    [city]
  );

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => fetchSuggestions(value), 200);
    return () => clearTimeout(t);
  }, [value, open, fetchSuggestions]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (s: LocationSuggestion) => {
    onChange(s.label);
    onSelectSuggestion(s);
    setOpen(false);
  };

  const hasResults =
    groups.localities.length +
      groups.subLocalities.length +
      groups.projects.length +
      groups.landmarks.length >
    0;

  return (
    <div ref={wrapRef} className={cn("relative min-w-0 flex-1", className)}>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          onSelectSuggestion(null);
        }}
        onFocus={() => {
          setOpen(true);
          onFocus?.();
        }}
        onClick={onClick}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={cn(
          "min-w-0 w-full bg-transparent font-medium outline-none placeholder:text-text-secondary",
          inputClassName
        )}
        aria-label="Search locality, project, society, or landmark"
        autoComplete="off"
      />
      {open && (hasResults || loading) && (
        <div className="absolute left-0 right-0 top-full z-[60] mt-1 max-h-72 overflow-y-auto rounded-xl border border-border bg-white py-1 shadow-[0_12px_40px_rgba(0,31,77,0.15)]">
          {loading && <p className="px-3 py-2 text-xs text-text-secondary">Searching…</p>}
          <SuggestionGroup title="Localities" items={groups.localities} onPick={pick} />
          <SuggestionGroup title="Sub-localities" items={groups.subLocalities} onPick={pick} />
          <SuggestionGroup title="Projects" items={groups.projects} onPick={pick} />
          <SuggestionGroup title="Landmarks" items={groups.landmarks} onPick={pick} />
        </div>
      )}
    </div>
  );
}
