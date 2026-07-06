"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BrokerPageShell } from "@/components/broker/broker-shell";
import { useBrokerAuthGuard, useBrokerProfile } from "@/features/broker-exchange";
import { useToast } from "@/components/ui/toast";

export default function BrokerProfilePage() {
  const { toast } = useToast();
  const { user, loading: authLoading, isReady } = useBrokerAuthGuard();
  const { profile, loading, saving, updateProfile } = useBrokerProfile(isReady);
  const [bio, setBio] = useState("");
  const [serviceAreasText, setServiceAreasText] = useState("");

  useEffect(() => {
    if (profile) {
      setBio(profile.bio);
      setServiceAreasText(profile.serviceAreas.join(", "));
    }
  }, [profile]);

  const handleSave = async () => {
    const serviceAreas = serviceAreasText
      .split(",")
      .map((area) => area.trim())
      .filter(Boolean);

    if (serviceAreas.length === 0) {
      toast("Add at least one service area.", "error");
      return;
    }

    const ok = await updateProfile({ bio, serviceAreas });
    toast(ok ? "Profile updated." : "Failed to update profile.", ok ? "success" : "error");
  };

  if (authLoading || !user || !isReady) return null;

  return (
    <BrokerPageShell
      title="Partner profile"
      subtitle="Trust signals visible to other brokers in the network."
    >
      <div className="mx-auto max-w-3xl px-4 py-6 lg:px-6">
        {loading || !profile ? (
          <div className="flex h-64 items-center justify-center rounded-card border border-border bg-white">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-card border border-border bg-white p-5 shadow-card">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-foreground">{profile.name || "Partner broker"}</p>
                  <p className="text-sm text-text-secondary">{profile.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{profile.profileCompletion}%</p>
                  <p className="text-xs text-text-secondary">Profile strength</p>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${profile.profileCompletion}%` }}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatTile label="Response score" value={`${profile.responseScore}/100`} />
              <StatTile label="Collaborations" value={String(profile.completedCollaborations)} />
              <StatTile label="Experience" value={`${profile.experience} yrs`} />
            </div>

            <div className="rounded-card border border-border bg-white p-5 shadow-card">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck size={16} className="text-success" />
                Verified credentials
              </div>
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-text-secondary">RERA ID</dt>
                  <dd className="font-medium text-foreground">{profile.rera}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">Primary city</dt>
                  <dd className="font-medium text-foreground">{profile.city}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">Status</dt>
                  <dd className="font-medium text-success">{profile.status}</dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary">Last active</dt>
                  <dd className="font-medium text-foreground">
                    {profile.lastActiveAt
                      ? new Date(profile.lastActiveAt).toLocaleString("en-IN")
                      : "Recently"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-card border border-border bg-white p-5 shadow-card space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Bio</label>
                <Textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={4}
                  placeholder="Describe your specialization, areas, and deal types..."
                />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-1 text-sm font-semibold text-foreground">
                  <MapPin size={14} />
                  Service areas
                </label>
                <Input
                  value={serviceAreasText}
                  onChange={(event) => setServiceAreasText(event.target.value)}
                  placeholder="Salt Lake, New Town, Park Street..."
                />
                <p className="mt-1 text-xs text-text-secondary">Comma-separated localities you actively cover.</p>
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save profile"}
              </Button>
            </div>

            {profile.rejectionReason && (
              <div className="rounded-card border border-error/30 bg-error-light/40 p-4 text-sm text-foreground">
                Previous application note: {profile.rejectionReason}
              </div>
            )}
          </div>
        )}
      </div>
    </BrokerPageShell>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-border bg-white px-4 py-3 shadow-sm">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
