"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Menu,
  X,
  Heart,
  Briefcase,
  Building2,
  FileText,
  LogOut,
  Plus,
  LayoutDashboard,
  Shield,
  MessageSquare,
  User,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLoginPopup } from "@/lib/login-popup-context";
import { userCanList } from "@/lib/capabilities";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Buy", href: "/properties?listingType=BUY", key: "buy" as const },
  { label: "Rent", href: "/properties?listingType=RENT", key: "rent" as const },
  { label: "Commercial", href: "/properties?category=COMMERCIAL", key: "commercial" as const },
] as const;

function getNavActiveKey(pathname: string, params: URLSearchParams) {
  if (!pathname.startsWith("/properties")) return null;
  if (params.get("listingType") === "RENT") return "rent";
  if (params.get("category") === "COMMERCIAL") return "commercial";
  if (params.get("listingType") === "BUY" || params.get("q") === "project") return "buy";
  return null;
}

function NavbarInner() {
  const { user, logout } = useAuth();
  const { openLoginPopup } = useLoginPopup();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigateTo = (href: string) => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push(href);
  };

  const openBuyerPopup = (redirect?: string) => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    openLoginPopup({
      intent: "buyer",
      redirect: redirect ?? null,
      onSuccess: redirect ? () => router.push(redirect) : undefined,
    });
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const activeNavKey = getNavActiveKey(pathname, searchParams);
  const canList = user ? (user.canList ?? userCanList(user.role)) : false;

  const navLinkClass = (active: boolean) =>
    cn(
      "relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200",
      active
        ? "bg-white/15 text-white shadow-[inset_0_-2px_0_0_rgba(255,255,255,0.9)]"
        : "text-white/80 hover:bg-white/10 hover:text-white"
    );

  const renderLoggedInDropdown = () => {
    if (!user) return null;

    if (user.role === "ADMIN") {
      return (
        <>
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{user.name || "Admin"}</p>
            <Badge variant="error">Admin</Badge>
          </div>
          <div className="px-2 py-2">
            <DropdownItem icon={<Shield size={16} />} label="Admin Panel" href="/admin" onClick={navigateTo} />
            <DropdownItem icon={<LayoutDashboard size={16} />} label="Dashboard" href="/dashboard" onClick={navigateTo} />
          </div>
          <DropdownLogout onLogout={logout} />
        </>
      );
    }

    if (user.brokerStatus === "APPROVED") {
      return (
        <>
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{user.name || user.phone}</p>
            <Badge variant="blue">Approved broker</Badge>
          </div>
          <div className="px-2 py-2">
            <DropdownItem
              icon={<Briefcase size={16} />}
              label="Broker Workspace"
              href="/broker/properties"
              onClick={navigateTo}
              emphasis
            />
            <DropdownItem
              icon={<FileText size={16} />}
              label="Managed Requirements"
              href="/broker/requirements"
              onClick={navigateTo}
            />
            <DropdownItem icon={<LayoutDashboard size={16} />} label="Dashboard" href="/dashboard" onClick={navigateTo} />
            <DropdownItem icon={<Heart size={16} />} label="Saved Properties" href="/dashboard?tab=saved" onClick={navigateTo} />
          </div>
          <DropdownLogout onLogout={logout} />
        </>
      );
    }

    if (user.brokerStatus === "PENDING" || user.brokerStatus === "REJECTED") {
      return (
        <>
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{user.name || user.phone}</p>
            <Badge variant={user.brokerStatus === "PENDING" ? "warning" : "error"}>
              {user.brokerStatus === "PENDING" ? "Application pending" : "Application review"}
            </Badge>
          </div>
          <div className="px-2 py-2">
            <DropdownItem icon={<LayoutDashboard size={16} />} label="Dashboard" href="/dashboard" onClick={navigateTo} />
            <DropdownItem
              icon={<ClipboardList size={16} />}
              label="Application Status"
              href="/dashboard?tab=application"
              onClick={navigateTo}
            />
            <DropdownItem icon={<Heart size={16} />} label="Saved Properties" href="/dashboard?tab=saved" onClick={navigateTo} />
          </div>
          <DropdownLogout onLogout={logout} />
        </>
      );
    }

    if (user.role === "OWNER" || canList) {
      return (
        <>
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{user.name || user.phone}</p>
            <Badge variant="accent">Owner</Badge>
          </div>
          <div className="px-2 py-2">
            <DropdownItem icon={<LayoutDashboard size={16} />} label="Dashboard" href="/dashboard" onClick={navigateTo} />
            <DropdownItem icon={<Building2 size={16} />} label="My Listings" href="/dashboard?tab=properties" onClick={navigateTo} />
            <DropdownItem icon={<Plus size={16} />} label="Post Property" href="/dashboard?tab=post" onClick={navigateTo} />
            <DropdownItem icon={<Heart size={16} />} label="Saved Properties" href="/dashboard?tab=saved" onClick={navigateTo} />
            <DropdownItem icon={<MessageSquare size={16} />} label="My Enquiries" href="/dashboard?tab=enquiries" onClick={navigateTo} />
          </div>
          <DropdownLogout onLogout={logout} />
        </>
      );
    }

    return (
      <>
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">{user.name || user.phone}</p>
          <p className="text-xs text-text-secondary">Buyer account</p>
        </div>
        <div className="px-2 py-2">
          <DropdownItem icon={<LayoutDashboard size={16} />} label="Dashboard" href="/dashboard" onClick={navigateTo} />
          <DropdownItem icon={<Heart size={16} />} label="Saved Properties" href="/dashboard?tab=saved" onClick={navigateTo} />
          <DropdownItem icon={<MessageSquare size={16} />} label="My Enquiries" href="/dashboard?tab=enquiries" onClick={navigateTo} />
          <DropdownItem icon={<Plus size={16} />} label="List Property" href="/owners" onClick={navigateTo} />
        </div>
        <DropdownLogout onLogout={logout} />
      </>
    );
  };

  const initials = user?.name?.trim()
    ? user.name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : null;

  return (
    <nav className="sticky top-0 z-40 bg-primary-dark text-white shadow-[0_4px_20px_rgba(0,31,77,0.22)]">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="shrink-0 text-xl font-bold tracking-tight text-white sm:text-2xl">
            KrrishJazz
          </Link>

          <div className="hidden items-center gap-0.5 lg:flex">
            {NAV_LINKS.map((item) => (
              <Link key={item.label} href={item.href} className={navLinkClass(activeNavKey === item.key)}>
                {item.label}
              </Link>
            ))}
            <Link href="/owners" className={navLinkClass(pathname.startsWith("/owners"))}>
              List Property
            </Link>
            <Link href="/brokers" className={navLinkClass(pathname.startsWith("/brokers"))}>
              For Brokers
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative" ref={dropdownRef}>
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2 py-1.5 transition-all hover:bg-white/15"
                    aria-label="Account menu"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-primary">
                      {initials}
                    </span>
                    <ChevronDown
                      size={14}
                      className={cn("hidden text-white transition-transform sm:block", dropdownOpen && "rotate-180")}
                    />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-white text-foreground shadow-modal">
                      {renderLoggedInDropdown()}
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => openBuyerPopup()}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition-all hover:bg-white/10"
                  aria-label="Sign in with OTP"
                >
                  <User size={20} />
                </button>
              )}
            </div>

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
              href="/owners"
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                pathname.startsWith("/owners") ? "bg-white/15 text-white" : "text-white/85 hover:bg-white/10"
              )}
            >
              List Property
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
                onClick={() => openBuyerPopup()}
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

function DropdownItem({
  icon,
  label,
  href,
  onClick,
  emphasis,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  onClick: (href: string) => void;
  emphasis?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(href)}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
        emphasis
          ? "font-semibold text-primary hover:bg-primary-light"
          : "text-text-secondary hover:bg-primary-light hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function DropdownLogout({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="border-t border-border px-4 py-3">
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-2 text-sm text-error hover:underline"
      >
        <LogOut size={16} /> Logout
      </button>
    </div>
  );
}
