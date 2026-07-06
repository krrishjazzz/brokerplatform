"use client";

import Link from "next/link";
import { UserAccountMenu } from "@/components/account/user-account-menu";
import { BrokerNotificationsBell } from "@/components/broker/broker-notifications-bell";
import { BrokerSubNav } from "@/components/broker/broker-sub-nav";
import { WorkspaceSwitcher } from "@/components/account/workspace-switcher";
import { useAuth } from "@/lib/auth-context";
import { getWorkspaceSwitcherOptions } from "@/lib/workspace";

export function BrokerWorkspaceHeader() {
  const { user } = useAuth();

  const switcherOptions = user ? getWorkspaceSwitcherOptions(user) : [];

  return (
    <header className="sticky top-0 z-50 bg-primary-dark shadow-[0_4px_20px_rgba(0,31,77,0.22)]">
      <div className="border-b border-white/10">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 lg:px-6">
          <Link
            href="/broker/overview"
            className="shrink-0 text-lg font-bold tracking-tight text-white sm:text-xl"
          >
            KrrishJazz
          </Link>

          {user && switcherOptions.length > 1 && (
            <div className="hidden min-w-0 flex-1 justify-center md:flex">
              <WorkspaceSwitcher
                options={switcherOptions}
                activeMode="broker"
                variant="header"
                className="w-full max-w-md"
              />
            </div>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <BrokerNotificationsBell />
            <UserAccountMenu tone="dark" workspaceMode="broker" />
          </div>
        </div>
      </div>
      <BrokerSubNav />
    </header>
  );
}
