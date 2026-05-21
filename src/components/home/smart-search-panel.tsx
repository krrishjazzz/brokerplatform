"use client";

import { IntentSearchPanel } from "@/components/search/intent-search-panel";

type SmartSearchPanelProps = {
  className?: string;
  variant?: "hero" | "default";
};

/** Homepage hero search — intent-based presets (99acres-style). */
export function SmartSearchPanel(props: SmartSearchPanelProps) {
  return <IntentSearchPanel {...props} />;
}
