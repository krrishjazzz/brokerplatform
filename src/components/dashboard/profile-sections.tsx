"use client";

import { useState } from "react";
import { Check, Clock, Edit, Mail, Phone, User, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import { INDIAN_CITIES } from "@/lib/constants";

type DashboardUser = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string;
  role: string;
};

export function ProfileSection({ user }: { user: DashboardUser }) {
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email }),
      });
      if (res.ok) {
        await refreshUser();
        setEditing(false);
        toast("Profile updated.", "success");
      }
    } catch {
      toast("Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-foreground">Profile</h2>
        <p className="text-sm text-text-secondary mt-1">Manage your account details and broker identity.</p>
      </div>
      <div className="bg-white rounded-card shadow-card border border-border overflow-hidden max-w-lg">
        <div className="h-2 bg-gradient-to-r from-primary via-success to-accent" />
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary text-white shadow-sm flex items-center justify-center font-bold text-xl">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{user.name || "User"}</p>
              <Badge variant={user.role === "ADMIN" ? "error" : user.role === "BROKER" ? "blue" : user.role === "OWNER" ? "accent" : "default"}>
                {user.role}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-1">
                <User size={14} /> Name
              </label>
              {editing ? (
                <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
              ) : (
                <p className="text-sm text-text-secondary px-3 py-2 bg-surface border border-border rounded-btn">{user.name || "-"}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-1">
                <Mail size={14} /> Email
              </label>
              {editing ? (
                <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="your@email.com" />
              ) : (
                <p className="text-sm text-text-secondary px-3 py-2 bg-surface border border-border rounded-btn">{user.email || "-"}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-1">
                <Phone size={14} /> Phone
              </label>
              <p className="text-sm text-text-secondary px-3 py-2 bg-surface border border-border rounded-btn">{user.phone}</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            {editing ? (
              <>
                <Button onClick={handleSave} loading={saving}>Save Changes</Button>
                <Button variant="ghost" onClick={() => { setEditing(false); setName(user.name || ""); setEmail(user.email || ""); }}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Edit size={14} className="mr-1.5" /> Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ApplicationStatusSection({ brokerStatus }: { brokerStatus?: string | null }) {
  const { toast } = useToast();
  const [showReapply, setShowReapply] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    rera: "",
    experience: "",
    city: "",
    serviceAreas: "",
    bio: "",
  });

  const submitReapply = async () => {
    if (!form.rera || !form.experience || !form.city || !form.bio) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/broker/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          experience: Number(form.experience),
        }),
      });
      if (res.ok) {
        toast("Broker re-application submitted.", "success");
        window.location.reload();
        return;
      }
      const error = await res.json();
      toast(error.error || "Could not submit broker re-application", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-6">Application Status</h2>
      <div className="bg-white rounded-card shadow-card border border-border p-8 max-w-lg">
        {brokerStatus === "PENDING" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Under Review</h3>
            <p className="text-text-secondary">
              Your broker application is currently being reviewed by our admin team. We&apos;ll notify you once a decision has been made.
            </p>
            <Badge variant="warning" className="mt-4">PENDING</Badge>
          </div>
        )}
        {brokerStatus === "REJECTED" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-error" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Application Rejected</h3>
            <p className="text-text-secondary">
              Update your details and send it back to KrrishJazz ops for review.
            </p>
            <Badge variant="error" className="mt-4">REJECTED</Badge>
            <Button className="mt-5" variant="outline" onClick={() => setShowReapply((value) => !value)}>
              {showReapply ? "Hide Re-application" : "Re-apply as Broker"}
            </Button>
          </div>
        )}
        {brokerStatus === "APPROVED" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Approved</h3>
            <p className="text-text-secondary">Your broker application has been approved. You can now list properties.</p>
            <Badge variant="success" className="mt-4">APPROVED</Badge>
          </div>
        )}
        {!brokerStatus && (
          <div className="text-center">
            <p className="text-text-secondary">No broker application found.</p>
          </div>
        )}
      </div>
      {brokerStatus === "REJECTED" && showReapply && (
        <div className="mt-5 max-w-lg rounded-card border border-border bg-white p-5 shadow-card">
          <h3 className="text-sm font-semibold text-foreground">Broker Re-application</h3>
          <p className="mt-1 text-xs text-text-secondary">Add stronger trust details: RERA, active city, service areas, and practical market experience.</p>
          <div className="mt-4 space-y-3">
            <Input label="RERA Registration Number" value={form.rera} onChange={(event) => setForm({ ...form, rera: event.target.value })} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Years of Experience" type="number" value={form.experience} onChange={(event) => setForm({ ...form, experience: event.target.value })} />
              <Select
                label="Primary City"
                options={[{ value: "", label: "Select city" }, ...INDIAN_CITIES.map((city) => ({ value: city, label: city }))]}
                value={form.city}
                onChange={(event) => setForm({ ...form, city: event.target.value })}
              />
            </div>
            <Input label="Service Areas" placeholder="e.g. Salt Lake, Park Street, New Town" value={form.serviceAreas} onChange={(event) => setForm({ ...form, serviceAreas: event.target.value })} />
            <Textarea label="Broker Bio" placeholder="Your strongest local markets, inventory type, and collaboration style." value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} />
            <Button onClick={submitReapply} loading={submitting} disabled={!form.rera || !form.experience || !form.city || !form.bio}>
              Submit Re-application
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
