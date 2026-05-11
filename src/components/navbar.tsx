"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Menu,
  X,
  Clock,
  Eye,
  Heart,
  Phone,
  User,
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
import { NAV_TABS } from "@/lib/constants";

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const [headerMode, setHeaderMode] = useState("Buy");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigateTo = (href: string) => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push(href);
  };

  const runHeaderSearch = () => {
    const params = new URLSearchParams();
    if (headerMode === "Rent") params.set("listingType", "RENT");
    else if (headerMode === "Commercial") params.set("category", "COMMERCIAL");
    else params.set("listingType", "BUY");
    if (headerSearch.trim()) params.set("q", headerSearch.trim());
    navigateTo(`/properties?${params.toString()}`);
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

  const renderDropdownContent = () => {
    if (!user) {
      return (
        <>
          <div className="px-4 py-3 border-b border-border">
            <Link
              href="/login"
              className="text-sm font-semibold text-primary hover:underline"
              onClick={() => setDropdownOpen(false)}
            >
              LOGIN / REGISTER
            </Link>
          </div>
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">My Activity</p>
            <DropdownItem icon={<Clock size={16} />} label="Recently Searched" href="/properties" onClick={navigateTo} />
            <DropdownItem icon={<Eye size={16} />} label="Recently Viewed" href="/properties" onClick={navigateTo} />
            <DropdownItem icon={<Heart size={16} />} label="Shortlisted" href="/login?redirect=/dashboard" onClick={navigateTo} />
            <DropdownItem icon={<Phone size={16} />} label="Contacted" href="/login?redirect=/dashboard" onClick={navigateTo} />
          </div>
          <div className="px-4 py-3 border-t border-border">
            <Link
              href="/login?intent=post"
              className="block w-full text-center py-2 bg-white text-primary text-sm font-semibold rounded-btn border border-primary/20 hover:bg-primary-light transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              Post Property FREE
            </Link>
          </div>
        </>
      );
    }

    if (user.role === "ADMIN") {
      return (
        <>
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">{user.name || "Admin"}</p>
            <p className="text-xs text-text-secondary">{user.email || user.phone}</p>
          </div>
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">My Activity</p>
            <DropdownItem icon={<Eye size={16} />} label="Recently Viewed" href="/properties" onClick={navigateTo} />
            <DropdownItem icon={<Heart size={16} />} label="Shortlisted" href="/dashboard?tab=saved" onClick={navigateTo} />
          </div>
          <div className="px-4 py-2 border-t border-border">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">My Account</p>
            <DropdownItem icon={<User size={16} />} label="My Profile" href="/dashboard?tab=profile" onClick={navigateTo} />
            <DropdownItem icon={<Shield size={16} />} label="Admin Panel" href="/admin" onClick={navigateTo} />
          </div>
          <div className="px-4 py-3 border-t border-border">
            <button onClick={logout} className="flex items-center gap-2 text-sm text-error hover:underline w-full">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </>
      );
    }

    if (user.role === "BROKER" && user.brokerStatus === "PENDING") {
      return (
        <>
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">{user.name || user.phone}</p>
            <Badge variant="warning">Pending Approval</Badge>
          </div>
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">My Activity</p>
            <DropdownItem icon={<Eye size={16} />} label="Recently Viewed" href="/properties" onClick={navigateTo} />
            <DropdownItem icon={<Heart size={16} />} label="Shortlisted" href="/dashboard?tab=saved" onClick={navigateTo} />
          </div>
          <div className="px-4 py-3 border-t border-border bg-warning/5">
            <p className="text-xs text-warning">Your broker application is under review</p>
          </div>
          <div className="px-4 py-3 border-t border-border">
            <button onClick={logout} className="flex items-center gap-2 text-sm text-error hover:underline w-full">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </>
      );
    }

    if (user.role === "BROKER" && user.brokerStatus === "APPROVED") {
      return (
        <>
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">{user.name || user.phone}</p>
            <Badge variant="blue">Broker</Badge>
          </div>
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Broker Network</p>
            <DropdownItem icon={<Building2 size={16} />} label="Properties" href="/broker/properties" onClick={navigateTo} />
            <DropdownItem icon={<FileText size={16} />} label="Requirements" href="/broker/requirements" onClick={navigateTo} />
          </div>
          <div className="px-4 py-2 border-t border-border">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">My Listings</p>
            <DropdownItem icon={<Building2 size={16} />} label="My Properties" href="/dashboard?tab=properties" onClick={navigateTo} />
            <DropdownItem icon={<Plus size={16} />} label="Post New Property" href="/dashboard?tab=post" onClick={navigateTo} />
            <DropdownItem icon={<Phone size={16} />} label="My Leads" href="/dashboard?tab=leads" onClick={navigateTo} />
          </div>
          <div className="px-4 py-2 border-t border-border">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">My Account</p>
            <DropdownItem icon={<User size={16} />} label="My Profile" href="/dashboard?tab=profile" onClick={navigateTo} />
            <DropdownItem icon={<FileText size={16} />} label="My RERA Details" href="/dashboard?tab=profile" onClick={navigateTo} />
          </div>
          <div className="px-4 py-3 border-t border-border">
            <button onClick={logout} className="flex items-center gap-2 text-sm text-error hover:underline w-full">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </>
      );
    }

    if (user.role === "OWNER") {
      return (
        <>
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">{user.name || user.phone}</p>
            <Badge variant="success">Owner</Badge>
          </div>
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">My Listings</p>
            <DropdownItem icon={<LayoutDashboard size={16} />} label="Overview" href="/dashboard" onClick={navigateTo} />
            <DropdownItem icon={<Building2 size={16} />} label="My Properties" href="/dashboard?tab=properties" onClick={navigateTo} />
            <DropdownItem icon={<Plus size={16} />} label="Post New Property" href="/dashboard?tab=post" onClick={navigateTo} />
            <DropdownItem icon={<Phone size={16} />} label="My Leads" href="/dashboard?tab=leads" onClick={navigateTo} />
          </div>
          <div className="px-4 py-2 border-t border-border">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">My Account</p>
            <DropdownItem icon={<User size={16} />} label="My Profile" href="/dashboard?tab=profile" onClick={navigateTo} />
            <DropdownItem icon={<Heart size={16} />} label="Saved Properties" href="/dashboard?tab=saved" onClick={navigateTo} />
          </div>
          <div className="px-4 py-3 border-t border-border">
            <button onClick={logout} className="flex items-center gap-2 text-sm text-error hover:underline w-full">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </>
      );
    }

    // CUSTOMER
    return (
      <>
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground">{user.name || user.phone}</p>
          <p className="text-xs text-text-secondary">{user.email || user.phone}</p>
        </div>
        <div className="px-4 py-2">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">My Activity</p>
          <DropdownItem icon={<Clock size={16} />} label="Recently Searched" href="/properties" onClick={navigateTo} />
          <DropdownItem icon={<Eye size={16} />} label="Recently Viewed" href="/properties" onClick={navigateTo} />
          <DropdownItem icon={<Heart size={16} />} label="Shortlisted" href="/dashboard?tab=saved" onClick={navigateTo} />
          <DropdownItem icon={<Phone size={16} />} label="Contacted" href="/dashboard?tab=enquiries" onClick={navigateTo} />
        </div>
        <div className="px-4 py-2 border-t border-border">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">My Account</p>
          <DropdownItem icon={<User size={16} />} label="My Profile" href="/dashboard?tab=profile" onClick={navigateTo} />
          <DropdownItem icon={<FileText size={16} />} label="My Enquiries" href="/dashboard?tab=enquiries" onClick={navigateTo} />
          <DropdownItem icon={<Heart size={16} />} label="Saved Properties" href="/dashboard?tab=saved" onClick={navigateTo} />
        </div>
        <div className="px-4 py-3 border-t border-border">
          <button onClick={logout} className="flex items-center gap-2 text-sm text-error hover:underline w-full">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </>
    );
  };

  return (
    <nav className="sticky top-0 z-40 bg-primary text-white shadow-[0_2px_8px_rgb(0_31_77/0.18)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-[76px] gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-3xl font-bold text-white">
            <span className="leading-none">
              KrrishJazz
            </span>
          </Link>

          <div className="hidden xl:flex min-w-0 flex-1 max-w-[800px] items-center rounded-btn bg-white text-foreground shadow-sm">
            <select
              value={headerMode}
              onChange={(event) => setHeaderMode(event.target.value)}
              className="h-11 rounded-l-btn border-r border-border bg-white px-3 text-sm font-semibold text-foreground outline-none"
            >
              <option>Buy</option>
              <option>Rent</option>
              <option>Commercial</option>
            </select>
            <input
              aria-label="Search properties"
              value={headerSearch}
              onChange={(event) => setHeaderSearch(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && runHeaderSearch()}
              className="h-11 min-w-0 flex-1 px-4 text-sm outline-none placeholder:text-text-secondary"
              placeholder="Enter Locality / Project / Landmark"
            />
            <button type="button" onClick={runHeaderSearch} className="flex h-11 w-14 items-center justify-center text-foreground hover:text-primary">
              <Search size={22} />
            </button>
          </div>

          {/* Center Nav Tabs - Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {user?.role === "BROKER" && user.brokerStatus === "APPROVED" ? (
              <>
                <Link
                  href="/broker/properties"
                  className="relative px-3 py-2 rounded-btn text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Properties
                </Link>
                <Link
                  href="/broker/requirements"
                  className="relative px-3 py-2 rounded-btn text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Requirements
                </Link>
                <Link
                  href="/dashboard?tab=post"
                  className="relative px-4 py-2 rounded-btn text-sm font-semibold bg-white text-foreground hover:bg-primary-light transition-colors shadow-sm"
                >
                  Post Property
                </Link>
              </>
            ) : (
              NAV_TABS.map((tab) => (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className="relative px-3 py-2 rounded-btn text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {tab.label}
                  {tab.badge && (
                    <span
                      className={cn(
                        "ml-1 text-[10px] px-1.5 py-0.5 rounded-pill font-bold",
                        tab.badgeColor === "green"
                          ? "bg-success text-white"
                          : "bg-error text-white"
                      )}
                    >
                      {tab.badge}
                    </span>
                  )}
                </Link>
              ))
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              href="/properties"
              className="xl:hidden hidden md:inline-flex items-center gap-2 rounded-btn border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              <Search size={16} />
              Search
            </Link>
            <button className="p-2 hover:bg-white/10 rounded-btn transition-colors relative border border-transparent">
              <Bell size={20} className="text-white" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-success" />
            </button>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-pill border border-white/20 bg-white/10 px-2 py-1.5 hover:bg-white/15 transition-colors"
              >
                <span className="h-8 w-8 rounded-full bg-success-light text-success flex items-center justify-center text-xs font-bold">
                  {(user?.name || user?.phone || "U").charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:block text-sm font-semibold text-white max-w-28 truncate">
                  {user?.name || user?.phone || "Account"}
                </span>
                <ChevronDown size={14} className="text-white" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-background border border-border rounded-card shadow-modal overflow-hidden text-foreground">
                  {renderDropdownContent()}
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 hover:bg-white/10 rounded-btn transition-colors text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-primary text-white">
          <div className="px-4 py-2 space-y-1">
            <button
              type="button"
              onClick={() => navigateTo("/properties")}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 rounded-btn transition-colors"
            >
              Search Properties
            </button>
            {user?.role === "BROKER" && user.brokerStatus === "APPROVED" ? (
              <>
                <button
                  type="button"
                  onClick={() => navigateTo("/broker/properties")}
                  className="block w-full text-left px-3 py-2 text-sm text-white/85 hover:bg-white/10 rounded-btn transition-colors"
                >
                  Properties
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo("/broker/requirements")}
                  className="block w-full text-left px-3 py-2 text-sm text-white/85 hover:bg-white/10 rounded-btn transition-colors"
                >
                  Requirements
                </button>
              </>
            ) : (
              NAV_TABS.map((tab) => (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className="block px-3 py-2 text-sm text-white/85 hover:bg-white/10 rounded-btn transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tab.label}
                  {tab.badge && (
                    <span
                      className={cn(
                        "ml-2 text-[10px] px-1.5 py-0.5 rounded-pill font-semibold",
                        tab.badgeColor === "green"
                          ? "bg-success/10 text-success"
                          : "bg-error/10 text-error"
                      )}
                    >
                      {tab.badge}
                    </span>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function DropdownItem({ icon, label, href, onClick }: { icon: React.ReactNode; label: string; href: string; onClick: (href: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick(href)}
      className="w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm text-text-secondary hover:text-foreground hover:bg-primary-light rounded-btn transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}
