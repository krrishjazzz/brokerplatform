"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function usePhoneOtp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const resetOtp = useCallback(() => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
  }, []);

  const sendOtp = useCallback(async (phone: string) => {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Failed to send OTP");
        return false;
      }
      setResendCooldown(30);
      resetOtp();
      return true;
    } catch {
      setError("Failed to send OTP. Please try again.");
      return false;
    } finally {
      setSending(false);
    }
  }, [resetOtp]);

  const handleOtpChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    setOtp((current) => {
      const next = [...current];
      next[index] = value.slice(-1);
      return next;
    });
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleOtpKeyDown = useCallback((index: number, event: React.KeyboardEvent) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const getOtpString = useCallback(() => otp.join(""), [otp]);

  return {
    otp,
    otpRefs,
    sending,
    verifying,
    setVerifying,
    error,
    setError,
    resendCooldown,
    sendOtp,
    resetOtp,
    handleOtpChange,
    handleOtpKeyDown,
    getOtpString,
  };
}
