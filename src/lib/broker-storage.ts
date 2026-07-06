const TIPS_VISIT_PREFIX = "krrishjazz:broker-tips-visits:";
const FILTER_PRESETS_KEY = "krrishjazz:broker-filter-presets";
const RECENT_SEARCHES_KEY = "krrishjazz:broker-recent-searches";

export type BrokerFilterPreset = {
  id: string;
  label: string;
  filters: Record<string, string>;
};

export function shouldShowWorkflowTips(pageKey: string, maxVisits = 3): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(`krrishjazz:broker-${pageKey}-tips-dismissed`) === "1") return false;
    const visits = Number(localStorage.getItem(`${TIPS_VISIT_PREFIX}${pageKey}`) || "0");
    return visits < maxVisits;
  } catch {
    return true;
  }
}

export function recordWorkflowTipsVisit(pageKey: string) {
  try {
    const key = `${TIPS_VISIT_PREFIX}${pageKey}`;
    const visits = Number(localStorage.getItem(key) || "0") + 1;
    localStorage.setItem(key, String(visits));
  } catch {
    // ignore
  }
}

export function dismissWorkflowTips(pageKey: string) {
  try {
    localStorage.setItem(`krrishjazz:broker-${pageKey}-tips-dismissed`, "1");
  } catch {
    // ignore
  }
}

export function loadFilterPresets(): BrokerFilterPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FILTER_PRESETS_KEY);
    return raw ? (JSON.parse(raw) as BrokerFilterPreset[]) : [];
  } catch {
    return [];
  }
}

export function saveFilterPreset(preset: BrokerFilterPreset) {
  try {
    const existing = loadFilterPresets().filter((item) => item.id !== preset.id);
    localStorage.setItem(FILTER_PRESETS_KEY, JSON.stringify([preset, ...existing].slice(0, 8)));
  } catch {
    // ignore
  }
}

export function loadRecentSearches(scope: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${RECENT_SEARCHES_KEY}:${scope}`);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(scope: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;
  try {
    const next = [trimmed, ...loadRecentSearches(scope).filter((item) => item !== trimmed)].slice(0, 6);
    localStorage.setItem(`${RECENT_SEARCHES_KEY}:${scope}`, JSON.stringify(next));
  } catch {
    // ignore
  }
}
