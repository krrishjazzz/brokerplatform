"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Menu,
  X,
  Clock,
  Eye,
  Heart,
  Phone,
  User,
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
    if (headerMode === "Rent") params.set("intent", "rent");
    else if (headerMode === "Commercial") params.set("intent", "commercial");
    else if (headerMode === "Plots/Land") params.set("intent", "land");
    else params.set("intent", "buy");
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
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Quick Access</p>
            <DropdownItem icon={<Search size={16} />} label="Search Properties" href="/properties" onClick={navigateTo} />
            <DropdownItem icon={<Plus size={16} />} label="Post Property Free" href="/login?intent=post" onClick={navigateTo} />
            <DropdownItem icon={<Briefcase size={16} />} label="Join as Broker" href="/login?as=broker" onClick={navigateTo} />
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
    <nav className="sticky top-0 z-40 bg-primary-dark text-white shadow-[0_4px_16px_rgb(0_31_77/0.28)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2 text-2xl font-bold text-white lg:text-[28px]">
            <span className="leading-none">
              KrrishJazz
            </span>
          </Link>

          <div className="hidden w-[340px] shrink-0 items-center rounded-btn bg-white text-foreground shadow-sm xl:flex 2xl:w-[390px]">
            <select
              value={headerMode}
              onChange={(event) => setHeaderMode(event.target.value)}
              className="h-10 rounded-l-btn border-r border-border bg-white px-3 text-sm font-semibold text-foreground outline-none"
            >
              <option>Buy</option>
              <option>Rent</option>
              <option>Commercial</option>
              <option>Plots/Land</option>
            </select>
            <input
              aria-label="Search properties"
              value={headerSearch}
              onChange={(event) => setHeaderSearch(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && runHeaderSearch()}
              className="h-10 min-w-0 flex-1 px-3 text-sm outline-none placeholder:text-text-secondary"
              placeholder="Locality / project / landmark"
            />
            <button type="button" onClick={runHeaderSearch} className="flex h-10 w-12 items-center justify-center text-foreground hover:text-primary">
              <Search size={21} />
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard?tab=post"
              className="hidden rounded-btn bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-primary-light md:inline-flex"
            >
              Post Property
            </Link>
            <Link
              href="/properties?intent=discover"
              className="inline-flex items-center gap-2 rounded-btn border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              <Search size={16} />
              Search
            </Link>

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
        <div className="lg:hidden border-t border-white/10 bg-primary-dark text-white">
          <div className="px-4 py-2 space-y-1">
            <button
              type="button"
              onClick={() => navigateTo("/properties?intent=discover")}
              className="block w-full text-left px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 rounded-btn transition-colors"
            >
              Explore Properties
            </button>
            <button
              type="button"
              onClick={() => navigateTo("/dashboard?tab=saved")}
              className="block w-full text-left px-3 py-2 text-sm text-white/85 hover:bg-white/10 rounded-btn transition-colors"
            >
              Saved Properties
            </button>
            <button
              type="button"
              onClick={() => navigateTo("/dashboard?tab=enquiries")}
              className="block w-full text-left px-3 py-2 text-sm text-white/85 hover:bg-white/10 rounded-btn transition-colors"
            >
              My Enquiries
            </button>
            <button
              type="button"
              onClick={() => navigateTo("/dashboard?tab=post")}
              className="mt-1 block w-full rounded-btn bg-white px-3 py-2 text-left text-sm font-semibold text-foreground transition-colors hover:bg-primary-light"
            >
              Post Property
            </button>
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
