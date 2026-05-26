"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLoginPopup } from "@/lib/login-popup-context";
import { usePropertySearchNavbar } from "@/lib/property-search-navbar-context";
import { UserAccountMenu } from "@/components/account/user-account-menu";
import { profileCanList } from "@/lib/capabilities";
import { getAppHomeHref, isOwnerDashboardPath, OWNER_DASHBOARD_PATH } from "@/lib/dashboard-paths";
import { usesWorkspaceChrome } from "@/lib/workspace";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Buy", href: "/properties?preset=residential_buy", key: "buy" as const },
  { label: "Rent", href: "/properties?preset=residential_rent", key: "rent" as const },
  { label: "Commercial", href: "/properties?preset=commercial_buy", key: "commercial" as const },
] as const;

function getNavActiveKey(pathname: string, params: URLSearchParams) {
  if (!pathname.startsWith("/properties")) return null;
  if (params.get("listingType") === "RENT") return "rent";
  if (params.get("category") === "COMMERCIAL") return "commercial";
  if (params.get("listingType") === "BUY" || params.get("q") === "project") return "buy";
  return null;
}

function NavbarInner() {
  const { user } = useAuth();
  const { openLoginPopup } = useLoginPopup();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const activeNavKey = getNavActiveKey(pathname, searchParams);
  const canList = user ? profileCanList(user) : false;
  const homeHref = getAppHomeHref(canList);
  const isPropertiesPage = pathname.startsWith("/properties");
  const { compactActive, compactBar } = usePropertySearchNavbar();
  const showNavbarCompactSearch = isPropertiesPage && compactActive && compactBar;

  if (usesWorkspaceChrome(pathname)) {
    return null;
  }

  const navLinkClass = (active: boolean) =>
    cn(
      "relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200",
      active
        ? "bg-white/15 text-white shadow-[inset_0_-2px_0_0_rgba(255,255,255,0.9)]"
        : "text-white/80 hover:bg-white/10 hover:text-white"
    );

  const openBuyerPopup = () => {
    setMobileMenuOpen(false);
    openLoginPopup({ intent: "buyer" });
  };

  return (
    <nav className="sticky top-0 z-40 bg-primary-dark text-white shadow-[0_4px_20px_rgba(0,31,77,0.22)]">
      <div className="mx-auto max-w-7xl px-4">
        <div
          className={cn(
            "flex items-center justify-between gap-3",
            showNavbarCompactSearch ? "min-h-16 py-2" : "h-16"
          )}
        >
          <Link href={homeHref} className="shrink-0 text-xl font-bold tracking-tight text-white sm:text-2xl">
            KrrishJazz
          </Link>

          {showNavbarCompactSearch ? (
            <div className="hidden min-w-0 flex-1 lg:block lg:max-w-2xl xl:max-w-3xl">{compactBar}</div>
          ) : (
            <div className="hidden items-center gap-0.5 lg:flex">
              {NAV_LINKS.map((item) => (
                <Link key={item.label} href={item.href} className={navLinkClass(activeNavKey === item.key)}>
                  {item.label}
                </Link>
              ))}
              <Link
                href={canList ? OWNER_DASHBOARD_PATH : "/owners"}
                className={navLinkClass(pathname.startsWith("/owners"))}
              >
                {canList ? "My Dashboard" : "List Property"}
              </Link>
              <Link href="/brokers" className={navLinkClass(pathname.startsWith("/brokers"))}>
                For Brokers
              </Link>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            <UserAccountMenu tone="dark" />
            <button
              type="button"
              className="rounded-lg p-2 transition-colors hover:bg-white/10 lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-primary-dark lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-3">
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-white/50">Explore</p>
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                  activeNavKey === item.key ? "bg-white/15 text-white" : "text-white/85 hover:bg-white/10"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={canList ? OWNER_DASHBOARD_PATH : "/owners"}
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                isOwnerDashboardPath(pathname) || pathname.startsWith("/owners")
                  ? "bg-white/15 text-white"
                  : "text-white/85 hover:bg-white/10"
              )}
            >
              {canList ? "Owner Dashboard" : "List Property"}
            </Link>
            <Link
              href="/brokers"
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                pathname.startsWith("/brokers") ? "bg-white/15 text-white" : "text-white/85 hover:bg-white/10"
              )}
            >
              For Brokers
            </Link>
            {!user && (
              <button
                type="button"
                onClick={openBuyerPopup}
                className="mt-2 w-full rounded-lg border border-white/25 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-white/10"
              >
                Sign in with OTP
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarInner />
    </Suspense>
  );
}
