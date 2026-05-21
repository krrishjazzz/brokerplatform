"use client";

import Link from "next/link";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RequirementPromoStripProps = {
  variant?: "inline" | "sidebar" | "compact";
  onPostRequirement?: () => void;
};

export function RequirementPromoStrip({
  variant = "inline",
  onPostRequirement,
}: RequirementPromoStripProps) {
  const isSidebar = variant === "sidebar";
  const isCompact = variant === "compact";

  return (
    <div
      className={
        isSidebar
          ? "rounded-xl border border-dashed border-primary/25 bg-primary-light/30 p-4"
          : isCompact
            ? "rounded-xl border border-border bg-surface/80 px-4 py-3"
            : "rounded-2xl border border-primary/15 bg-gradient-to-r from-primary-light/50 to-white p-5 sm:p-6"
      }
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
          <MessageSquarePlus size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn("font-bold text-foreground", isCompact ? "text-sm" : "text-base")}>
            Not finding the right property?
          </p>
          <p className="mt-1 text-xs leading-5 text-text-secondary sm:text-sm">
            Tell KrrishJazz your requirement. We&apos;ll match verified options for you.
          </p>
          {onPostRequirement ? (
            <Button type="button" size="sm" className="mt-3" onClick={onPostRequirement}>
              Post requirement
            </Button>
          ) : (
            <Link href="/properties#post-requirement" className="mt-3 inline-block">
              <Button size="sm">Post requirement</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
