"use client";

import { useEffect } from "react";
import { useLoginPopup } from "@/lib/login-popup-context";

type SavePropertyAuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  propertyPath: string;
  onSignedIn: () => void;
};

/** Opens the global OTP login popup for save-property flow. */
export function SavePropertyAuthModal({
  isOpen,
  onClose,
  propertyPath,
  onSignedIn,
}: SavePropertyAuthModalProps) {
  const { openLoginPopup, closeLoginPopup } = useLoginPopup();

  useEffect(() => {
    if (!isOpen) return;
    openLoginPopup({
      intent: "buyer",
      redirect: propertyPath,
      title: "Sign in to save this property",
      subtitle: "Shortlist listings and track them from your dashboard.",
      onSuccess: () => {
        onSignedIn();
        onClose();
      },
    });
    return () => closeLoginPopup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return null;
}
