"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { persistLastWorkspace } from "@/lib/workspace";
import { MarketplaceSearchOverlay } from "@/components/workspace/marketplace-search-overlay";

type BrowsePropertiesButtonProps = {
  variant?: "header" | "outline";
  useOverlay?: boolean;
  className?: string;
};

export function BrowsePropertiesButton({
  variant = "header",
  useOverlay = true,
  className,
}: BrowsePropertiesButtonProps) {
  const router = useRouter();
  const [overlayOpen, setOverlayOpen] = useState(false);

  const handleClick = () => {
    if (useOverlay) {
      setOverlayOpen(true);
      return;
    }
    persistLastWorkspace("buyer");
    router.push("/properties");
  };

  const buttonClass =
    variant === "header"
      ? "hidden items-center gap-1.5 rounded-lg border border-white/25 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:inline-flex"
      : "inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:border-primary/30 hover:text-primary";

  return (
    <>
      <button type="button" onClick={handleClick} className={cn(buttonClass, className)}>
        <Search size={16} />
        Browse Properties
      </button>
      {useOverlay && (
        <MarketplaceSearchOverlay open={overlayOpen} onClose={() => setOverlayOpen(false)} />
      )}
    </>
  );
}
