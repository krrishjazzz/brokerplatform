"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  ChevronDown,
  Heart,
  LogOut,
  MessageSquare,
  Search,
  Shield,
  User,
} from "lucide-react";
import { WorkspaceSwitcher } from "@/components/account/workspace-switcher";
import { useAuth } from "@/lib/auth-context";
import { useLoginPopup } from "@/lib/login-popup-context";
import { deriveAuthCapabilities } from "@/lib/capabilities";
import {
  BUYER_DASHBOARD_PATH,
  OWNER_DASHBOARD_PATH,
} from "@/lib/dashboard-paths";
import { getListPropertyHref } from "@/lib/user-journey";
import {
  deriveWorkspaceCapabilities,
  getWorkspaceModeFromPath,
  getWorkspaceSwitcherOptions,
  persistLastWorkspace,
  type WorkspaceMode,
  workspaceModeLabel,
} from "@/lib/workspace";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type UserAccountMenuProps = {
  tone?: "dark" | "light";
  /** Active workspace for menu emphasis (defaults from route). */
  workspaceMode?: WorkspaceMode;
  className?: string;
};

export function UserAccountMenu({ tone = "dark", workspaceMode, className }: UserAccountMenuProps) {
  const { user, logout } = useAuth();
  const { openLoginPopup } = useLoginPopup();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeWorkspace =
    workspaceMode ?? (pathname ? getWorkspaceModeFromPath(pathname) : "buyer");

  const navigateTo = (href: string, workspace?: WorkspaceMode) => {
    if (workspace) persistLastWorkspace(workspace);
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
            redirect: "/properties",
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

  const caps = deriveAuthCapabilities({
    role: user.role,
    brokerStatus: user.brokerStatus,
    canList: user.canList,
    ownerStatus: user.ownerStatus,
    hasBrokerApplication: user.hasBrokerApplication,
  });
  const wsCaps = deriveWorkspaceCapabilities({
    role: user.role,
    brokerStatus: user.brokerStatus,
    canList: user.canList,
    ownerStatus: user.ownerStatus,
    hasBrokerApplication: user.hasBrokerApplication,
  });
  const switcherOptions = getWorkspaceSwitcherOptions({
    role: user.role,
    brokerStatus: user.brokerStatus,
    canList: user.canList,
    ownerStatus: user.ownerStatus,
    hasBrokerApplication: user.hasBrokerApplication,
  });

  const menuBadgeLabel =
    activeWorkspace === "owner" && wsCaps.canList
      ? caps.canPostProperty
        ? "Listing tools active"
        : caps.ownerStatus === "PENDING"
          ? "Listing pending approval"
          : "Owner account"
      : activeWorkspace === "broker"
        ? "Partner workspace"
        : caps.accountLabel;

  const menuBadgeVariant =
    activeWorkspace === "owner" && wsCaps.canList
      ? caps.canPostProperty
        ? "accent"
        : "warning"
      : caps.accountBadgeVariant;

  const profileHref =
    activeWorkspace === "owner" && wsCaps.canList
      ? `${OWNER_DASHBOARD_PATH}?tab=profile`
      : activeWorkspace === "broker"
        ? `${BUYER_DASHBOARD_PATH}?tab=profile`
        : `${BUYER_DASHBOARD_PATH}?tab=profile`;

  const renderMenuBody = () => {
    if (caps.isAdmin) {
      return (
        <div className="px-2 py-2">
          <MenuItem
            icon={<Shield size={16} />}
            label="Admin Panel"
            href="/admin"
            active={activeWorkspace === "admin"}
            onClick={navigateTo}
          />
        </div>
      );
    }

    return (
      <div className="px-2 py-2">
        <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
          Quick links
        </p>
        {(activeWorkspace === "broker" || activeWorkspace === "owner") && (
          <MenuItem
            icon={<Search size={16} />}
            label="Customer view"
            href="/properties"
            active={pathname?.startsWith("/properties")}
            onClick={(href) => navigateTo(href, "buyer")}
          />
        )}
        {activeWorkspace === "buyer" && (
          <MenuItem
            icon={<Search size={16} />}
            label="Search properties"
            href="/properties"
            active={pathname?.startsWith("/properties")}
            onClick={(href) => navigateTo(href, "buyer")}
          />
        )}
        {activeWorkspace !== "owner" && (
          <>
            <MenuItem
              icon={<Heart size={16} />}
              label="Saved properties"
              href={`${BUYER_DASHBOARD_PATH}?tab=saved`}
              onClick={(href) => navigateTo(href, "buyer")}
            />
            <MenuItem
              icon={<MessageSquare size={16} />}
              label="My enquiries"
              href={`${BUYER_DASHBOARD_PATH}?tab=enquiries`}
              onClick={(href) => navigateTo(href, "buyer")}
            />
          </>
        )}
        {activeWorkspace === "owner" && wsCaps.canList && (
          <>
            <MenuItem
              icon={<MessageSquare size={16} />}
              label="Listing enquiries"
              href={`${OWNER_DASHBOARD_PATH}?tab=enquiries`}
              onClick={(href) => navigateTo(href, "owner")}
            />
          </>
        )}
        {wsCaps.canUseBrokerWorkspace && activeWorkspace !== "broker" && (
          <MenuItem
            icon={<Building2 size={16} />}
            label="Partner workspace"
            href="/broker/properties"
            onClick={(href) => navigateTo(href, "broker")}
          />
        )}
        {(caps.isPendingBroker || caps.isRejectedBroker) && !wsCaps.canUseBrokerWorkspace && (
          <MenuItem
            icon={<Building2 size={16} />}
            label="Partner application"
            href={`${BUYER_DASHBOARD_PATH}?tab=application`}
            onClick={navigateTo}
          />
        )}
        {!wsCaps.canList && activeWorkspace === "buyer" && (
          <MenuItem
            icon={<Building2 size={16} />}
            label="List a property"
            href={getListPropertyHref(user)}
            onClick={navigateTo}
          />
        )}
        <MenuItem
          icon={<User size={16} />}
          label="Profile"
          href={profileHref}
          onClick={navigateTo}
        />
      </div>
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
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-white text-foreground shadow-modal">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{user.name || user.phone}</p>
            <p className="mt-0.5 text-xs text-text-secondary">{workspaceModeLabel(activeWorkspace)}</p>
            <Badge variant={menuBadgeVariant} className="mt-2">
              {menuBadgeLabel}
            </Badge>
          </div>

          {!caps.isAdmin && switcherOptions.length > 1 && (
            <div className="border-b border-border px-4 py-3">
              <WorkspaceSwitcher
                options={switcherOptions}
                activeMode={activeWorkspace === "admin" ? "buyer" : activeWorkspace}
                variant="menu"
                onNavigate={() => setOpen(false)}
              />
            </div>
          )}

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
  active,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  onClick: (href: string, workspace?: WorkspaceMode) => void;
  emphasis?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(href)}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
        active
          ? "bg-primary-light font-semibold text-primary"
          : emphasis
            ? "font-semibold text-primary hover:bg-primary-light"
            : "text-text-secondary hover:bg-primary-light hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
