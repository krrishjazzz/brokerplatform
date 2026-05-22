import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  formatPlatformPhoneDisplay,
  normalizePlatformPhoneForTel,
} from "@/lib/platform";

type DashboardFooterProps = {
  /** Left padding to clear a fixed sidebar (e.g. lg:pl-64). Omit for in-column layouts. */
  sidebarOffset?: string;
};

export function DashboardFooter({ sidebarOffset = "lg:pl-64" }: DashboardFooterProps) {
  const phoneDisplay = formatPlatformPhoneDisplay();

  return (
    <footer className={cn("border-t border-border bg-white px-4 py-4", sidebarOffset)}>
      <p className="text-center text-xs text-text-secondary lg:text-left">
        <span className="font-semibold text-foreground">KrrishJazz Support</span>
        <span aria-hidden> · </span>
        <a
          href={`tel:${normalizePlatformPhoneForTel()}`}
          className="font-medium text-primary hover:underline"
        >
          {phoneDisplay}
        </a>
        <span aria-hidden> · </span>
        <Link href="/terms" className="hover:text-primary hover:underline">
          Terms
        </Link>
        <span aria-hidden> · </span>
        <Link href="/privacy" className="hover:text-primary hover:underline">
          Privacy
        </Link>
      </p>
    </footer>
  );
}
