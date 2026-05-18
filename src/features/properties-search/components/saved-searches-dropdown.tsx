"use client";

import { Trash2 } from "lucide-react";
import type { SavedSearch } from "@/features/properties-search/types";

type SavedSearchesDropdownProps = {
  items: SavedSearch[];
  onApply: (item: SavedSearch) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

export function SavedSearchesDropdown({ items, onApply, onDelete, onClose }: SavedSearchesDropdownProps) {
  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} aria-hidden />
      <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-72 overflow-hidden rounded-card border border-border bg-white shadow-modal">
        <div className="border-b border-border px-3 py-2">
          <p className="text-sm font-semibold text-foreground">Saved Searches</p>
          <p className="text-[11px] text-text-secondary">Quickly reload your filter combos.</p>
        </div>
        {items.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs text-text-secondary">
            No saved searches yet. Tap <span className="font-semibold text-primary">Save Search</span> to add one.
          </div>
        ) : (
          <ul className="max-h-72 overflow-y-auto py-1">
            {items.map((item) => (
              <li key={item.id} className="group flex items-center gap-2 px-2 py-1.5 hover:bg-surface">
                <button
                  type="button"
                  onClick={() => onApply(item)}
                  className="min-w-0 flex-1 rounded-btn px-2 py-1 text-left text-xs"
                >
                  <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-[11px] text-text-secondary">
                    {new Date(item.savedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="rounded-btn p-1.5 text-text-secondary hover:text-error"
                  aria-label="Delete saved search"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
