"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
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
  /** Allow multiple localities (Salt Lake + New Town). */
  multiSelect?: boolean;
  selectedLocations?: LocationSuggestion[];
  onSelectedLocationsChange?: (items: LocationSuggestion[]) => void;
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
  placeholder = "Search city, locality, project, or landmark",
  className,
  inputClassName,
  onKeyDown,
  onFocus,
  onClick,
  multiSelect = false,
  selectedLocations = [],
  onSelectedLocationsChange,
}: LocationSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [draftValue, setDraftValue] = useState(value);
  const [groups, setGroups] = useState<LocationSuggestionGroups>(EMPTY_GROUPS);
  const [popular, setPopular] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [anchor, setAnchor] = useState<{ top: number; left: number; width: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  const syncAnchor = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setAnchor({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 240) });
  }, []);

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

  const fetchPopular = useCallback(async () => {
    try {
      const res = await fetch(`/api/locations/popular?city=${encodeURIComponent(city)}&limit=8`);
      if (res.ok) {
        const data = await res.json();
        setPopular(data.locations || []);
      }
    } catch {
      setPopular([]);
    }
  }, [city]);

  useEffect(() => {
    if (!open) return;
    void fetchPopular();
    const t = setTimeout(() => fetchSuggestions(draftValue), 200);
    return () => clearTimeout(t);
  }, [draftValue, open, fetchSuggestions, fetchPopular]);

  useEffect(() => {
    if (!open) {
      setAnchor(null);
      return;
    }
    syncAnchor();
    window.addEventListener("resize", syncAnchor);
    window.addEventListener("scroll", syncAnchor, true);
    return () => {
      window.removeEventListener("resize", syncAnchor);
      window.removeEventListener("scroll", syncAnchor, true);
    };
  }, [open, syncAnchor]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (s: LocationSuggestion) => {
    if (multiSelect && onSelectedLocationsChange) {
      if (!selectedLocations.some((x) => x.id === s.id)) {
        onSelectedLocationsChange([...selectedLocations, s]);
      }
      onChange("");
      setDraftValue("");
      onSelectSuggestion(null);
    } else {
      setDraftValue(s.label);
      onChange(s.label);
      onSelectSuggestion(s);
      setOpen(false);
    }
  };

  const removeSelected = (id: string) => {
    onSelectedLocationsChange?.(selectedLocations.filter((s) => s.id !== id));
  };

  const hasResults =
    groups.localities.length +
      groups.subLocalities.length +
      groups.projects.length +
      groups.landmarks.length >
    0;

  const showPopular = open && !draftValue.trim() && popular.length > 0;

  const suggestionsPanel =
    open && anchor ? (
      <div
        ref={dropdownRef}
        role="listbox"
        style={{ position: "fixed", top: anchor.top, left: anchor.left, width: anchor.width }}
        className="z-[300] max-h-80 overflow-y-auto rounded-xl border border-border bg-white py-1 shadow-[0_12px_40px_rgba(0,31,77,0.15)]"
      >
        {loading && <p className="px-3 py-2 text-xs text-text-secondary">Searching…</p>}

        {showPopular && (
          <div className="border-b border-border px-3 py-2">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-text-secondary">Popular</p>
            <div className="flex flex-wrap gap-1.5">
              {popular.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(item);
                  }}
                  className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-foreground hover:border-primary/40 hover:text-primary"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasResults ? (
          <>
            <SuggestionGroup title="Localities" items={groups.localities} onPick={pick} />
            <SuggestionGroup title="Sub-localities" items={groups.subLocalities} onPick={pick} />
            <SuggestionGroup title="Projects" items={groups.projects} onPick={pick} />
            <SuggestionGroup title="Landmarks" items={groups.landmarks} onPick={pick} />
          </>
        ) : (
          !loading &&
          !showPopular && (
            <p className="px-3 py-3 text-xs text-text-secondary">Try a locality, project, or landmark name.</p>
          )
        )}
      </div>
    ) : null;

  return (
    <div
      ref={wrapRef}
      data-search-input
      className={cn("relative min-w-0 flex-1", className)}
    >
      {multiSelect && selectedLocations.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selectedLocations.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary"
            >
              {s.label}
              <button
                type="button"
                onClick={() => removeSelected(s.id)}
                className="rounded-full p-0.5 hover:bg-primary/10"
                aria-label={`Remove ${s.label}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative min-w-0 flex-1">
        <input
          ref={inputRef}
          type="text"
          value={draftValue}
          onChange={(e) => {
            const next = e.target.value;
            setDraftValue(next);
            onChange(next);
            if (!multiSelect) onSelectSuggestion(null);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            syncAnchor();
            onFocus?.();
          }}
          onClick={() => {
            setOpen(true);
            syncAnchor();
            onClick?.();
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={cn(
            "relative z-10 min-w-0 w-full bg-transparent font-medium outline-none placeholder:text-text-secondary",
            inputClassName
          )}
          aria-label="Search locality, project, society, or landmark"
          autoComplete="off"
          enterKeyHint="search"
        />
      </div>
      {typeof document !== "undefined" && suggestionsPanel
        ? createPortal(suggestionsPanel, document.body)
        : null}
    </div>
  );
}
