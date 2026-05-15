"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, Briefcase, CheckCircle2, ClipboardList, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { INDIAN_CITIES } from "@/lib/constants";
import { brokerApplicationSchema, type BrokerApplicationInput } from "@/lib/validations";

const BROKER_BENEFITS = [
  {
    icon: ClipboardList,
    title: "Active demand desk",
    desc: "Get curated buyer and tenant requirements that match your inventory and city expertise.",
  },
  {
    icon: TrendingUp,
    title: "Verified network supply",
    desc: "Access KrrishJazz-verified inventory across owners and partner brokers without cold outreach.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted closures",
    desc: "Listings are verified, leads are qualified, and brokerage is structured for clean deal closure.",
  },
  {
    icon: Sparkles,
    title: "Free to apply",
    desc: "No upfront fee. KrrishJazz only earns when you close. Apply once, get reviewed by ops within a day.",
  },
];

export function BecomeBrokerSection({ onSubmitted }: { onSubmitted?: () => void }) {
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BrokerApplicationInput>({
    resolver: zodResolver(brokerApplicationSchema) as any,
  });

  const onSubmit = async (data: BrokerApplicationInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/broker/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast("Broker application submitted.", "success");
        setSubmitted(true);
        await refreshUser();
        onSubmitted?.();
      } else {
        const err = await res.json().catch(() => ({}));
        toast(err.error || "Application failed.", "error");
      }
    } catch {
      toast("Application failed. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div>
        <div className="mb-5">
          <h2 className="text-2xl font-semibold text-foreground">Application Sent</h2>
          <p className="mt-1 text-sm text-text-secondary">KrrishJazz ops will verify your details and approve within 1 business day.</p>
        </div>
        <div className="max-w-2xl rounded-card border border-success/20 bg-success-light p-6 shadow-card">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="font-semibold text-foreground">Your broker application is under review</p>
              <p className="mt-1 text-sm text-text-secondary">
                You will see Application Status in the sidebar shortly. We&apos;ll notify you via SMS once approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-card border border-border bg-white shadow-card">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 lg:p-8">
            <Badge variant="blue" className="mb-4">
              <Briefcase size={12} className="mr-1" />
              Broker network
            </Badge>
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Become a verified KrrishJazz broker</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
              Get matched to live demand, access verified inventory, and close deals with a structured workflow. Approval typically takes 1 business day.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-pill border border-success/20 bg-success-light px-3 py-1 font-semibold text-success">
                <BadgeCheck size={12} />
                Free to apply
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-pill border border-primary/15 bg-primary-light px-3 py-1 font-semibold text-primary">
                <ShieldCheck size={12} />
                RERA verified network
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 bg-primary-light p-5 sm:grid-cols-2 lg:p-6">
            {BROKER_BENEFITS.map((item) => (
              <div key={item.title} className="rounded-card border border-primary/10 bg-white p-3 shadow-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-primary-light text-primary">
                  <item.icon size={16} />
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-card border border-border bg-white p-6 shadow-card">
          <h3 className="text-lg font-semibold text-foreground">Broker application</h3>
          <p className="mt-1 text-sm text-text-secondary">Add your RERA, experience, and local market focus.</p>
          <div className="mt-5 space-y-4">
            <Input
              label="RERA Registration Number"
              placeholder="e.g. RERA-WB-12345"
              error={errors.rera?.message}
              {...register("rera")}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Years of Experience"
                type="number"
                placeholder="e.g. 5"
                error={errors.experience?.message}
                {...register("experience")}
              />
              <Select
                label="Primary City"
                options={[{ value: "", label: "Select city" }, ...INDIAN_CITIES.map((city) => ({ value: city, label: city }))]}
                error={errors.city?.message}
                {...register("city")}
              />
            </div>
            <Input
              label="Service Areas"
              placeholder="e.g. Salt Lake, Park Street, New Town"
              error={errors.serviceAreas?.message}
              {...register("serviceAreas")}
            />
            <Textarea
              label="Short bio"
              placeholder="Strongest markets, inventory focus, and how you collaborate with KrrishJazz."
              error={errors.bio?.message}
              {...register("bio")}
            />
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button type="submit" loading={submitting} size="lg">
                Submit Application
              </Button>
              <p className="text-xs text-text-secondary">By submitting, you agree to KrrishJazz broker terms and verification checks.</p>
            </div>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="rounded-card border border-border bg-white p-5 shadow-card">
            <p className="text-sm font-semibold text-foreground">What happens next</p>
            <ol className="mt-3 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">1</span>
                <span className="text-text-secondary">Submit your details — we save them instantly.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">2</span>
                <span className="text-text-secondary">Ops verifies RERA, experience, and local market.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">3</span>
                <span className="text-text-secondary">Approval typically lands within 1 business day.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success text-[11px] font-bold text-white">4</span>
                <span className="text-text-secondary">Get access to the broker workspace and demand desk.</span>
              </li>
            </ol>
          </div>
          <div className="rounded-card border border-warning/20 bg-warning/5 p-4 text-xs leading-5 text-text-secondary">
            <p className="font-semibold text-foreground">Keep your buyer/owner access</p>
            <p className="mt-1">Becoming a broker does not remove your current buyer/owner experience. You can still post personal listings and save searches.</p>
          </div>
        </aside>
      </form>
    </div>
  );
}
