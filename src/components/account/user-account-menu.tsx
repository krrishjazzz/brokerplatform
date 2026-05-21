"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  ChevronDown,
  ClipboardList,
  FileText,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plus,
  Shield,
  User,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLoginPopup } from "@/lib/login-popup-context";
import { deriveAuthCapabilities, profileCanList } from "@/lib/capabilities";
import { BUYER_DASHBOARD_PATH, OWNER_DASHBOARD_PATH } from "@/lib/dashboard-paths";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type UserAccountMenuProps = {
  tone?: "dark" | "light";
  className?: string;
};

export function UserAccountMenu({ tone = "dark", className }: UserAccountMenuProps) {
  const { user, logout } = useAuth();
  const { openLoginPopup } = useLoginPopup();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const navigateTo = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const canList = user ? profileCanList(user) : false;
  const isDark = tone === "dark";

  const initials = user?.name?.trim()
    ? user.name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : null;

  if (!user) {
    return (
      <button
        type="button"
        onClick={() =>
          openLoginPopup({
            intent: "buyer",
            redirect: canList ? OWNER_DASHBOARD_PATH : BUYER_DASHBOARD_PATH,
          })
        }
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border transition-all",
          isDark
            ? "border-white/25 text-white hover:bg-white/10"
            : "border-border text-foreground hover:bg-surface",
          className
        )}
        aria-label="Sign in with OTP"
      >
        <User size={20} />
      </button>
    );
  }

  const renderMenuBody = () => {
    if (user.role === "ADMIN") {
      return (
        <>
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{user.name || "Admin"}</p>
            <Badge variant="error">Admin</Badge>
          </div>
          <div className="px-2 py-2">
            <MenuItem icon={<Shield size={16} />} label="Admin Panel" href="/admin" onClick={navigateTo} />
            <MenuItem icon={<LayoutDashboard size={16} />} label="Dashboard" href="/dashboard" onClick={navigateTo} />
          </div>
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
            <MenuItem icon={<Briefcase size={16} />} label="Broker Workspace" href="/broker/properties" onClick={navigateTo} emphasis />
            <MenuItem icon={<FileText size={16} />} label="Managed Requirements" href="/broker/requirements" onClick={navigateTo} />
            <MenuItem icon={<LayoutDashboard size={16} />} label="Dashboard" href="/dashboard" onClick={navigateTo} />
            <MenuItem icon={<Heart size={16} />} label="Saved Properties" href="/dashboard?tab=saved" onClick={navigateTo} />
          </div>
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
            <MenuItem icon={<LayoutDashboard size={16} />} label="Dashboard" href="/dashboard" onClick={navigateTo} />
            <MenuItem icon={<ClipboardList size={16} />} label="Application Status" href="/dashboard?tab=application" onClick={navigateTo} />
            <MenuItem icon={<Heart size={16} />} label="Saved Properties" href="/dashboard?tab=saved" onClick={navigateTo} />
          </div>
        </>
      );
    }

    if (canList) {
      const caps = deriveAuthCapabilities({
        role: user.role,
        brokerStatus: user.brokerStatus,
        canList,
        hasBrokerApplication: user.hasBrokerApplication,
      });
      return (
        <>
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{user.name || user.phone}</p>
            <Badge variant={caps.accountBadgeVariant}>{caps.accountLabel}</Badge>
          </div>
          <div className="px-2 py-2">
            <MenuItem icon={<LayoutDashboard size={16} />} label="Owner Dashboard" href={OWNER_DASHBOARD_PATH} onClick={navigateTo} />
            <MenuItem icon={<Building2 size={16} />} label="My Listings" href={`${OWNER_DASHBOARD_PATH}?tab=properties`} onClick={navigateTo} />
            <MenuItem icon={<Plus size={16} />} label="Post Property" href={`${OWNER_DASHBOARD_PATH}?tab=post`} onClick={navigateTo} />
            <MenuItem icon={<Heart size={16} />} label="Saved Properties" href={`${OWNER_DASHBOARD_PATH}?tab=saved`} onClick={navigateTo} />
            <MenuItem icon={<MessageSquare size={16} />} label="Enquiries" href={`${OWNER_DASHBOARD_PATH}?tab=enquiries`} onClick={navigateTo} />
            <MenuItem icon={<User size={16} />} label="Profile" href={`${OWNER_DASHBOARD_PATH}?tab=profile`} onClick={navigateTo} />
          </div>
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
          <MenuItem icon={<LayoutDashboard size={16} />} label="Dashboard" href={BUYER_DASHBOARD_PATH} onClick={navigateTo} />
          <MenuItem icon={<Heart size={16} />} label="Saved Properties" href={`${BUYER_DASHBOARD_PATH}?tab=saved`} onClick={navigateTo} />
          <MenuItem icon={<MessageSquare size={16} />} label="My Enquiries" href={`${BUYER_DASHBOARD_PATH}?tab=enquiries`} onClick={navigateTo} />
          <MenuItem icon={<Plus size={16} />} label="List a Property" href="/owners" onClick={navigateTo} />
          <MenuItem icon={<User size={16} />} label="Profile" href={`${BUYER_DASHBOARD_PATH}?tab=profile`} onClick={navigateTo} />
        </div>
      </>
    );
  };

  return (
    <div className={cn("relative shrink-0", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 rounded-full border px-2 py-1 transition-all sm:gap-2 sm:px-2.5 sm:py-1.5",
          isDark ? "border-white/20 bg-white/10 hover:bg-white/15" : "border-border bg-white hover:bg-surface"
        )}
        aria-label="Account menu"
      >
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
            isDark ? "bg-white text-primary" : "bg-primary text-white"
          )}
        >
          {initials}
        </span>
        <ChevronDown
          size={14}
          className={cn("shrink-0 transition-transform", isDark ? "text-white" : "text-foreground", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-white text-foreground shadow-modal">
          {renderMenuBody()}
          <div className="border-t border-border px-4 py-3">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2 text-sm text-error hover:underline"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
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
