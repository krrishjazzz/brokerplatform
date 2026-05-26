"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  buildIntentSearchParams,
  getSearchPreset,
  parseIntentSearchFromUrl,
  type FilterPillId,
  type IntentSearchFilters,
  type SearchPresetId,
} from "@/lib/search-intent-config";
import { PropertySearchBarRow } from "@/components/search/property-search-bar-row";
import {
  EMPTY_INTENT_FILTERS,
  PropertySearchFiltersStrip,
} from "@/components/search/property-search-filters-strip";
import { UserAccountMenu } from "@/components/account/user-account-menu";
import { useAuth } from "@/lib/auth-context";
import { profileCanList } from "@/lib/capabilities";
import { deriveWorkspaceCapabilities, persistLastWorkspace, type WorkspaceMode } from "@/lib/workspace";
import { getAppHomeHref, OWNER_DASHBOARD_PATH } from "@/lib/dashboard-paths";

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
  logoHref,
  workspaceMode = "buyer",
  hideOwnerDashboardLink = false,
  trailingActions,
}: SearchWorkspaceHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const headerRef = useRef<HTMLElement>(null);

  const resolvedLogoHref =
    logoHref ?? (user ? getAppHomeHref(profileCanList(user)) : "/");

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
    return () => document.removeEventListener("keydown", onEscape);
  }, [expanded, closeExpanded]);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 overflow-visible">
      {expanded && (
        <button
          type="button"
          className="fixed inset-0 top-14 z-40 bg-foreground/40 backdrop-blur-[1px]"
          aria-label="Close search filters"
          onClick={closeExpanded}
        />
      )}

      <div className="relative overflow-visible">
        <div className="relative z-50 overflow-visible bg-primary-dark shadow-[0_4px_20px_rgba(0,31,77,0.22)]">
          <div className="relative mx-auto max-w-7xl overflow-visible px-4 lg:px-6">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 overflow-visible sm:gap-x-4">
              <Link
                href={resolvedLogoHref}
                className="relative z-10 flex h-14 shrink-0 items-center text-lg font-bold tracking-tight text-white sm:text-xl"
              >
                KrrishJazz
              </Link>

              <div className="relative z-20 col-start-2 min-w-0 overflow-visible py-1.5">
                <PropertySearchBarRow
                  filters={draftFilters}
                  layout="navbar"
                  presetOpen={expanded ? false : presetOpen}
                  cityOpen={expanded ? false : cityOpen}
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
                    setPresetOpen(false);
                    setCityOpen(false);
                    setExpanded(true);
                    setActivePill((c) => c ?? visiblePills[0] ?? null);
                  }}
                  className="w-full"
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
            </div>
          </div>
        </div>

        {expanded && (
          <div className="absolute left-0 right-0 top-full z-[80] border-b border-border bg-white text-foreground shadow-[0_16px_48px_rgba(0,31,77,0.18)]">
            <div className="mx-auto max-w-7xl px-4 lg:px-6">
              <PropertySearchBarRow
                filters={draftFilters}
                layout="full"
                presetOpen={presetOpen}
                cityOpen={cityOpen}
                onPresetOpenChange={setPresetOpen}
                onCityOpenChange={setCityOpen}
                onUpdateFilters={(patch) => setDraftFilters((prev) => ({ ...prev, ...patch }))}
                onSwitchPreset={(preset: SearchPresetId) => {
                  setDraftFilters((prev) => ({
                    ...EMPTY_INTENT_FILTERS(),
                    preset,
                    city: prev.city,
                    query: prev.query,
                  }));
                  setActivePill(null);
                  setPresetOpen(false);
                }}
                onRunSearch={() => applySearch(draftFilters)}
                hideInlineSearch
                className="rounded-none border-0 shadow-none"
              />

              <div className="border-t border-border/80 py-4">
                <PropertySearchFiltersStrip
                  filters={draftFilters}
                  activePill={activePill}
                  onActivePillChange={setActivePill}
                  onUpdateFilters={(patch) => setDraftFilters((prev) => ({ ...prev, ...patch }))}
                  onSwitchPreset={(preset) =>
                    setDraftFilters((prev) => ({
                      ...EMPTY_INTENT_FILTERS(),
                      preset,
                      city: prev.city,
                      query: prev.query,
                    }))
                  }
                  onClearAll={() =>
                    setDraftFilters({
                      ...EMPTY_INTENT_FILTERS(),
                      city: draftFilters.city,
                      query: draftFilters.query,
                    })
                  }
                  showFooter
                  onSearch={() => applySearch(draftFilters)}
                  onCancel={closeExpanded}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
