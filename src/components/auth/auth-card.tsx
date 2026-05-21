"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { registerSchema } from "@/lib/validations";
import type { RegisterInput } from "@/lib/validations";
import {
  authCardInlineSubtitle,
  authCardInlineTitle,
  type LoginIntent,
} from "@/lib/login-intent";
import { resolvePostLoginDestination, sanitizeRedirect } from "@/lib/post-login";
import {
  formatPhoneDisplay,
  formatPhoneInputValue,
  isValidIndianPhoneLocal,
  toApiPhone,
} from "@/lib/phone";
import { usePhoneOtp } from "@/hooks/use-phone-otp";
import { cn } from "@/lib/utils";

type AuthStep = "phone" | "otp" | "profile";

export type AuthCardVariant = "inline" | "compact" | "page";

export type AuthCardProps = {
  intent: LoginIntent;
  redirect?: string | null;
  variant?: AuthCardVariant;
  title?: string;
  subtitle?: string;
  className?: string;
  /** Called after successful sign-in instead of navigating (when provided). */
  onSuccess?: () => void;
};

export function AuthCard({
  intent,
  redirect,
  variant = "inline",
  title,
  subtitle,
  className,
  onSuccess,
}: AuthCardProps) {
  const { user, loading: authLoading, login, register: registerUser, refreshUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const safeRedirect = sanitizeRedirect(redirect ?? null);

  const [step, setStep] = useState<AuthStep>("phone");
  const [localPhone, setLocalPhone] = useState("");
  const [apiPhone, setApiPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    otp,
    otpRefs,
    sending,
    error: otpError,
    setError: setOtpError,
    resendCooldown,
    sendOtp,
    resetOtp,
    handleOtpChange,
    handleOtpPaste,
    handleOtpKeyDown,
    getOtpString,
  } = usePhoneOtp();

  const cardTitle = title ?? authCardInlineTitle(intent);
  const cardSubtitle = subtitle ?? authCardInlineSubtitle(intent);
  const stayOnPageWhenSignedIn = variant === "inline" && !onSuccess;

  const finishAuth = async (loggedInUser: {
    role: string;
    brokerStatus?: string | null;
    canList?: boolean;
    hasBrokerApplication?: boolean;
  }) => {
    await refreshUser();
    if (onSuccess) {
      onSuccess();
      return;
    }
    router.push(
      resolvePostLoginDestination(
        {
          role: loggedInUser.role,
          brokerStatus: loggedInUser.brokerStatus,
          canList: loggedInUser.canList,
          hasBrokerApplication: loggedInUser.hasBrokerApplication,
        },
        intent,
        safeRedirect
      )
    );
  };

  useEffect(() => {
    if (!authLoading && user && !user.name?.trim()) {
      setStep("profile");
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (!authLoading && user?.name?.trim() && step === "phone" && !onSuccess && !stayOnPageWhenSignedIn) {
      finishAuth({
        role: user.role,
        brokerStatus: user.brokerStatus,
        canList: user.canList,
        hasBrokerApplication: user.hasBrokerApplication,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, step, stayOnPageWhenSignedIn]);

  const {
    register: registerForm,
    handleSubmit: handleRegisterSubmit,
    setValue,
    formState: { errors: registerErrors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: { wantToListAsOwner: intent === "owner" },
  });

  useEffect(() => {
    setValue("wantToListAsOwner", intent === "owner");
  }, [intent, setValue]);

  const displayError = error || otpError;

  const resetToPhone = () => {
    setStep("phone");
    resetOtp();
    setError("");
    setOtpError("");
  };

  const handleSendOtp = async () => {
    const normalized = toApiPhone(localPhone);
    if (!normalized || !isValidIndianPhoneLocal(localPhone)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setApiPhone(normalized);
    setError("");
    setOtpError("");
    const ok = await sendOtp(normalized);
    if (ok) {
      setStep("otp");
      if (variant !== "compact") toast("OTP sent successfully.", "success");
    } else {
      toast(otpError || "Failed to send OTP", "error");
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = getOtpString();
    if (otpString.length !== 6) {
      setError("Enter the complete 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    setOtpError("");
    try {
      const result = await login(apiPhone, otpString);
      if (!result.success) {
        const msg = result.error || "Invalid OTP";
        setError(msg);
        toast(msg, "error");
        return;
      }
      if (result.isNew || result.needsProfile) {
        setStep("profile");
        return;
      }
      const meRes = await fetch("/api/auth/me", { credentials: "include" });
      if (meRes.ok) {
        const { user: meUser } = await meRes.json();
        await finishAuth(meUser);
      } else if (onSuccess) {
        await refreshUser();
        onSuccess();
      } else {
        router.push(safeRedirect ?? "/properties");
      }
    } catch {
      setError("Verification failed. Please try again.");
      toast("Verification failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (data: RegisterInput) => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...data,
        wantToListAsOwner: intent === "owner" ? true : data.wantToListAsOwner,
      };
      const reg = await registerUser(payload);
      if (!reg.success) {
        setError(reg.error || "Could not complete profile");
        toast(reg.error || "Could not complete profile", "error");
        return;
      }
      toast("You're signed in.", "success");
      if (onSuccess) {
        await refreshUser();
        onSuccess();
        return;
      }
      if (intent === "broker") {
        router.push("/dashboard?tab=apply-broker");
        return;
      }
      const meRes = await fetch("/api/auth/me", { credentials: "include" });
      if (meRes.ok) {
        const { user: meUser } = await meRes.json();
        finishAuth(meUser);
      } else if (intent === "owner") {
        router.push("/dashboard?tab=post");
      } else {
        router.push(safeRedirect ?? "/properties");
      }
    } catch {
      setError("Could not complete profile");
      toast("Could not complete profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className={cn("flex justify-center py-8", className)}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user?.name?.trim() && (onSuccess || stayOnPageWhenSignedIn)) {
    return (
      <div className={cn("rounded-2xl border border-success/25 bg-success-light/50 p-5 text-center", className)}>
        <CheckCircle2 className="mx-auto text-success" size={28} />
        <p className="mt-2 text-sm font-semibold text-foreground">
          Signed in as {user.name}
        </p>
        {onSuccess ? (
          <Button type="button" className="mt-4" size="sm" onClick={onSuccess}>
            Continue
          </Button>
        ) : (
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
          >
            Open your dashboard
          </Link>
        )}
      </div>
    );
  }

  if (user?.name?.trim() && step === "phone" && !onSuccess) {
    return (
      <div className={cn("flex justify-center py-6", className)}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const isCompact = variant === "compact" || variant === "inline";
  const padding = variant === "page" ? "p-6 sm:p-8" : "p-5 sm:p-6";

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-white shadow-card",
        padding,
        className
      )}
    >
      <div className={cn("mb-4", step === "phone" && "text-center")}>
        <h3 className={cn("font-bold text-foreground", isCompact ? "text-lg" : "text-xl")}>
          {step === "phone" && cardTitle}
          {step === "otp" && "Enter OTP"}
          {step === "profile" && "Complete your profile"}
        </h3>
        <p className="mt-1 text-sm text-text-secondary">
          {step === "phone" && cardSubtitle}
          {step === "otp" && apiPhone && `Code sent to ${formatPhoneDisplay(apiPhone)}`}
          {step === "profile" && "One last step, then you can continue."}
        </p>
        {step === "phone" && (
          <p className="mt-2 text-xs text-text-secondary">No password. OTP-based secure access.</p>
        )}
      </div>

      {displayError && (
        <div className="mb-3 rounded-btn border border-error/20 bg-error-light p-3 text-sm font-medium text-error">
          {displayError}
        </div>
      )}

      {step === "phone" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Mobile number</label>
            <div className="flex items-center gap-2 rounded-btn border border-border px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <Phone size={18} className="shrink-0 text-text-secondary" />
              <span className="shrink-0 text-sm font-medium text-foreground">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={localPhone}
                onChange={(e) => {
                  setLocalPhone(formatPhoneInputValue(e.target.value));
                  setError("");
                }}
                placeholder="10-digit mobile"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>
          <Button onClick={handleSendOtp} loading={sending} className="w-full" size={isCompact ? "md" : "lg"}>
            Send OTP
          </Button>
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={resetToPhone}
            className="flex items-center gap-1 text-sm text-text-secondary hover:text-foreground"
          >
            <ArrowLeft size={14} /> Change number
          </button>
          <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  otpRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className={cn(
                  "rounded-btn border border-border text-center font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                  isCompact ? "h-10 w-10 text-base" : "h-12 w-12 text-lg"
                )}
              />
            ))}
          </div>
          <Button
            onClick={handleVerifyOtp}
            loading={loading}
            className="w-full"
            size={isCompact ? "md" : "lg"}
            disabled={getOtpString().length !== 6}
          >
            Verify &amp; continue
          </Button>
          <div className="text-center text-sm text-text-secondary">
            {resendCooldown > 0 ? (
              <span>Resend OTP in {resendCooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sending}
                className="font-medium text-primary hover:underline disabled:opacity-50"
              >
                {sending ? "Sending..." : "Resend OTP"}
              </button>
            )}
          </div>
        </div>
      )}

      {step === "profile" && (
        <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-3">
          <Input
            label="Full name"
            placeholder="Your name"
            error={registerErrors.name?.message}
            {...registerForm("name")}
          />
          <Input
            label="Email (optional)"
            type="email"
            placeholder="your@email.com"
            error={registerErrors.email?.message}
            {...registerForm("email")}
          />
          {intent === "owner" && (
            <div className="rounded-card border border-success/20 bg-success-light p-3 text-sm text-success">
              <CheckCircle2 size={16} className="mr-1 inline" />
              Owner listing will be enabled on this account.
            </div>
          )}
          <Button type="submit" loading={loading} className="w-full" size={isCompact ? "md" : "lg"}>
            Continue
          </Button>
        </form>
      )}
    </div>
  );
}
