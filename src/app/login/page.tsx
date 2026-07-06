"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LOGIN_INTENT_SIDEBAR, loginIntentPageSubtitle, loginIntentPageTitle, loginIntentSidebarTitle, parseLoginIntent } from "@/lib/login-intent";
import { sanitizeRedirect } from "@/lib/post-login";
import { BadgeCheck, ShieldCheck, Sparkles, UserRound, ClipboardList } from "lucide-react";

const SIDEBAR_ICONS = [ShieldCheck, BadgeCheck, Sparkles, UserRound, ClipboardList];

function LoginPageContent() {
  const searchParams = useSearchParams();
  const intent = parseLoginIntent(searchParams.get("intent"), searchParams.get("as"));
  const safeRedirect = sanitizeRedirect(searchParams.get("redirect"));
  const sidebarItems = LOGIN_INTENT_SIDEBAR[intent];

  return (
    <main className="min-h-[calc(100vh-76px)] bg-surface">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-6 lg:py-12">
        <section className="hidden overflow-hidden rounded-card border border-border bg-primary-dark text-white shadow-card lg:block">
          <div className="p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-white/70">
              {loginIntentSidebarTitle(intent)}
            </p>
            <h1 className="mt-4 max-w-xl text-3xl font-bold leading-tight">{loginIntentPageTitle(intent)}</h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-white/75">{loginIntentPageSubtitle(intent)}</p>
            <div className="mt-8 grid gap-3">
              {sidebarItems.map((item, index) => {
                const Icon = SIDEBAR_ICONS[index % SIDEBAR_ICONS.length];
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-card border border-white/15 bg-white/10 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-white text-primary">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-white/70">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="flex flex-col items-center justify-center">
          <div className="w-full max-w-md">
            <AuthCard intent={intent} redirect={safeRedirect} variant="page" allowIntentSwitch={intent !== "buyer"} />
            {intent === "buyer" && (
              <p className="mt-4 text-center text-xs text-text-secondary">
                <Link href="/" className="font-medium text-primary hover:underline">
                  Back to browsing
                </Link>
              </p>
            )}
            {intent === "owner" && (
              <p className="mt-4 text-center text-xs text-text-secondary">
                <Link href="/owners" className="font-medium text-primary hover:underline">
                  Back to owner information
                </Link>
              </p>
            )}
            {intent === "broker" && (
              <p className="mt-4 text-center text-xs text-text-secondary">
                <Link href="/brokers" className="font-medium text-primary hover:underline">
                  Back to broker information
                </Link>
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-surface">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
