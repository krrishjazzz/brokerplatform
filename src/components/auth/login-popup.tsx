"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import {
  authCardInlineSubtitle,
  authCardInlineTitle,
  loginIntentPageSubtitle,
  loginIntentPageTitle,
} from "@/lib/login-intent";
import { useLoginPopup } from "@/lib/login-popup-context";

export function LoginPopup() {
  const { isOpen, options, closeLoginPopup } = useLoginPopup();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !options) return null;

  const intent = options.intent ?? "buyer";
  const title =
    options.title ??
    (intent === "buyer" ? authCardInlineTitle(intent) : loginIntentPageTitle(intent));
  const subtitle =
    options.subtitle ??
    (intent === "buyer" ? authCardInlineSubtitle(intent) : loginIntentPageSubtitle(intent));

  const handleSuccess = () => {
    options.onSuccess?.();
    closeLoginPopup();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="fixed inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Close sign in"
        onClick={closeLoginPopup}
      />
      <div className="relative w-full max-w-md">
        <button
          type="button"
          onClick={closeLoginPopup}
          className="absolute -right-1 -top-1 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-text-secondary shadow-card transition-colors hover:text-foreground"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <AuthCard
          intent={intent}
          redirect={options.redirect}
          variant="compact"
          title={title}
          subtitle={subtitle}
          onSuccess={handleSuccess}
          className="shadow-lift"
        />
      </div>
    </div>
  );
}
