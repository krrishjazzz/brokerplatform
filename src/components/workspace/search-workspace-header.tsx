"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  buildIntentSearchParams,
  DEFAULT_SEARCH_PRESET,
  getSearchPreset,
  parseIntentSearchFromUrl,
  type FilterPillId,
  type IntentSearchFilters,
  type SearchPresetId,
} from "@/lib/search-intent-config";
import { PropertySearchBarRow } from "@/components/search/property-search-bar-row";
import {
  FilterPillButton,
  filterPillLabel,
  PropertySearchFilterPanels,
} from "@/components/search/property-search-filter-panels";
import { UserAccountMenu } from "@/components/account/user-account-menu";
import { useAuth } from "@/lib/auth-context";
import { deriveWorkspaceCapabilities, persistLastWorkspace, type WorkspaceMode } from "@/lib/workspace";
import { OWNER_DASHBOARD_PATH } from "@/lib/dashboard-paths";
import { cn } from "@/lib/utils";

export type SearchWorkspaceHeaderProps = {
  /** Logo target — defaults to marketplace search. */
  logoHref?: string;
  workspaceMode?: WorkspaceMode;
  /** Hide when already on owner dashboard. */
  hideOwnerDashboardLink?: boolean;
  /** Shown before profile menu (e.g. Post Property on owner dashboard). */
  trailingActions?: ReactNode;
};

