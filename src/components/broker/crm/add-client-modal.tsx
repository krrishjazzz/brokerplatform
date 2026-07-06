"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { INDIAN_CITIES, PROPERTY_TYPES } from "@/lib/constants";

export type AddClientForm = {
  name: string;
  phone: string;
  intent: "BUY" | "RENT" | "LEASE" | "SELL";
  city: string;
  propertyType: string;
  budgetMin: string;
  budgetMax: string;
  seriousness: "HOT" | "WARM" | "COLD";
  notes: string;
  nextFollowUpAt: string;
};

const defaultForm: AddClientForm = {
  name: "",
  phone: "",
  intent: "BUY",
  city: "",
  propertyType: "",
  budgetMin: "",
  budgetMax: "",
  seriousness: "WARM",
  notes: "",
  nextFollowUpAt: "",
};

export function AddClientModal({
  isOpen,
  onClose,
  onSubmit,
  submitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: AddClientForm) => Promise<void>;
  submitting: boolean;
}) {
  const [form, setForm] = useState<AddClientForm>(defaultForm);

  const handleClose = () => {
    setForm(defaultForm);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add client lead">
      <form
        className="space-y-3"
        onSubmit={async (event) => {
          event.preventDefault();
          await onSubmit(form);
          setForm(defaultForm);
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-secondary">Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-secondary">Phone</label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="10-digit mobile"
              required
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-secondary">Intent</label>
            <select
              value={form.intent}
              onChange={(e) => setForm({ ...form, intent: e.target.value as AddClientForm["intent"] })}
              className="h-10 w-full rounded-btn border border-border px-3 text-sm"
            >
              <option value="BUY">Buy</option>
              <option value="RENT">Rent</option>
              <option value="LEASE">Lease</option>
              <option value="SELL">Sell</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-secondary">Seriousness</label>
            <select
              value={form.seriousness}
              onChange={(e) => setForm({ ...form, seriousness: e.target.value as AddClientForm["seriousness"] })}
              className="h-10 w-full rounded-btn border border-border px-3 text-sm"
            >
              <option value="HOT">Hot</option>
              <option value="WARM">Warm</option>
              <option value="COLD">Cold</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-secondary">Follow-up</label>
            <Input
              type="datetime-local"
              value={form.nextFollowUpAt}
              onChange={(e) => setForm({ ...form, nextFollowUpAt: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-secondary">City</label>
            <select
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="h-10 w-full rounded-btn border border-border px-3 text-sm"
            >
              <option value="">Select city</option>
              {INDIAN_CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-secondary">Property type</label>
            <select
              value={form.propertyType}
              onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
              className="h-10 w-full rounded-btn border border-border px-3 text-sm"
            >
              <option value="">Any type</option>
              {Object.values(PROPERTY_TYPES).flat().map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            type="number"
            placeholder="Budget min"
            value={form.budgetMin}
            onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Budget max"
            value={form.budgetMax}
            onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
          />
        </div>

        <Textarea
          rows={3}
          placeholder="Notes — locality preference, timeline, family size..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting ? "Saving..." : "Save lead"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
