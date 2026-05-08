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
              className="block w-full text-center py-2 bg-success text-white text-sm font-medium rounded-btn hover:bg-success/90 transition-colors"
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
    <nav className="sticky top-0 z-40 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-primary">
            KrishJazz
          </Link>

          {/* Center Nav Tabs - Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {user?.role === "BROKER" ? (
              <>
                <Link
                  href="/broker/properties"
                  className="relative px-3 py-4 text-sm font-medium text-text-secondary hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary"
                >
                  Properties
                </Link>
                <Link
                  href="/broker/requirements"
                  className="relative px-3 py-4 text-sm font-medium text-text-secondary hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary"
                >
                  Requirements
                </Link>
              </>
            ) : (
              NAV_TABS.map((tab) => (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className="relative px-3 py-4 text-sm font-medium text-text-secondary hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary"
                >
                  {tab.label}
                  {tab.badge && (
                    <span
                      className={cn(
                        "ml-1 text-[10px] px-1.5 py-0.5 rounded-pill font-semibold",
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

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-surface rounded-btn transition-colors relative">
              <Bell size={20} className="text-text-secondary" />
            </button>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 p-2 hover:bg-surface rounded-btn transition-colors"
              >
                <User size={20} className="text-text-secondary" />
                <ChevronDown size={14} className="text-text-secondary" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-border rounded-card shadow-modal overflow-hidden">
                  {renderDropdownContent()}
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 hover:bg-surface rounded-btn transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white">
          <div className="px-4 py-2 space-y-1">
            {user?.role === "BROKER" ? (
              <>
                <button
                  type="button"
                  onClick={() => navigateTo("/broker/properties")}
                  className="block w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-primary hover:bg-surface rounded-btn transition-colors"
                >
                  Properties
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo("/broker/requirements")}
                  className="block w-full text-left px-3 py-2 text-sm text-text-secondary hover:text-primary hover:bg-surface rounded-btn transition-colors"
                >
                  Requirements
                </button>
              </>
            ) : (
              NAV_TABS.map((tab) => (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className="block px-3 py-2 text-sm text-text-secondary hover:text-primary hover:bg-surface rounded-btn transition-colors"
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
      className="w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm text-text-secondary hover:text-foreground hover:bg-surface rounded-btn transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}
