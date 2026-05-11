"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, BadgeCheck, Building2, CheckCircle2, Phone, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { registerSchema, brokerApplicationSchema } from "@/lib/validations";
import type { RegisterInput, BrokerApplicationInput } from "@/lib/validations";

function LoginPageContent() {
  const { user, loading: authLoading, login, register: registerUser, refreshUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/";
  const redirect = redirectParam.startsWith("/") ? redirectParam : "/";
  const intent = searchParams.get("intent");

  const [mode, setMode] = useState<"login" | "register">("login");
  const [step, setStep] = useState<"phone" | "otp" | "register">("phone");
  const [phone, setPhone] = useState("+91");
  const [registerName, setRegisterName] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [brokerModalOpen, setBrokerModalOpen] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "BROKER" && user.brokerStatus === "APPROVED") {
        router.replace("/broker/properties");
      } else {
        router.replace(intent === "post" ? "/dashboard?tab=post" : redirect);
      }
    }
  }, [authLoading, user, intent, redirect, router]);

  const handleSendOtp = async () => {
    if (phone.length !== 13) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    if (mode === "register" && registerName.trim().length < 2) {
      setError("Enter your name to register");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        toast(data.error || "Failed to send OTP", "error");
        return;
      }
      setStep("otp");
      setResendCooldown(30);
      toast("OTP sent successfully.", "success");
    } catch {
      setError("Something went wrong. Please try again.");
      toast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Enter the complete 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await login(phone, otpString);
      if (!result.success) {
        setError(result.error || "Invalid OTP");
        toast(result.error || "Invalid OTP", "error");
        return;
      }
      if (mode === "register" && !result.isNew) {
        setError("Phone number already registered. Please login.");
        setMode("login");
        setStep("phone");
        setOtp(["", "", "", "", "", ""]);
        return;
      }
      if (result.isNew) {
        setStep("register");
      } else {
        router.push(intent === "post" ? "/dashboard?tab=post" : redirect);
      }
    } catch {
      setError("Verification failed. Please try again.");
      toast("Verification failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const {
    register: registerForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema) as any,
  });

  const {
    register: brokerForm,
    handleSubmit: handleBrokerSubmit,
    formState: { errors: brokerErrors },
  } = useForm<BrokerApplicationInput>({
    resolver: zodResolver(brokerApplicationSchema) as any,
  });

  const onRegister = async (data: RegisterInput) => {
    setLoading(true);
    try {
      await registerUser(data);
      toast("Profile completed.", "success");
      router.push(intent === "post" ? "/dashboard?tab=post" : redirect);
    } catch {
      setError("Registration failed");
      toast("Registration failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const onBrokerApply = async (data: BrokerApplicationInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/broker/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },        credentials: "include",        body: JSON.stringify(data),
      });
      if (res.ok) {
        await refreshUser();
        setBrokerModalOpen(false);
        toast("Broker application submitted.", "success");
        router.push("/dashboard");
      } else {
        const err = await res.json();
        setError(err.error || "Application failed");
        toast(err.error || "Application failed", "error");
      }
    } catch {
      setError("Application failed");
      toast("Application failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-76px)] bg-surface">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-6 lg:py-12">
        <section className="hidden overflow-hidden rounded-card border border-border bg-primary text-white shadow-card lg:block">
          <div className="p-8">
            <Badge className="border-white/20 bg-white/10 text-white">KrrishJazz Account</Badge>
            <h1 className="mt-8 max-w-xl text-4xl font-bold leading-tight">Login once. Search, shortlist, post and manage property with confidence.</h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-white/75">
              A clean property workflow for buyers, owners and trusted brokers, styled for fast Indian real estate decisions.
            </p>

            <div className="mt-8 grid gap-3">
              {[
                ["Search verified listings", "Use filters and saved properties for faster decisions.", SearchIcon],
                ["Post as owner", "List free and pay brokerage only after a successful closure.", Building2],
                ["Broker network", "Approved brokers can match demand and inventory.", ShieldCheck],
              ].map(([title, desc, Icon]) => (
                <div key={title as string} className="flex items-start gap-3 rounded-card border border-white/15 bg-white/10 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-white text-primary">
                    {typeof Icon !== "string" && <Icon size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{title as string}</p>
                    <p className="mt-1 text-sm text-white/70">{desc as string}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-5 rounded-card border border-primary/15 bg-primary-light p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-btn bg-white text-primary shadow-sm">
                  <UserRound size={21} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Welcome to KrrishJazz</p>
                  <p className="text-sm text-text-secondary">Continue with mobile OTP</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-card border border-border shadow-card p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="inline-flex rounded-pill border border-border bg-surface p-1 mb-4">
              <button
                type="button"
                onClick={() => { setMode("login"); setStep("phone"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                className={`px-5 py-2 rounded-pill text-sm font-semibold transition ${mode === "login" ? "bg-white text-primary shadow-sm" : "text-text-secondary hover:text-foreground"}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); setStep("phone"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                className={`px-5 py-2 rounded-pill text-sm font-semibold transition ${mode === "register" ? "bg-white text-primary shadow-sm" : "text-text-secondary hover:text-foreground"}`}
              >
                Register
              </button>
            </div>

            <h1 className="text-2xl font-bold text-foreground">
              {step === "phone" && (mode === "register" ? "Register on KrrishJazz" : "Login to KrrishJazz")}
              {step === "otp" && "Enter OTP"}
              {step === "register" && "Complete Your Profile"}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {step === "phone" && (mode === "register" ? "Enter your mobile number to register" : "Enter your mobile number to continue")}
              {step === "otp" && `We've sent a 6-digit code to ${phone}`}
              {step === "register" && "Just a few details to get started"}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-btn border border-error/20 bg-error-light p-3 text-sm font-medium text-error">
              {error}
            </div>
          )}

          {/* Step 1: Phone */}
          {step === "phone" && (
            <div className="space-y-4">
              {mode === "register" && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <input
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 border border-border rounded-btn text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Mobile Number</label>
                <div className="flex items-center gap-2 border border-border rounded-btn px-3 py-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                  <Phone size={18} className="text-text-secondary shrink-0" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.startsWith("+91") && val.length <= 13) setPhone(val);
                    }}
                    placeholder="+91 XXXXXXXXXX"
                    className="w-full text-sm outline-none bg-transparent"
                    maxLength={13}
                  />
                </div>
              </div>
              <Button onClick={handleSendOtp} loading={loading} className="w-full" size="lg">
                Send OTP
              </Button>
              <div className="grid gap-2 pt-2 sm:grid-cols-3">
                {[
                  ["Buyer", "Search"],
                  ["Owner", "Post"],
                  ["Broker", "Match"],
                ].map(([title, label]) => (
                  <div key={title} className="rounded-btn border border-border bg-surface px-3 py-2 text-center">
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-text-secondary">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <div className="space-y-4">
              <button
                onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                className="flex items-center gap-1 text-sm text-text-secondary hover:text-foreground"
              >
                <ArrowLeft size={14} /> Change number
              </button>

              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border border-border rounded-btn focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                ))}
              </div>

              <Button onClick={handleVerifyOtp} loading={loading} className="w-full" size="lg">
                Verify & Login
              </Button>

              <div className="text-center">
                <button
                  onClick={handleSendOtp}
                  disabled={resendCooldown > 0}
                  className="text-sm text-primary hover:underline disabled:text-text-secondary disabled:no-underline"
                >
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Register */}
          {step === "register" && (
            <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                error={registerErrors.name?.message}
                defaultValue={registerName}
                {...registerForm("name")}
              />
              <Input
                label="Email (optional)"
                type="email"
                placeholder="your@email.com"
                error={registerErrors.email?.message}
                {...registerForm("email")}
              />
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" {...registerForm("wantToListAsOwner")} className="rounded" />
                I want to list as Owner
              </label>
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Complete Registration
              </Button>
              <div className="rounded-card border border-success/20 bg-success-light p-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-success">
                  <CheckCircle2 size={16} />
                  Owner access can be enabled during registration.
                </p>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setBrokerModalOpen(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Apply as Broker instead →
                </button>
              </div>
            </form>
          )}
            </div>
          </div>
        </section>
      </div>

      {/* Broker Application Modal */}
      <Modal isOpen={brokerModalOpen} onClose={() => setBrokerModalOpen(false)} title="Broker Application">
        <form onSubmit={handleBrokerSubmit(onBrokerApply)} className="space-y-4">
          <Input
            label="RERA Registration Number"
            placeholder="RERA number"
            error={brokerErrors.rera?.message}
            {...brokerForm("rera")}
          />
          <Input
            label="Years of Experience"
            type="number"
            placeholder="e.g. 5"
            error={brokerErrors.experience?.message}
            {...brokerForm("experience")}
          />
          <Input
            label="Primary City"
            placeholder="e.g. Mumbai"
            error={brokerErrors.city?.message}
            {...brokerForm("city")}
          />
          <Input
            label="Service Areas"
            placeholder="e.g. Salt Lake, Park Street, New Town"
            error={brokerErrors.serviceAreas?.message}
            {...brokerForm("serviceAreas")}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Short Bio</label>
            <textarea
              placeholder="Tell us about your experience..."
              className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[80px]"
              {...brokerForm("bio")}
            />
            {brokerErrors.bio?.message && (
              <p className="text-xs text-error">{brokerErrors.bio.message}</p>
            )}
          </div>
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Submit Application
          </Button>
        </form>
      </Modal>
    </main>
  );
}

function SearchIcon({ size = 20 }: { size?: number }) {
  return <BadgeCheck size={size} />;
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
