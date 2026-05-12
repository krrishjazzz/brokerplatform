"use client";

import { useState } from "react";
import { BadgeCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SearchRequirementForm } from "./types";

interface NoMatchRequirementCaptureProps {
  form: SearchRequirementForm;
  setForm: (form: SearchRequirementForm) => void;
  submitting: boolean;
  sent: boolean;
  onSubmit: () => void;
  onClearFilters: () => void;
  onRelaxBudget: () => void;
  onShowNearby: () => void;
  propertyTypes: string[];
}

export function NoMatchRequirementCapture({
  form,
  setForm,
  submitting,
  sent,
  onSubmit,
  onClearFilters,
  onRelaxBudget,
  onShowNearby,
  propertyTypes,
}: NoMatchRequirementCaptureProps) {
  const update = (key: keyof SearchRequirementForm, value: string) => setForm({ ...form, [key]: value });
  const [wizardStep, setWizardStep] = useState(0);
  const wizardLabels = ["Need", "Location", "Budget", "Contact"];

  return (
    <div className="overflow-hidden rounded-card border border-border bg-white shadow-card">
      <div className="grid gap-0 lg:grid-cols-[1fr_390px]">
        <div className="bg-primary-light p-6 lg:p-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-sm">
            <Search size={22} />
          </div>
          <h3 className="mt-5 text-2xl font-semibold text-foreground">No exact match yet</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
            Good search, thin supply. Share what you need and KrrishJazz can manually check owner and broker inventory instead of making you keep refreshing filters.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button type="button" onClick={onRelaxBudget} className="rounded-card border border-primary/15 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-card">
              <p className="text-sm font-semibold text-foreground">Relax budget</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">Remove strict price filters and see near matches.</p>
            </button>
            <button type="button" onClick={onShowNearby} className="rounded-card border border-primary/15 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-card">
              <p className="text-sm font-semibold text-foreground">Try nearby</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">Search broader localities around your preferred area.</p>
            </button>
            <button type="button" onClick={onClearFilters} className="rounded-card border border-primary/15 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-card">
              <p className="text-sm font-semibold text-foreground">Reset filters</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">Start clean with one city, type, or budget.</p>
            </button>
          </div>
        </div>

        <div className="border-t border-border bg-white p-5 lg:border-l lg:border-t-0">
          {sent ? (
            <div className="flex h-full min-h-80 flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-light text-success">
                <BadgeCheck size={24} />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-foreground">Requirement received</h4>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                KrrishJazz ops can now follow up and look for matching supply manually.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Tell KrrishJazz your requirement</p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">This becomes an assisted-search request for admin follow-up.</p>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {wizardLabels.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setWizardStep(index)}
                    className={cn(
                      "rounded-btn border px-2 py-2 text-[11px] font-semibold transition-colors",
                      wizardStep === index ? "border-primary bg-primary text-white" : "border-border bg-surface text-text-secondary"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {wizardStep === 0 && (
                <>
                  <select value={form.requirementType} onChange={(event) => update("requirementType", event.target.value)} className="min-h-11 w-full rounded-btn border border-border bg-surface px-3 text-sm outline-none focus:border-primary">
                    <option value="">Property type</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <textarea value={form.note} onChange={(event) => update("note", event.target.value)} placeholder="Anything important? floor, road, visit timing, furnishing..." className="min-h-24 w-full rounded-btn border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
                </>
              )}

              {wizardStep === 1 && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  <input value={form.locality} onChange={(event) => update("locality", event.target.value)} placeholder="Preferred locality" className="min-h-11 rounded-btn border border-border bg-surface px-3 text-sm outline-none focus:border-primary" />
                  <input value={form.city} onChange={(event) => update("city", event.target.value)} placeholder="City" className="min-h-11 rounded-btn border border-border bg-surface px-3 text-sm outline-none focus:border-primary" />
                </div>
              )}

              {wizardStep === 2 && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  <input type="number" value={form.budgetMax} onChange={(event) => update("budgetMax", event.target.value)} placeholder="Max budget" className="min-h-11 rounded-btn border border-border bg-surface px-3 text-sm outline-none focus:border-primary" />
                  <select value={form.urgency} onChange={(event) => update("urgency", event.target.value)} className="min-h-11 rounded-btn border border-border bg-surface px-3 text-sm outline-none focus:border-primary">
                    <option value="IMMEDIATE">Immediate</option>
                    <option value="THIS_WEEK">This week</option>
                    <option value="THIS_MONTH">This month</option>
                    <option value="EXPLORING">Just exploring</option>
                  </select>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  <input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Your name" className="min-h-11 rounded-btn border border-border bg-surface px-3 text-sm outline-none focus:border-primary" />
                  <input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+91XXXXXXXXXX" className="min-h-11 rounded-btn border border-border bg-surface px-3 text-sm outline-none focus:border-primary" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" disabled={wizardStep === 0} onClick={() => setWizardStep((step) => Math.max(0, step - 1))}>Back</Button>
                <Button type="button" variant="outline" disabled={wizardStep === wizardLabels.length - 1} onClick={() => setWizardStep((step) => Math.min(wizardLabels.length - 1, step + 1))}>Next</Button>
              </div>

              <Button onClick={onSubmit} loading={submitting} className="w-full" disabled={!form.name || !form.phone || !form.city}>
                Send Requirement
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
