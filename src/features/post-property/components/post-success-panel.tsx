"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type PostSuccessPanelProps = {
  onViewProperties: () => void;
  onPostAnother: () => void;
};

export function PostSuccessPanel({ onViewProperties, onPostAnother }: PostSuccessPanelProps) {
  return (
    <div className="mx-auto max-w-lg rounded-card border border-success/30 bg-white p-8 shadow-card">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-light">
        <CheckCircle2 size={32} className="text-success" />
      </div>
      <h3 className="text-center text-xl font-semibold text-foreground">Listing submitted for KrrishJazz review</h3>
      <p className="mt-2 text-center text-sm text-text-secondary">
        Free to post. KrrishJazz verifies details and manages buyer calls on your behalf.
      </p>

      <div className="mt-6 rounded-card border border-border bg-surface p-4">
        <p className="text-sm font-semibold text-foreground">What happens next</p>
        <ol className="mt-3 space-y-2 text-sm text-text-secondary">
          <li className="flex gap-2">
            <span className="font-semibold text-primary">1.</span>
            KrrishJazz verifies your property details
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-primary">2.</span>
            We may call you if anything needs clarification
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-primary">3.</span>
            Listing goes live after approval (usually within 1 business day)
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-primary">4.</span>
            Enquiries are managed from your dashboard
          </li>
        </ol>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button type="button" className="flex-1" onClick={onViewProperties}>
          View My Properties
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={onPostAnother}>
          Post Another Property
        </Button>
      </div>
    </div>
  );
}
