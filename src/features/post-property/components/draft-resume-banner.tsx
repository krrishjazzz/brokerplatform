"use client";

import { CloudOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/features/post-property/utils/format-relative-time";
import type { PostPropertyDraftPayload } from "@/features/post-property/types";

type DraftResumeBannerProps = {
  draft: PostPropertyDraftPayload;
  onResume: () => void;
  onDiscard: () => void;
};

export function DraftResumeBanner({ draft, onResume, onDiscard }: DraftResumeBannerProps) {
  return (
    <div className="mb-6 rounded-card border border-primary/25 bg-primary-light p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Resume your draft?</p>
          <p className="mt-1 text-xs text-text-secondary">
            We saved your last property draft {formatRelativeTime(draft.savedAt)}. Continue or start fresh.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onDiscard}>
            <CloudOff size={14} className="mr-1.5" />
            Discard
          </Button>
          <Button size="sm" onClick={onResume}>
            <RotateCcw size={14} className="mr-1.5" />
            Resume
          </Button>
        </div>
      </div>
    </div>
  );
}
