"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useLoginPopup } from "@/lib/login-popup-context";
import { normalizeIndianPhoneInput } from "@/lib/phone";

export function HomeRequirementSection() {
  const { user, refreshUser } = useAuth();
  const { openLoginPopup } = useLoginPopup();
  const signedIn = Boolean(user?.name?.trim());

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    requirementType: "Apartment",
    city: "Kolkata",
    locality: "",
    budgetMax: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!signedIn) {
      openLoginPopup({
        intent: "buyer",
        allowIntentSwitch: false,
        title: "Verify to post your requirement",
        subtitle: "Quick OTP, then submit what you are looking for.",
        onSuccess: () => void refreshUser(),
      });
      return;
    }
    setError("");
    const phone = normalizeIndianPhoneInput(form.phone || user?.phone || "");
    if (!phone) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/search-requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name || user?.name,
          phone,
          requirementType: form.requirementType,
          city: form.city,
          locality: form.locality || undefined,
          budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
          note: form.note || undefined,
          sourceUrl: "/",
          urgency: "THIS_WEEK",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not submit. Try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Could not submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-primary-light/30 py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
              <Search size={22} />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-foreground">Didn&apos;t find the right property?</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
              Tell us what you need. Our team will match verified listings and call you back - without spam.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-card">
            {sent ? (
              <p className="text-sm font-medium text-success">
                Requirement received. We will contact you on the number provided.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {!signedIn && (
                  <p className="rounded-btn border border-primary/20 bg-primary-light/50 px-3 py-2 text-xs text-text-secondary">
                    You will verify your mobile with OTP when you submit.
                  </p>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="min-h-11 rounded-btn border border-border px-3 text-sm outline-none focus:border-primary"
                  />
                  <input
                    required={!signedIn}
                    disabled={signedIn}
                    value={signedIn ? user?.phone?.replace(/^\+91/, "") || "" : form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Mobile (+91)"
                    className="min-h-11 rounded-btn border border-border px-3 text-sm outline-none focus:border-primary disabled:bg-surface"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    value={form.requirementType}
                    onChange={(e) => setForm({ ...form, requirementType: e.target.value })}
                    className="min-h-11 rounded-btn border border-border bg-white px-3 text-sm outline-none focus:border-primary"
                  >
                    <option>Apartment</option>
                    <option>Independent House</option>
                    <option>Office Space</option>
                    <option>Shop</option>
                    <option>Residential Plot</option>
                  </select>
                  <input
                    value={form.locality}
                    onChange={(e) => setForm({ ...form, locality: e.target.value })}
                    placeholder="Preferred locality"
                    className="min-h-11 rounded-btn border border-border px-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <input
                  type="number"
                  value={form.budgetMax}
                  onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
                  placeholder="Max budget (optional)"
                  className="min-h-11 w-full rounded-btn border border-border px-3 text-sm outline-none focus:border-primary"
                />
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Any specific needs (BHK, furnishing, timeline...)"
                  rows={3}
                  className="w-full rounded-btn border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
                {error && <p className="text-xs text-error">{error}</p>}
                <Button type="submit" loading={submitting} className="w-full">
                  {signedIn ? "Post my requirement" : "Verify & post requirement"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
