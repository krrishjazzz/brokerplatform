"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LoginIntent } from "@/lib/login-intent";
import { LoginPopup } from "@/components/auth/login-popup";

export type LoginPopupOptions = {
  intent?: LoginIntent;
  redirect?: string | null;
  title?: string;
  subtitle?: string;
  /** When false, intent is fixed (e.g. save property, owner list CTA). Default true. */
  allowIntentSwitch?: boolean;
  onSuccess?: () => void;
};

type LoginPopupContextValue = {
  isOpen: boolean;
  options: LoginPopupOptions | null;
  openLoginPopup: (options?: LoginPopupOptions) => void;
  closeLoginPopup: () => void;
};

const LoginPopupContext = createContext<LoginPopupContextValue | undefined>(undefined);

export function LoginPopupProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<LoginPopupOptions | null>(null);

  const openLoginPopup = useCallback((next?: LoginPopupOptions) => {
    setOptions({
      intent: next?.intent ?? "buyer",
      redirect: next?.redirect ?? null,
      title: next?.title,
      subtitle: next?.subtitle,
      allowIntentSwitch: next?.allowIntentSwitch ?? true,
      onSuccess: next?.onSuccess,
    });
    setIsOpen(true);
  }, []);

  const closeLoginPopup = useCallback(() => {
    setIsOpen(false);
    setOptions(null);
  }, []);

  const value = useMemo(
    () => ({ isOpen, options, openLoginPopup, closeLoginPopup }),
    [isOpen, options, openLoginPopup, closeLoginPopup]
  );

  return (
    <LoginPopupContext.Provider value={value}>
      {children}
      <LoginPopup />
    </LoginPopupContext.Provider>
  );
}

export function useLoginPopup() {
  const context = useContext(LoginPopupContext);
  if (!context) {
    throw new Error("useLoginPopup must be used within LoginPopupProvider");
  }
  return context;
}
