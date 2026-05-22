"use client";

import Link from "next/link";
import { formatPlatformPhoneDisplay, normalizePlatformPhoneForTel } from "@/lib/platform";

const linkClass =
  "text-sm text-text-secondary transition-colors hover:text-primary";

export function Footer() {
  const year = new Date().getFullYear();
  const phoneDisplay = formatPlatformPhoneDisplay();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="text-lg font-bold text-foreground">
              KrrishJazz
            </Link>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Search verified listings. Owners post free. Brokerage only after a successful closure.
            </p>
          </div>

          <nav
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium"
            aria-label="Footer navigation"
          >
            <Link href="/properties?listingType=BUY" className={linkClass}>
              Buy
            </Link>
            <Link href="/properties?listingType=RENT" className={linkClass}>
              Rent
            </Link>
            <Link href="/properties?category=COMMERCIAL" className={linkClass}>
              Commercial
            </Link>
            <Link href="/owners" className={linkClass}>
              Owners
            </Link>
            <Link href="/brokers" className={linkClass}>
              Brokers
            </Link>
            <a href={`tel:${normalizePlatformPhoneForTel()}`} className={linkClass}>
              Support
            </a>
            <Link href="/privacy" className={linkClass}>
              Privacy
            </Link>
            <Link href="/terms" className={linkClass}>
              Terms
            </Link>
          </nav>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-border pt-5 text-xs text-text-secondary sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-1">
          <p>Salt Lake, Sector V, Kolkata, West Bengal 700091</p>
          <p>
            <a href={`tel:${normalizePlatformPhoneForTel()}`} className="hover:text-primary">
              {phoneDisplay}
            </a>
            <span aria-hidden> · </span>
            <a href="mailto:support@krrishjazz.com" className="hover:text-primary">
              support@krrishjazz.com
            </a>
          </p>
          <p className="text-text-tertiary">&copy; {year} KrrishJazz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
