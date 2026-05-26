"use client";

import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLoginPopup } from "@/lib/login-popup-context";

export function HomeContinueJourneyStrip() {
  const { user } = useAuth();
  const { openLoginPopup } = useLoginPopup();
  const signedIn = Boolean(user?.name?.trim());

  if (signedIn) return null;

  return (
    <section className="border-y border-border bg-white py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-left lg:px-6">
        <div className="flex items-start gap-3 sm:items-center">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
            <UserRound size={20} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Continue your journey</p>
            <h2 className="mt-1 text-lg font-bold text-foreground">Already shortlisted something?</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Track saved properties, enquiries, callbacks, and visits.
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="lg"
          className="shrink-0 min-w-[180px]"
          onClick={() =>
            openLoginPopup({ intent: "buyer" })
          }
        >
          Sign in with OTP
        </Button>
      </div>
    </section>
  );
}