export function SearchWorkspaceHeader({
  logoHref = "/properties",
  workspaceMode = "buyer",
  hideOwnerDashboardLink = false,
  trailingActions,
}: SearchWorkspaceHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const headerRef = useRef<HTMLElement>(null);

  const caps = user
    ? deriveWorkspaceCapabilities({
        role: user.role,
        brokerStatus: user.brokerStatus,
        canList: user.canList,
        ownerStatus: user.ownerStatus,
        hasBrokerApplication: user.hasBrokerApplication,
      })
    : null;

  const [draftFilters, setDraftFilters] = useState<IntentSearchFilters>(() =>
    parseIntentSearchFromUrl(searchParams)
  );
  const [presetOpen, setPresetOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [activePill, setActivePill] = useState<FilterPillId | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setDraftFilters(parseIntentSearchFromUrl(searchParams));
  }, [searchParams]);

  useEffect(() => {
    if (workspaceMode === "owner") persistLastWorkspace("owner");
    else if (workspaceMode === "buyer") persistLastWorkspace("buyer");
  }, [workspaceMode]);

  const presetConfig = useMemo(() => getSearchPreset(draftFilters.preset), [draftFilters.preset]);
  const visiblePills = presetConfig.filterPills.filter(
    (id) => id !== "postedBy" && id !== "area" && id !== "lockIn" && id !== "developer"
  );

  const applySearch = useCallback(
    (filters: IntentSearchFilters) => {
      router.push(`/properties?${buildIntentSearchParams(filters).toString()}`);
      setExpanded(false);
      setActivePill(null);
      setPresetOpen(false);
      setCityOpen(false);
    },
    [router]
  );

  const closeExpanded = useCallback(() => {
    setExpanded(false);
    setActivePill(null);
    setPresetOpen(false);
    setCityOpen(false);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeExpanded();
    };
    document.addEventListener("keydown", onEscape);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = prev;
    };
  }, [expanded, closeExpanded]);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 overflow-visible">
      {expanded && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-[1px]"
          aria-label="Close search filters"
          onClick={closeExpanded}
        />
      )}

      <div className="relative z-50 overflow-visible bg-primary-dark shadow-[0_4px_20px_rgba(0,31,77,0.22)]">
        <div className="relative mx-auto max-w-7xl overflow-visible px-4 lg:px-6">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 overflow-visible sm:gap-x-4">
            <Link
              href={logoHref}
              className="relative z-10 flex h-14 shrink-0 items-center text-lg font-bold tracking-tight text-white sm:text-xl"
            >
              KrrishJazz
            </Link>

            <div className="relative z-20 col-start-2 min-w-0 overflow-visible py-1.5">
              <PropertySearchBarRow
                filters={draftFilters}
                layout="navbar"
                presetOpen={presetOpen}
                cityOpen={cityOpen}
                onPresetOpenChange={setPresetOpen}
                onCityOpenChange={setCityOpen}
                onUpdateFilters={(patch) => setDraftFilters((prev) => ({ ...prev, ...patch }))}
                onSwitchPreset={(preset: SearchPresetId) => {
                  setDraftFilters((prev) => ({
                    preset,
                    city: prev.city,
                    query: prev.query,
                    propertyTypeIds: [],
                    budget: "",
                    bedrooms: "",
                    furnishing: "",
                    constructionStatus: "",
                    possession: "",
                    availableFrom: "",
                    area: "",
                    lockIn: "",
                    projectCategory: "",
                  }));
                  setActivePill(null);
                  setPresetOpen(false);
                }}
                onRunSearch={() => applySearch(draftFilters)}
                onOpenOverlay={() => {
                  setExpanded(true);
                  setActivePill((c) => c ?? visiblePills[0] ?? null);
                }}
                hideTrailingSearch={expanded}
                className={cn("w-full", expanded && "rounded-b-none border-b-0 shadow-none")}
              />
            </div>

            <div className="relative z-10 flex h-14 shrink-0 items-center gap-2">
              {caps?.canList && !hideOwnerDashboardLink && (
                <Link
                  href={OWNER_DASHBOARD_PATH}
                  className="hidden rounded-lg border border-white/25 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/10 sm:inline-block lg:text-sm"
                >
                  Owner Dashboard
                </Link>
              )}
              {trailingActions}
              <UserAccountMenu
                tone="dark"
                workspaceMode={workspaceMode === "owner" ? "owner" : "buyer"}
              />
            </div>

            {expanded && (
              <div
                className={cn(
                  "relative z-10 col-start-2 row-start-2 -mt-px overflow-hidden rounded-b-xl border border-border",
                  "bg-white text-foreground shadow-[0_12px_40px_rgba(0,31,77,0.12)]"
                )}
              >
                <div className="px-4 py-4 sm:px-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-foreground">Filters</p>
                    <button
                      type="button"
                      onClick={() =>
                        setDraftFilters({
                          preset: DEFAULT_SEARCH_PRESET,
                          city: "Kolkata",
                          query: "",
                          propertyTypeIds: [],
                          budget: "",
                          bedrooms: "",
                          furnishing: "",
                          constructionStatus: "",
                          possession: "",
                          availableFrom: "",
                          area: "",
                          lockIn: "",
                          projectCategory: "",
                        })
                      }
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {visiblePills.map((pillId) => (
                      <FilterPillButton
                        key={pillId}
                        label={filterPillLabel(pillId, draftFilters, draftFilters.preset)}
                        active={activePill === pillId}
                        onClick={() => setActivePill((c) => (c === pillId ? null : pillId))}
                      />
                    ))}
                  </div>
                  {activePill && (
                    <div className="mt-4">
                      <PropertySearchFilterPanels
                        activePill={activePill}
                        filters={draftFilters}
                        onUpdateFilters={(patch) => setDraftFilters((prev) => ({ ...prev, ...patch }))}
                        onSwitchPreset={(preset) =>
                          setDraftFilters((prev) => ({
                            preset,
                            city: prev.city,
                            query: prev.query,
                            propertyTypeIds: [],
                            budget: "",
                            bedrooms: "",
                            furnishing: "",
                            constructionStatus: "",
                            possession: "",
                            availableFrom: "",
                            area: "",
                            lockIn: "",
                            projectCategory: "",
                          }))
                        }
                      />
                    </div>
                  )}
                  <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                    <button
                      type="button"
                      onClick={() => applySearch(draftFilters)}
                      className="rounded-md bg-primary px-8 py-2.5 text-sm font-bold text-white hover:bg-primary-dark"
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      onClick={closeExpanded}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
