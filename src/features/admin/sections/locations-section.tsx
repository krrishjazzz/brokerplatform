"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Pencil, X } from "lucide-react";

type LocationRow = {
  id: string;
  name: string;
  slug: string;
  type: string;
  parentId: string | null;
  cityId: string | null;
  state: string;
  aliases: string[];
  priority: number;
  isActive: boolean;
};

type LocationForm = {
  name: string;
  type: string;
  aliases: string;
  priority: string;
  cityId: string;
};

const EMPTY_FORM: LocationForm = {
  name: "",
  type: "locality",
  aliases: "",
  priority: "50",
  cityId: "",
};

function rowToForm(row: LocationRow): LocationForm {
  return {
    name: row.name,
    type: row.type,
    aliases: row.aliases.join(", "),
    priority: String(row.priority),
    cityId: row.cityId || "",
  };
}

export function LocationsSection() {
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<LocationForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<LocationForm>(EMPTY_FORM);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/locations", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setLocations(data.locations || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const parseAliases = (raw: string) =>
    raw
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

  const handleCreate = async () => {
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/locations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          type: form.type,
          aliases: parseAliases(form.aliases),
          priority: Number(form.priority) || 0,
          cityId: form.cityId || null,
          state: "West Bengal",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save location");
        return;
      }
      setForm({ ...EMPTY_FORM, cityId: form.cityId });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (row: LocationRow) => {
    setEditingId(row.id);
    setEditForm(rowToForm(row));
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
    setError("");
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/locations", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          name: editForm.name.trim(),
          type: editForm.type,
          aliases: parseAliases(editForm.aliases),
          priority: Number(editForm.priority) || 0,
          cityId: editForm.type === "city" ? undefined : editForm.cityId || null,
          state: "West Bengal",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not update location");
        return;
      }
      cancelEdit();
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row: LocationRow) => {
    setError("");
    const res = await fetch("/api/admin/locations", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, isActive: !row.isActive }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not update status");
      return;
    }
    await load();
  };

  const cities = locations.filter((l) => l.type === "city");

  const renderFormFields = (
    values: LocationForm,
    onChange: (patch: Partial<LocationForm>) => void,
    idPrefix: string
  ) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <Input
        label="Name"
        value={values.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="e.g. Salt Lake"
      />
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-foreground">Type</span>
        <select
          className="w-full rounded-btn border border-border px-3 py-2 text-sm"
          value={values.type}
          onChange={(e) => onChange({ type: e.target.value })}
        >
          <option value="city">City</option>
          <option value="zone">Zone / Region</option>
          <option value="locality">Locality</option>
          <option value="sublocality">Sub-locality</option>
          <option value="landmark">Landmark</option>
        </select>
      </label>
      <Input
        label="Aliases (comma-separated)"
        value={values.aliases}
        onChange={(e) => onChange({ aliases: e.target.value })}
        placeholder="Saltlake, Bidhannagar"
      />
      <Input
        label="Priority"
        type="number"
        value={values.priority}
        onChange={(e) => onChange({ priority: e.target.value })}
      />
      {cities.length > 0 && values.type !== "city" && (
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block font-medium text-foreground">Parent city</span>
          <select
            className="w-full rounded-btn border border-border px-3 py-2 text-sm"
            value={values.cityId}
            onChange={(e) => onChange({ cityId: e.target.value })}
          >
            <option value="">Select city</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <p className="sm:col-span-2 text-xs text-text-secondary" id={`${idPrefix}-hint`}>
        Slug updates automatically when you change the name.
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Locations</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage cities, zones, localities, aliases, and priority — no code deploy needed.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-error/30 bg-error-light px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="rounded-card border border-border bg-white p-5 shadow-card">
        <h2 className="text-sm font-bold text-foreground">Add location</h2>
        <div className="mt-4">
          {renderFormFields(form, (patch) => setForm((f) => ({ ...f, ...patch })), "create")}
        </div>
        <Button className="mt-4" onClick={handleCreate} loading={saving} disabled={!form.name.trim() || !!editingId}>
          Add location
        </Button>
      </div>

      {editingId && (
        <div className="rounded-card border border-primary/30 bg-primary-light/20 p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-foreground">Edit location</h2>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg p-1.5 text-text-secondary hover:bg-white"
              aria-label="Cancel edit"
            >
              <X size={16} />
            </button>
          </div>
          {renderFormFields(editForm, (patch) => setEditForm((f) => ({ ...f, ...patch })), "edit")}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={handleUpdate} loading={saving} disabled={!editForm.name.trim()}>
              Save changes
            </Button>
            <Button variant="outline" onClick={cancelEdit} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-card border border-border bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface text-xs font-bold uppercase text-text-secondary">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Aliases</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-border last:border-0 ${
                  editingId === row.id ? "bg-primary-light/30" : ""
                }`}
              >
                <td className="px-4 py-3 font-medium">
                  {row.name}
                  <p className="mt-0.5 text-xs font-normal text-text-secondary">{row.slug}</p>
                </td>
                <td className="px-4 py-3 text-text-secondary">{row.type}</td>
                <td className="max-w-[200px] truncate px-4 py-3 text-text-secondary">
                  {row.aliases.join(", ") || "—"}
                </td>
                <td className="px-4 py-3">{row.priority}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(row)}
                    disabled={!!editingId}
                    className={
                      row.isActive
                        ? "text-xs font-semibold text-success"
                        : "text-xs font-semibold text-text-secondary"
                    }
                  >
                    {row.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => startEdit(row)}
                    disabled={!!editingId && editingId !== row.id}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
