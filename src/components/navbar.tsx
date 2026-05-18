"use client";

import { useState, useRef, useEffect } from "react";
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
  Search,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Buy", href: "/properties?listingType=BUY", key: "buy" as const },
  { label: "Rent", href: "/properties?listingType=RENT", key: "rent" as const },
  { label: "Commercial", href: "/properties?category=COMMERCIAL", key: "commercial" as const },
  { label: "Projects", href: "/properties?listingType=BUY&q=project", key: "projects" as const },
  { label: "Plots / Land", href: "/properties?propertyType=Residential%20Plot", key: "plots" as const },
  { label: "Brokers", href: "/brokers", key: "brokers" as const },
] as const;

function getNavActiveKey(pathname: string, params: URLSearchParams) {
  if (pathname.startsWith("/brokers")) return "brokers";
  if (!pathname.startsWith("/properties")) return null;
  if (params.get("q") === "project") return "projects";
  if (params.get("listingType") === "RENT") return "rent";
  if (params.get("category") === "COMMERCIAL") return "commercial";
  if (params.get("propertyType") === "Residential Plot" || params.get("intent") === "land") return "plots";
  if (params.get("listingType") === "BUY") return "buy";
  return null;
}

export function Navbar() {
  const { user, logout } = useAuth();
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

  const navLinkClass = (active: boolean) =>
    cn(
      "relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200",
      active
        ? "bg-white/15 text-white shadow-[inset_0_-2px_0_0_rgba(255,255,255,0.9)]"
        : "text-white/80 hover:bg-white/10 hover:text-white"
    );

  const renderDropdownContent = () => {
    if (!user) {
      return (
        <>
          <div className="border-b border-border px-4 py-3">
            <Link href="/login" className="text-sm font-semibold text-primary hover:underline" onClick={() => setDropdownOpen(false)}>
              LOGIN / REGISTER
            </Link>
          </div>
          <div className="px-4 py-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Quick Access</p>
            <DropdownItem icon={<Search size={16} />} label="Property Search" href="/properties" onClick={navigateTo} />
            <DropdownItem icon={<Plus size={16} />} label="Post Property Free" href="/login?intent=post" onClick={navigateTo} />
            <DropdownItem icon={<Briefcase size={16} />} label="Broker Network" href="/brokers" onClick={navigateTo} />
          </div>
        </>
      );
    }

    if (user.role === "ADMIN") {
      return (
        <>
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{user.name || "Admin"}</p>
            <p className="text-xs text-text-secondary">{user.email || user.phone}</p>
          </div>
          <div className="px-4 py-2">
            <DropdownItem icon={<Shield size={16} />} label="Admin Panel" href="/admin" onClick={navigateTo} />
            <DropdownItem icon={<LayoutDashboard size={16} />} label="Dashboard" href="/dashboard" onClick={navigateTo} />
          </div>
          <div className="border-t border-border px-4 py-3">
            <button onClick={logout} className="flex w-full items-center gap-2 text-sm text-error hover:underline">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </>
      );
    }

    if (user.role === "BROKER" && user.brokerStatus === "APPROVED") {
      return (
        <>
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{user.name || user.phone}</p>
            <Badge variant="blue">Broker</Badge>
          </div>
          <div className="px-4 py-2">
            <DropdownItem icon={<Building2 size={16} />} label="Broker Dashboard" href="/broker/properties" onClick={navigateTo} />
            <DropdownItem icon={<FileText size={16} />} label="Requirements" href="/broker/requirements" onClick={navigateTo} />
            <DropdownItem icon={<Briefcase size={16} />} label="Broker Network" href="/brokers" onClick={navigateTo} />
          </div>
          <div className="border-t border-border px-4 py-3">
            <button onClick={logout} className="flex w-full items-center gap-2 text-sm text-error hover:underline">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">{user.name || user.phone}</p>
          <p className="text-xs text-text-secondary">{user.email || user.phone}</p>
        </div>
        <div className="px-4 py-2">
          <DropdownItem icon={<LayoutDashboard size={16} />} label="Dashboard" href="/dashboard" onClick={navigateTo} />
          <DropdownItem icon={<Heart size={16} />} label="Saved Properties" href="/dashboard?tab=saved" onClick={navigateTo} />
          <DropdownItem icon={<Plus size={16} />} label="Post Property" href="/dashboard?tab=post" onClick={navigateTo} />
        </div>
        <div className="border-t border-border px-4 py-3">
          <button onClick={logout} className="flex w-full items-center gap-2 text-sm text-error hover:underline">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </>
    );
  };

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
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard?tab=post"
              className="hidden rounded-lg border border-white/20 bg-white px-3 py-2 text-sm font-semibold text-primary shadow-sm transition-all hover:bg-primary-light hover:shadow-md md:inline-flex"
            >
              Post Property
            </Link>
            <Link
              href="/properties"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition-all hover:border-white/40 hover:bg-white/20 active:scale-[0.98]"
            >
              <Search size={16} />
              <span className="hidden sm:inline">Property Search</span>
              <span className="sm:hidden">Search</span>
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2 py-1.5 transition-all hover:bg-white/15"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                  {(user?.name || user?.phone || "U").charAt(0).toUpperCase()}
                </span>
                <ChevronDown size={14} className={cn("hidden text-white transition-transform sm:block", dropdownOpen && "rotate-180")} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-white text-foreground shadow-modal">
                  {renderDropdownContent()}
                </div>
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
            <div className="my-2 border-t border-white/10" />
            <Link href="/properties" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
              <Search size={16} /> Property Search
            </Link>
            <Link
              href="/dashboard?tab=post"
              className="mt-1 block rounded-lg bg-white px-3 py-2.5 text-center text-sm font-semibold text-primary hover:bg-primary-light"
            >
              Post Property
            </Link>
            {!user && (
              <Link href="/login" className="block rounded-lg px-3 py-2.5 text-sm text-white/85 hover:bg-white/10">
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function DropdownItem({
  icon,
  label,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  onClick: (href: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(href)}
      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-primary-light hover:text-foreground"
    >
      {icon}
      {label}
    </button>
  );
}
