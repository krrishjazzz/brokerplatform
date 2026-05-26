"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

type LocationRow = {
  id: string;
  name: string;
  slug: string;
  type: string;
  cityId: string | null;
  state: string;
  aliases: string[];
  priority: number;
  isActive: boolean;
};

export function LocationsSection() {
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "locality",
    aliases: "",
    priority: "50",
    cityId: "",
  });
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

  const handleCreate = async () => {
    setError("");
    setSaving(true);
    try {
      const aliases = form.aliases
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
      const res = await fetch("/api/admin/locations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          type: form.type,
          aliases,
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
      setForm({ name: "", type: "locality", aliases: "", priority: "50", cityId: form.cityId });
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row: LocationRow) => {
    await fetch("/api/admin/locations", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, isActive: !row.isActive }),
    });
    await load();
  };

  const cities = locations.filter((l) => l.type === "city");

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

      <div className="rounded-card border border-border bg-white p-5 shadow-card">
        <h2 className="text-sm font-bold text-foreground">Add location</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Salt Lake"
          />
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-foreground">Type</span>
            <select
              className="w-full rounded-btn border border-border px-3 py-2 text-sm"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
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
            value={form.aliases}
            onChange={(e) => setForm((f) => ({ ...f, aliases: e.target.value }))}
            placeholder="Saltlake, Bidhannagar"
          />
          <Input
            label="Priority"
            type="number"
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
          />
          {cities.length > 0 && form.type !== "city" && (
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1.5 block font-medium text-foreground">Parent city</span>
              <select
                className="w-full rounded-btn border border-border px-3 py-2 text-sm"
                value={form.cityId}
                onChange={(e) => setForm((f) => ({ ...f, cityId: e.target.value }))}
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
        </div>
        {error && <p className="mt-2 text-sm text-error">{error}</p>}
        <Button className="mt-4" onClick={handleCreate} loading={saving} disabled={!form.name.trim()}>
          Add location
        </Button>
      </div>

      <div className="overflow-hidden rounded-card border border-border bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface text-xs font-bold uppercase text-text-secondary">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Aliases</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3 text-text-secondary">{row.type}</td>
                <td className="max-w-[200px] truncate px-4 py-3 text-text-secondary">
                  {row.aliases.join(", ") || "—"}
                </td>
                <td className="px-4 py-3">{row.priority}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(row)}
                    className={
                      row.isActive
                        ? "text-xs font-semibold text-success"
                        : "text-xs font-semibold text-text-secondary"
                    }
                  >
                    {row.isActive ? "Active" : "Inactive"}
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
