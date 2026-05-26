"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock, Loader2, XCircle } from "lucide-react";
import { BrokerApplicationSection } from "@/components/brokers/broker-application-section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useLoginPopup } from "@/lib/login-popup-context";

export function BrokersAuthPanel() {
  const { user, loading } = useAuth();
  const { openLoginPopup } = useLoginPopup();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    if (user.brokerStatus === "APPROVED") {
      router.replace("/broker/properties");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div id="broker-auth" className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user?.name?.trim()) {
    return (
      <section id="broker-auth" className="scroll-mt-24 border-b border-border bg-white py-12">
        <div className="mx-auto max-w-2xl px-4 text-center lg:px-6">
          <h2 className="text-2xl font-semibold text-foreground">Sign in to apply</h2>
          <p className="mt-3 text-sm text-text-secondary">
            Use OTP login to submit your broker application. Your form stays on this page after sign-in.
          </p>
          <Button
            size="lg"
            className="mt-6 gap-2"
            onClick={() =>
              openLoginPopup({
                intent: "broker",
                allowIntentSwitch: false,
                title: "Sign in to apply as broker",
                subtitle: "Join the managed KrrishJazz broker network.",
                onSuccess: () => {
                  window.location.href = "/brokers#broker-auth";
                },
              })
            }
          >
            Sign in with OTP
            <ArrowRight size={16} />
          </Button>
        </div>
      </section>
    );
  }

  if (user.brokerStatus === "PENDING") {
    return (
      <section id="broker-auth" className="scroll-mt-24 border-b border-border bg-white py-12">
        <div className="mx-auto max-w-2xl px-4 lg:px-6">
          <div className="rounded-2xl border border-warning/25 bg-white p-6 shadow-card">
            <div className="flex items-start gap-3">
              <Clock className="shrink-0 text-warning" size={28} />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-foreground">Application under review</h2>
                  <Badge variant="warning">Pending</Badge>
                </div>
                <p className="mt-2 text-sm text-text-secondary">
                  KrrishJazz ops typically responds within one business day. Track full status in your dashboard.
                </p>
                <Link href="/dashboard?tab=application" className="mt-4 inline-block">
                  <Button variant="outline">View application status</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (user.brokerStatus === "REJECTED") {
    return (
      <section id="broker-auth" className="scroll-mt-24 border-b border-border bg-white py-12">
        <div className="mx-auto max-w-3xl px-4 lg:px-6">
          <div className="mb-6 rounded-2xl border border-error/25 bg-error-light/40 p-5">
            <div className="flex items-start gap-3">
              <XCircle className="shrink-0 text-error" size={26} />
              <div>
                <h2 className="text-lg font-semibold text-foreground">Previous application not approved</h2>
                {user.brokerRejectionReason && (
                  <p className="mt-1 text-sm text-text-secondary">{user.brokerRejectionReason}</p>
                )}
                <p className="mt-2 text-sm text-text-secondary">Update your details and submit a new application below.</p>
              </div>
            </div>
          </div>
          <BrokerApplicationSection />
        </div>
      </section>
    );
  }

  if (user.hasBrokerApplication) {
    return (
      <section id="broker-auth" className="scroll-mt-24 border-b border-border bg-white py-12">
        <div className="mx-auto max-w-2xl px-4 text-center lg:px-6">
          <p className="text-sm text-text-secondary">You already have a broker application on file.</p>
          <Link href="/dashboard?tab=application" className="mt-4 inline-block">
            <Button>Open application status</Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section id="broker-auth" className="scroll-mt-24 border-b border-border bg-surface py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <BrokerApplicationSection />
      </div>
    </section>
  );
}
